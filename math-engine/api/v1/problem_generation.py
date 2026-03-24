import json
import logging
import random
import re
from typing import Any, Dict, Optional

import sympy as sp
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from dmc_ai.chatbot import get_chatbot_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix='/api/v1/problem_generation', tags=['Problem Generation'])


class GenerateRequest(BaseModel):
    topicSlug: Optional[str] = None
    difficulty: Optional[str] = None
    skillLevel: Optional[str] = None
    module: Optional[str] = None


class VerifyRequest(BaseModel):
    questionText: str
    candidateAnswer: Any
    expectedAnswer: Optional[Any] = None
    answerExpression: Optional[str] = None
    operation: Optional[str] = None
    params: Optional[Dict[str, Any]] = None


def _clean_llm_json(text: str) -> str:
    """Extract valid JSON from LLM output that may be wrapped in markdown fences or commentary."""
    value = text.strip()

    # Strip ```json ... ``` or ``` ... ``` fences (handles optional language tag)
    fence_match = re.search(r'```(?:json|JSON)?\s*\n?(.*?)```', value, re.DOTALL)
    if fence_match:
        value = fence_match.group(1).strip()

    # If the whole string still starts with ```, do a simpler strip
    if value.startswith('```'):
        value = value.lstrip('`').strip()
        if value.lower().startswith('json'):
            value = value[4:].strip()
    if value.endswith('```'):
        value = value[:-3].strip()

    # Try to extract JSON object even if surrounded by prose
    brace_start = value.find('{')
    brace_end = value.rfind('}')
    if brace_start != -1 and brace_end > brace_start:
        value = value[brace_start:brace_end + 1]

    return value.strip()


def _difficulty_score(raw: Optional[str]) -> float:
    if not raw:
        return 0.60
    normalized = raw.strip().upper()
    if normalized == 'EASY':
        return 0.35
    if normalized == 'HARD':
        return 0.85
    return 0.60


def _fallback_generated(topic_slug: Optional[str], difficulty: Optional[str]) -> Dict[str, Any]:
    n = random.randint(6, 12)
    k = random.randint(2, min(5, n - 1))
    expr = '{{n}}! / ({{k}}! * ({{n}}-{{k}})!)'
    resolved = expr.replace('{{n}}', str(n)).replace('{{k}}', str(k))
    expected = int(sp.N(sp.sympify(resolved)))
    return {
        'questionText': f'Find C({n}, {k}).',
        'parameters': {'n': n, 'k': k},
        'answerExpression': expr,
        'correctAnswer': expected,
        'operation': 'combination',
        'difficultyScore': _difficulty_score(difficulty),
        'topicSlug': topic_slug or 'combinatorics',
        'sourceModel': 'fallback-template',
    }


@router.post('/generate')
def generate_problem(req: GenerateRequest):
    service = get_chatbot_service()
    topic_slug = req.topicSlug or 'combinatorics'
    difficulty = (req.difficulty or 'MEDIUM').upper()
    skill_level = req.skillLevel or 'intermediate'

    system_prompt = (
        'You are a discrete-math problem generator. '
        'RESPOND WITH RAW JSON ONLY. '
        'DO NOT wrap the response in markdown code fences (```). '
        'DO NOT add any text before or after the JSON object. '
        'The JSON must have exactly these keys: questionText (string), parameters (object with numeric values), '
        'answerExpression (algebraic/symbolic string using {{key}} placeholders), operation (string). '
        'Example: {"questionText":"Find C(5,2).","parameters":{"n":5,"k":2},'
        '"answerExpression":"{{n}}! / ({{k}}! * ({{n}}-{{k}})!)","operation":"combination"}'
    )
    user_prompt = (
        f'Generate one discrete math problem for topic={topic_slug}, difficulty={difficulty}, '
        f'skillLevel={skill_level}. Keep it solvable by symbolic expression. '
        'Return raw JSON only, no markdown.'
    )

    result = service.chat(
        [
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': user_prompt},
        ],
        subject='discrete-math',
        module=topic_slug,
    )

    if 'error' in result:
        logger.warning('LLM returned error during generation: %s', result['error'])
        fallback = _fallback_generated(topic_slug, difficulty)
        fallback['llmError'] = result['error']
        return fallback

    raw_reply = str(result.get('reply', ''))
    cleaned = _clean_llm_json(raw_reply)
    try:
        parsed = json.loads(cleaned)
        question = parsed.get('questionText')
        params = parsed.get('parameters')
        answer_expression = parsed.get('answerExpression')
        operation = parsed.get('operation')
        if not question or not isinstance(params, dict) or not answer_expression or not operation:
            raise ValueError('Missing required keys in generated JSON')

        resolved = answer_expression
        for key, value in params.items():
            resolved = resolved.replace('{{' + str(key) + '}}', str(value))
        expected = sp.sympify(resolved)
        expected_num = float(sp.N(expected))
        if expected_num.is_integer():
            expected_value: Any = int(expected_num)
        else:
            expected_value = expected_num

        return {
            'questionText': question,
            'parameters': params,
            'answerExpression': answer_expression,
            'correctAnswer': expected_value,
            'operation': operation,
            'difficultyScore': _difficulty_score(difficulty),
            'topicSlug': topic_slug,
            'sourceModel': result.get('model', 'gemini'),
        }
    except Exception as exc:
        logger.warning('Failed to parse LLM generation reply: %s — raw: %s', exc, raw_reply[:300])
        fallback = _fallback_generated(topic_slug, difficulty)
        fallback['rawReply'] = raw_reply[:500]
        return fallback


