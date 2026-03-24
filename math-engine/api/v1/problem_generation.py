import json
import random
from typing import Any, Dict, Optional

import sympy as sp
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from dmc_ai.chatbot import get_chatbot_service


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


def _strip_code_fence(text: str) -> str:
    value = text.strip()
    if value.startswith('```'):
        value = value.split('\n', 1)[1] if '\n' in value else value
        if value.endswith('```'):
            value = value[:-3]
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
        'Return ONLY valid JSON with keys: questionText, parameters, answerExpression, operation. '
        'Use algebraic/symbolic format for answerExpression. No markdown, no commentary.'
    )
    user_prompt = (
        f'Generate one discrete math problem for topic={topic_slug}, difficulty={difficulty}, '
        f'skillLevel={skill_level}. Keep it solvable by symbolic expression.'
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
        fallback = _fallback_generated(topic_slug, difficulty)
        fallback['llmError'] = result['error']
        return fallback

    raw_reply = _strip_code_fence(str(result.get('reply', '')))
    try:
        parsed = json.loads(raw_reply)
        question = parsed.get('questionText')
        params = parsed.get('parameters')
        answer_expression = parsed.get('answerExpression')
        operation = parsed.get('operation')
        if not question or not isinstance(params, dict) or not answer_expression or not operation:
            raise ValueError('Missing required keys in generated JSON')

        # Ensure symbolic expression can actually be evaluated with provided params.
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
            'sourceModel': 'gemini',
        }
    except Exception:
        fallback = _fallback_generated(topic_slug, difficulty)
        fallback['rawReply'] = raw_reply
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
        'You are a strict math checker. Return ONLY JSON with keys: correct (boolean), confidence (0..1), feedback (string).'
    )
    judge_user = (
        f'Question: {req.questionText}\n'
        f'Expected answer: {req.expectedAnswer}\n'
        f'Candidate answer: {req.candidateAnswer}\n'
        'Decide if candidate is mathematically correct.'
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
        if req.expectedAnswer is not None:
            correct = str(req.expectedAnswer).strip() == str(req.candidateAnswer).strip()
            return {
                'correct': correct,
                'confidence': 0.60 if correct else 0.30,
                'method': 'semantic-fallback',
                'feedback': 'Fallback text comparison used due to AI verification issue',
            }
        raise HTTPException(status_code=502, detail=result['error'])

    raw_reply = _strip_code_fence(str(result.get('reply', '')))
    try:
        parsed = json.loads(raw_reply)
        return {
            'correct': bool(parsed.get('correct', False)),
            'confidence': float(parsed.get('confidence', 0.5)),
            'method': 'semantic',
            'feedback': str(parsed.get('feedback', 'Semantic verification completed')),
        }
    except Exception:
        if req.expectedAnswer is not None:
            correct = str(req.expectedAnswer).strip() == str(req.candidateAnswer).strip()
            return {
                'correct': correct,
                'confidence': 0.58 if correct else 0.28,
                'method': 'semantic-fallback',
                'feedback': 'Could not parse AI judge response; fallback comparison used',
            }
        raise HTTPException(status_code=400, detail='Semantic verification parsing failed')