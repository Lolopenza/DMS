import json
import logging
import random
import re
from typing import Any, Dict, Optional

import sympy as sp
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, StrictBool, ValidationError
from sympy.parsing.sympy_parser import parse_expr

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


class JudgeResponse(BaseModel):
    correct: StrictBool
    confidence: float = Field(..., ge=0.0, le=1.0)
    feedback: str = Field(..., min_length=1, max_length=2000)


MAX_EXPRESSION_LENGTH = 300
MAX_OPERATOR_TOKENS = 80
ALLOWED_EXPR_RE = re.compile(r"^[0-9A-Za-z_+\-*/().,\s<>=!&|~^%]*$")
FORBIDDEN_EXPR_SUBSTRINGS = ('__', 'import', 'lambda', 'eval', 'exec', 'open(', 'os.', 'sys.', 'subprocess')
ALLOWED_FUNCTIONS = {
    'Abs': sp.Abs,
    'sqrt': sp.sqrt,
    'log': sp.log,
    'exp': sp.exp,
    'sin': sp.sin,
    'cos': sp.cos,
    'tan': sp.tan,
    'Min': sp.Min,
    'Max': sp.Max,
}
SAFE_EVAL_GLOBALS = {'__builtins__': {}}
SAFE_EVAL_LOCALS_BASE = {
    'Integer': sp.Integer,
    'Rational': sp.Rational,
    'Float': sp.Float,
    'factorial': sp.factorial,
}


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


def _normalize_logic_expression(expr: str) -> str:
    if not expr:
        return expr
    return (
        expr.replace('¬', '~')
        .replace('∧', '&')
        .replace('∨', '|')
        .replace('→', '>>')
        .replace('⇒', '>>')
    )


def _validate_expression_safety(expr: str) -> None:
    if expr is None:
        raise ValueError('Expression is missing')
    if len(expr) > MAX_EXPRESSION_LENGTH:
        raise ValueError(f'Expression is too long ({len(expr)} > {MAX_EXPRESSION_LENGTH})')
    if not ALLOWED_EXPR_RE.match(expr):
        raise ValueError('Expression contains unsupported characters')
    lowered = expr.lower()
    for forbidden in FORBIDDEN_EXPR_SUBSTRINGS:
        if forbidden in lowered:
            raise ValueError(f'Expression contains forbidden token: {forbidden}')
    operators = re.findall(r'(\*\*|>>|<<|[+\-*/%^&|~])', expr)
    if len(operators) > MAX_OPERATOR_TOKENS:
        raise ValueError('Expression is too complex')
    if re.search(r'\*\*\s*\d{4,}', expr):
        raise ValueError('Exponent is too large')


def _safe_parse_expression(expr: str) -> Any:
    normalized = _normalize_logic_expression(expr)
    _validate_expression_safety(normalized)
    token_candidates = set(re.findall(r'\b[A-Za-z_][A-Za-z0-9_]*\b', normalized))
    local_dict = dict(SAFE_EVAL_LOCALS_BASE)
    local_dict.update(ALLOWED_FUNCTIONS)
    for token in token_candidates:
        if token in ALLOWED_FUNCTIONS:
            continue
        if token in {'True', 'False'}:
            local_dict[token] = sp.true if token == 'True' else sp.false
            continue
        local_dict[token] = sp.Symbol(token, real=True)
    try:
        return parse_expr(normalized, local_dict=local_dict, global_dict=SAFE_EVAL_GLOBALS, evaluate=True)
    except Exception as exc:
        raise ValueError(f'Unsafe or invalid expression: {exc}') from exc