@router.post('/verify')
def verify_answer(req: VerifyRequest):
    # First, deterministic symbolic verification when expression is available.
    if req.answerExpression and req.operation and req.params:
        try:
            expr = req.answerExpression
            for key, value in req.params.items():
                expr = expr.replace('{{' + str(key) + '}}', str(value))
            expected = sp.sympify(expr)
            candidate = sp.sympify(str(req.candidateAnswer))
            correct = sp.simplify(expected - candidate) == 0
            return {
                'correct': bool(correct),
                'confidence': 0.99 if correct else 0.35,
                'method': 'symbolic',
                'feedback': 'Symbolic verification completed',
            }
        except Exception:
            pass

    # Semantic evaluation fallback via LLM judge.
    service = get_chatbot_service()
    judge_system = (
        'You are a strict math answer checker. '
        'RESPOND WITH RAW JSON ONLY. '
        'DO NOT wrap the response in markdown code fences (```). '
        'DO NOT add any text before or after the JSON. '
        'The JSON must have exactly these keys: correct (boolean), confidence (number 0 to 1), feedback (string). '
        'The feedback should be a helpful educational hint if incorrect.'
    )
    judge_user = (
        f'Question: {req.questionText}\n'
        f'Expected answer: {req.expectedAnswer}\n'
        f'Candidate answer: {req.candidateAnswer}\n'
        'Decide if candidate is mathematically correct. Return raw JSON only.'
    )
    result = service.chat(
        [
            {'role': 'system', 'content': judge_system},
            {'role': 'user', 'content': judge_user},
        ],
        subject='discrete-math',
        module='verification',
    )

    if 'error' in result:
        logger.warning('LLM judge returned error: %s', result['error'])
        if req.expectedAnswer is not None:
            correct = str(req.expectedAnswer).strip() == str(req.candidateAnswer).strip()
            return {
                'correct': correct,
                'confidence': 0.60 if correct else 0.30,
                'method': 'semantic-fallback',
                'feedback': 'Automatic comparison used — AI verification was unavailable.',
            }
        raise HTTPException(status_code=502, detail=result['error'])

    raw_reply = str(result.get('reply', ''))
    cleaned = _clean_llm_json(raw_reply)
    try:
        parsed = json.loads(cleaned)
        return {
            'correct': bool(parsed.get('correct', False)),
            'confidence': float(parsed.get('confidence', 0.5)),
            'method': 'semantic',
            'feedback': str(parsed.get('feedback', 'Semantic verification completed')),
        }
    except Exception as exc:
        logger.warning('Failed to parse LLM judge reply: %s — raw: %s', exc, raw_reply[:300])
        if req.expectedAnswer is not None:
            correct = str(req.expectedAnswer).strip() == str(req.candidateAnswer).strip()
            return {
                'correct': correct,
                'confidence': 0.58 if correct else 0.28,
                'method': 'semantic-fallback',
                'feedback': 'Automatic comparison used — could not parse AI verification.',
            }
        raise HTTPException(status_code=400, detail='Semantic verification parsing failed')