def _answers_equivalent(expected: Any, candidate: Any) -> bool:
    expected_expr = _safe_parse_expression(str(expected))
    candidate_expr = _safe_parse_expression(str(candidate))
    try:
        return sp.simplify(expected_expr - candidate_expr) == 0
    except Exception:
        return bool(expected_expr.equals(candidate_expr))


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
    slug = (topic_slug or 'combinatorics').strip().lower()

    if slug == 'graph_theory':
        n = random.randint(4, 9)
        expr = '{{n}} * ({{n}} - 1) / 2'
        resolved = expr.replace('{{n}}', str(n))
        expected = int(sp.N(_safe_parse_expression(resolved)))
        return {
            'questionText': f'How many edges does the complete graph K{n} have?',
            'parameters': {'n': n},
            'answerExpression': expr,
            'correctAnswer': expected,
            'operation': 'graph_edges_complete',
            'difficultyScore': _difficulty_score(difficulty),
            'topicSlug': slug,
            'sourceModel': 'fallback-template',
        }

    if slug == 'logic':
        p = random.randint(0, 1)
        q = random.randint(0, 1)
        expr = '1 - ({{p}} * {{q}})'
        resolved = expr.replace('{{p}}', str(p)).replace('{{q}}', str(q))
        expected = int(sp.N(_safe_parse_expression(resolved)))
        return {
            'questionText': f'Evaluate NAND(p, q) for p={p}, q={q} (use 0/1).',
            'parameters': {'p': p, 'q': q},
            'answerExpression': expr,
            'correctAnswer': expected,
            'operation': 'logic_nand',
            'difficultyScore': _difficulty_score(difficulty),
            'topicSlug': slug,
            'sourceModel': 'fallback-template',
        }

    if slug == 'number_theory':
        a = random.randint(12, 70)
        b = random.randint(12, 70)
        expected = int(sp.gcd(a, b))
        return {
            'questionText': f'Find gcd({a}, {b}).',
            'parameters': {'a': a, 'b': b},
            'answerExpression': str(expected),
            'correctAnswer': expected,
            'operation': 'number_gcd',
            'difficultyScore': _difficulty_score(difficulty),
            'topicSlug': slug,
            'sourceModel': 'fallback-template',
        }

    if slug == 'set_theory':
        a = random.randint(5, 18)
        b = random.randint(5, 18)
        inter = random.randint(0, min(a, b))
        expr = '{{a}} + {{b}} - {{inter}}'
        resolved = expr.replace('{{a}}', str(a)).replace('{{b}}', str(b)).replace('{{inter}}', str(inter))
        expected = int(sp.N(_safe_parse_expression(resolved)))
        return {
            'questionText': f'If |A|={a}, |B|={b}, |A∩B|={inter}, find |A∪B|.',
            'parameters': {'a': a, 'b': b, 'inter': inter},
            'answerExpression': expr,
            'correctAnswer': expected,
            'operation': 'set_union_cardinality',
            'difficultyScore': _difficulty_score(difficulty),
            'topicSlug': slug,
            'sourceModel': 'fallback-template',
        }

    # Default: combinatorics
    n = random.randint(6, 12)
    k = random.randint(2, min(5, n - 1))
    expr = '{{n}}! / ({{k}}! * ({{n}}-{{k}})!)'
    resolved = expr.replace('{{n}}', str(n)).replace('{{k}}', str(k))
    expected = int(sp.N(_safe_parse_expression(resolved)))
    return {
        'questionText': f'Find C({n}, {k}).',
        'parameters': {'n': n, 'k': k},
        'answerExpression': expr,
        'correctAnswer': expected,
        'operation': 'combination',
        'difficultyScore': _difficulty_score(difficulty),
        'topicSlug': slug,
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
        'The JSON must have exactly these keys: questionText (string), parameters (object), '
        'answerExpression (algebraic/symbolic string using {{key}} placeholders), operation (string), correctAnswer (number or boolean). '
        'Example: {"questionText":"Find C(5,2).","parameters":{"n":5,"k":2},'
        '"answerExpression":"{{n}}! / ({{k}}! * ({{n}}-{{k}})!)","operation":"combination","correctAnswer":10}'
    )
    user_prompt = (
        f'Generate one discrete math problem for topic={topic_slug}, difficulty={difficulty}, '
        f'skillLevel={skill_level}. Keep it solvable by symbolic expression. '
        'Return raw JSON only, no markdown. '
        'For logic topic, use boolean-compatible expression with operators ~, &, |, >> and provide correctAnswer as 0/1 or true/false.'
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
        question = parsed.get('questionText') or parsed.get('question') or parsed.get('problemText')
        params = parsed.get('parameters') or parsed.get('params')
        answer_expression = parsed.get('answerExpression') or parsed.get('expression')
        operation = parsed.get('operation') or parsed.get('op')
        parsed_correct_answer = parsed.get('correctAnswer')
        if not question or not isinstance(params, dict) or not answer_expression or not operation:
            raise ValueError('Missing required keys in generated JSON')

        resolved = answer_expression
        for key, value in params.items():
            normalized_value = int(value) if isinstance(value, bool) else value
            resolved = resolved.replace('{{' + str(key) + '}}', str(normalized_value))

        expected_value: Any
        if parsed_correct_answer is not None:
            expected_value = int(parsed_correct_answer) if isinstance(parsed_correct_answer, bool) else parsed_correct_answer
        else:
            expected = _safe_parse_expression(resolved)
            expected_num = float(sp.N(expected))
            if expected_num.is_integer():
                expected_value = int(expected_num)
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
    if req.answerExpression:
        try:
            expr = req.answerExpression
            for key, value in (req.params or {}).items():
                expr = expr.replace('{{' + str(key) + '}}', str(value))
            expected = _safe_parse_expression(expr)
            candidate = _safe_parse_expression(str(req.candidateAnswer))
            try:
                correct = sp.simplify(expected - candidate) == 0
            except Exception:
                correct = bool(expected.equals(candidate))
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
            try:
                correct = _answers_equivalent(req.expectedAnswer, req.candidateAnswer)
            except Exception:
                correct = False
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
        parsed = JudgeResponse.model_validate(json.loads(cleaned))
        return {
            'correct': parsed.correct,
            'confidence': parsed.confidence,
            'method': 'semantic',
            'feedback': parsed.feedback,
        }
    except (json.JSONDecodeError, ValidationError, ValueError) as exc:
        logger.warning('Failed to parse LLM judge reply: %s — raw: %s', exc, raw_reply[:300])
        if req.expectedAnswer is not None:
            try:
                correct = _answers_equivalent(req.expectedAnswer, req.candidateAnswer)
            except Exception:
                correct = False
            return {
                'correct': correct,
                'confidence': 0.58 if correct else 0.28,
                'method': 'semantic-fallback',
                'feedback': 'Automatic comparison used — could not parse AI verification.',
            }
        raise HTTPException(status_code=400, detail='Semantic verification parsing failed')
