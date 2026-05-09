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
    careerTrack: Optional[str] = None
    module: Optional[str] = None


class VerifyRequest(BaseModel):
    questionText: str
    candidateAnswer: Any
    expectedAnswer: Optional[Any] = None
    answerExpression: Optional[str] = None
    operation: Optional[str] = None
    params: Optional[Dict[str, Any]] = None
    judgeMode: Optional[str] = None  # "math" (default) | "code"
    language: Optional[str] = None  # e.g. "python"


class JudgeResponse(BaseModel):
    correct: StrictBool
    confidence: float = Field(..., ge=0.0, le=1.0)
    feedback: str = Field(..., min_length=1, max_length=2000)


CODE_PRACTICE_TOPICS = frozenset({'sorting', 'searching', 'recursion', 'asymptotic_analysis'})

# Code-to-math (Math Bug Hunter): must be routed before CODE_PRACTICE_TOPICS.
CODE_TO_MATH_TOPICS = frozenset({'code_complexity', 'code_recurrence'})

ALLOWED_CAREER_TRACKS = frozenset({'NONE', 'BACKEND_ARCHITECT', 'DATA_SCIENTIST', 'GAME_DEVELOPER'})

CAREER_CONTEXTS = {
    'BACKEND_ARCHITECT': (
        'Frame this problem in a backend/systems context: APIs, databases, '
        'microservices, caching, load balancing, message queues, distributed systems.'
    ),
    'DATA_SCIENTIST': (
        'Frame this problem in a data science context: ML pipelines, feature engineering, '
        'data transformations, model training, statistical analysis, data cleaning.'
    ),
    'GAME_DEVELOPER': (
        'Frame this problem in a game development context: game engines, physics simulation, '
        'rendering pipelines, collision detection, AI/pathfinding, animation systems.'
    ),
}


def _normalize_career_track(raw: Optional[str]) -> str:
    if not raw or not str(raw).strip():
        return 'NONE'
    key = str(raw).strip().upper()
    return key if key in ALLOWED_CAREER_TRACKS else 'NONE'


def _career_prompt_fragment(track: str) -> str:
    if track in CAREER_CONTEXTS:
        return (
            '\n\nCareer narrative preference (change story/skin only; keep the formal math object precise): '
            + CAREER_CONTEXTS[track]
        )
    return ''

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


def _extract_student_code(candidate: Any) -> str:
    if candidate is None:
        return ''
    if isinstance(candidate, dict):
        return str(candidate.get('source') or candidate.get('code') or '').strip()
    if isinstance(candidate, str):
        s = candidate.strip()
        if s.startswith('{'):
            try:
                parsed = json.loads(s)
                if isinstance(parsed, dict):
                    return str(parsed.get('source') or parsed.get('code') or '').strip()
            except (json.JSONDecodeError, TypeError):
                pass
        return s
    return str(candidate).strip()


def _format_expected_for_code_judge(expected: Any) -> str:
    if expected is None:
        return ''
    if isinstance(expected, (dict, list)):
        return json.dumps(expected, ensure_ascii=False)
    return str(expected)


def _is_code_judge_mode(req: VerifyRequest) -> bool:
    if (req.operation or '').strip().lower() == 'math_from_code':
        return False
    if (req.judgeMode or '').strip().lower() == 'code':
        return True
    p = req.params or {}
    if isinstance(p, dict) and str(p.get('judgeMode', '')).strip().lower() == 'code':
        return True
    if (req.operation or '').strip().lower() == 'code_judge':
        return True
    if isinstance(p, dict) and str(p.get('problemKind', '')).strip().lower() == 'code':
        return True
    return False


def _is_math_from_code_mode(req: VerifyRequest) -> bool:
    if (req.operation or '').strip().lower() == 'math_from_code':
        return True
    p = req.params or {}
    if isinstance(p, dict) and str(p.get('problemKind', '')).strip().lower() == 'code_to_math':
        return True
    return False


def _candidate_answer_plain(req: VerifyRequest) -> str:
    c = req.candidateAnswer
    if c is None:
        return ''
    if isinstance(c, (dict, list)):
        return json.dumps(c, ensure_ascii=False)
    return str(c).strip()


def _expected_answer_plain(req: VerifyRequest) -> str:
    e = req.expectedAnswer
    if e is None:
        return ''
    if isinstance(e, (dict, list)):
        return json.dumps(e, ensure_ascii=False)
    return str(e).strip()


def _verify_math_notation_with_llm(req: VerifyRequest) -> Dict[str, Any]:
    """LLM judge for Big-O and recurrence notation (equivalence-aware)."""
    service = get_chatbot_service()
    p = req.params if isinstance(req.params, dict) else {}
    math_type = str(p.get('mathType', 'complexity') or 'complexity').strip().lower()

    system_prompt = (
        'You are a computer science TA grading mathematical analysis of code. '
        f'Problem focus: {math_type}. '
        'Compare the student answer to the expected answer. '
        'For complexity: treat O(n^2), O(n*n), and O(n**2) as equivalent; ignore constant factors and lower-order terms. '
        'For recurrence: allow equivalent forms (e.g. T(n)=2T(n/2)+n vs T(n) = 2*T(n/2) + O(n)). '
        'RESPOND WITH RAW JSON ONLY. No markdown fences. '
        'JSON keys: correct (boolean), confidence (number 0 to 1), feedback (string, short).'
    )
    expected = _expected_answer_plain(req) or '(none)'
    student = _candidate_answer_plain(req)
    user_prompt = (
        f'Expected answer: {expected}\n'
        f'Student answer: {student}\n'
        'Are they mathematically equivalent for this type of problem? Return raw JSON only.'
    )
    result = service.chat(
        [
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': user_prompt},
        ],
        subject='code-to-math',
        module='notation-verify',
    )

    if 'error' in result:
        logger.warning('LLM math notation judge returned error: %s', result['error'])
        return {
            'correct': False,
            'confidence': 0.30,
            'method': 'math-judge-error',
            'feedback': 'AI verification was unavailable. Try again later.',
        }

    raw_reply = str(result.get('reply', ''))
    cleaned = _clean_llm_json(raw_reply)
    try:
        parsed = JudgeResponse.model_validate(json.loads(cleaned))
        return {
            'correct': parsed.correct,
            'confidence': parsed.confidence,
            'method': 'math-judge',
            'feedback': parsed.feedback,
        }
    except (json.JSONDecodeError, ValidationError, ValueError) as exc:
        logger.warning('Failed to parse math notation judge reply: %s — raw: %s', exc, raw_reply[:300])
        return {
            'correct': False,
            'confidence': 0.30,
            'method': 'math-judge-parse-error',
            'feedback': 'Could not parse AI verification; refine your notation and retry.',
        }


def _verify_code_with_llm(req: VerifyRequest) -> Dict[str, Any]:
    service = get_chatbot_service()
    student_code = _extract_student_code(req.candidateAnswer)
    lang = (
        (req.language or '').strip()
        or (str((req.params or {}).get('language', '') or '').strip() if isinstance(req.params, dict) else '')
        or 'python'
    )
    reference = _format_expected_for_code_judge(req.expectedAnswer)

    judge_system = (
        'You are a strict programming exercise reviewer (like an algorithms TA). '
        'Student code is NOT executed here; infer correctness from the problem statement, '
        'the grading rubric/reference below, and the submitted source. '
        'RESPOND WITH RAW JSON ONLY. '
        'DO NOT wrap the response in markdown code fences (```). '
        'DO NOT add any text before or after the JSON. '
        'The JSON must have exactly these keys: correct (boolean), confidence (number 0 to 1), feedback (string). '
        'If you are uncertain, set correct to false and confidence below 0.45. '
        'The feedback should briefly explain issues when incorrect.'
    )
    fence_lang = lang if lang else 'text'
    judge_user = (
        f'Expected programming language: {lang}\n\n'
        f'Problem statement:\n{req.questionText}\n\n'
        f'Grading rubric / reference solution (may be partial):\n{reference or "(none)"}\n\n'
        f'Student submission ({fence_lang}):\n```{fence_lang}\n{student_code}\n```\n'
        'Decide whether the submission adequately solves the stated problem. Return raw JSON only.'
    )
    result = service.chat(
        [
            {'role': 'system', 'content': judge_system},
            {'role': 'user', 'content': judge_user},
        ],
        subject='algorithms',
        module='code-verification',
    )

    if 'error' in result:
        logger.warning('LLM code judge returned error: %s', result['error'])
        return {
            'correct': False,
            'confidence': 0.28,
            'method': 'code-judge-unavailable',
            'feedback': 'AI verification was unavailable. Try again later.',
        }

    raw_reply = str(result.get('reply', ''))
    cleaned = _clean_llm_json(raw_reply)
    try:
        parsed = JudgeResponse.model_validate(json.loads(cleaned))
        return {
            'correct': parsed.correct,
            'confidence': parsed.confidence,
            'method': 'code-judge',
            'feedback': parsed.feedback,
        }
    except (json.JSONDecodeError, ValidationError, ValueError) as exc:
        logger.warning('Failed to parse LLM code judge reply: %s — raw: %s', exc, raw_reply[:300])
        return {
            'correct': False,
            'confidence': 0.30,
            'method': 'code-judge-parse-fallback',
            'feedback': 'Could not parse AI verification; assume incorrect and refine your solution.',
        }


def _difficulty_score(raw: Optional[str]) -> float:
    if not raw:
        return 0.60
    normalized = raw.strip().upper()
    if normalized == 'EASY':
        return 0.35
    if normalized == 'HARD':
        return 0.85
    return 0.60


def _fallback_code_challenge(slug: str, difficulty: Optional[str], career_track: str = 'NONE') -> Dict[str, Any]:
    """Static algorithm-topic placeholder when LLM generation is unavailable."""
    starters = {
        'sorting': (
            'def sort_array(nums):\n'
            '    """Return a new list sorted in non-decreasing order."""\n'
            '    pass\n'
        ),
        'searching': (
            'def binary_search(nums, target):\n'
            '    """Return index of target in sorted nums, or -1."""\n'
            '    pass\n'
        ),
        'recursion': (
            'def fib(n):\n'
            '    """Return F(n) for n >= 0."""\n'
            '    pass\n'
        ),
        'asymptotic_analysis': (
            '# Describe the worst-case time complexity (Big-O) for the process in the problem.\n'
            'def answer():\n'
            '    return "O(???)"\n'
        ),
    }
    questions = {
        'sorting': (
            'Implement a function that sorts a list of integers in non-decreasing order. '
            'Discuss or demonstrate time complexity in comments.'
        ),
        'searching': (
            'Binary search: given a sorted list of distinct integers, return the index of `target` or -1.'
        ),
        'recursion': (
            'Write a function that computes the n-th Fibonacci number with F(0)=0, F(1)=1.'
        ),
        'asymptotic_analysis': (
            'Analyze the worst-case time complexity (Big-O) for a nested loop structure as a function of input size n.'
        ),
    }
    rubric = {
        'sorting': 'Sort is correct for typical inputs; complexity claim matches implementation.',
        'searching': 'Correct loop bounds; returns -1 when absent.',
        'recursion': 'Correct recurrence and base cases.',
        'asymptotic_analysis': 'Big-O matches the described structure.',
    }
    starter = starters.get(slug, starters['sorting'])
    return {
        'questionText': questions.get(slug, questions['sorting']),
        'parameters': {
            'problemKind': 'code',
            'language': 'python',
            'starterCode': starter,
        },
        'answerExpression': '0',
        'correctAnswer': rubric.get(slug, rubric['sorting']),
        'operation': 'code_judge',
        'problemKind': 'code',
        'difficultyScore': _difficulty_score(difficulty),
        'topicSlug': slug,
        'sourceModel': 'fallback-template',
        'careerTrack': career_track,
    }


def _fallback_generated(topic_slug: Optional[str], difficulty: Optional[str], career_track: str = 'NONE') -> Dict[str, Any]:
    slug = (topic_slug or 'combinatorics').strip().lower()

    if slug in CODE_PRACTICE_TOPICS:
        return _fallback_code_challenge(slug, difficulty, career_track)

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
            'careerTrack': career_track,
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
            'careerTrack': career_track,
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
            'careerTrack': career_track,
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
            'careerTrack': career_track,
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
        'careerTrack': career_track,
    }


def _generate_algorithm_code_problem(
    service: Any,
    topic_slug: str,
    difficulty: str,
    skill_level: str,
    career_track: str,
) -> Dict[str, Any]:
    career_fragment = _career_prompt_fragment(career_track)
    system_prompt = (
        'You are an algorithms and data structures instructor for IT / CS students. '
        'Generate ONE coding-style practice problem (LeetCode / interview style problem text). '
        'When it fits the topic, frame the story in a realistic software context (APIs, '
        'databases, message queues, game dev, devops) without changing the core math or '
        'algorithmic task. '
        + career_fragment
        + ' RESPOND WITH RAW JSON ONLY. '
        'DO NOT wrap the response in markdown code fences (```). '
        'The JSON must include: '
        'questionText (string, full statement with examples if helpful), '
        'parameters (object, may be empty {}), '
        'problemKind (string, must be exactly "code"), '
        'operation (string, must be exactly "code_judge"), '
        'answerExpression (string, use literal "0" as a compatibility placeholder), '
        'correctAnswer (string: concise grading rubric / reference outline for an automated reviewer only), '
        'starterCode (optional string, Python stubs), '
        'constraints (optional string), '
        'language (string, default "python"). '
        'starterCode must be benign educational stubs only.'
    )
    user_prompt = (
        f'Generate one coding exercise for topic_slug={topic_slug}, difficulty={difficulty}, '
        f'skillLevel={skill_level}. Prefer Python unless the topic clearly suggests otherwise. '
        'Return raw JSON only.'
    )
    result = service.chat(
        [
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': user_prompt},
        ],
        subject='algorithms',
        module=topic_slug,
    )

    if 'error' in result:
        logger.warning('LLM returned error during algorithm generation: %s', result['error'])
        fallback = _fallback_code_challenge(topic_slug, difficulty, career_track)
        fallback['llmError'] = result['error']
        return fallback

    raw_reply = str(result.get('reply', ''))
    cleaned = _clean_llm_json(raw_reply)
    try:
        parsed = json.loads(cleaned)
        question = parsed.get('questionText') or parsed.get('question') or parsed.get('problemText')
        params = parsed.get('parameters') or parsed.get('params')
        if not isinstance(params, dict):
            params = {}
        params['problemKind'] = 'code'
        lang = (parsed.get('language') or 'python').strip() or 'python'
        params['language'] = lang
        if parsed.get('starterCode'):
            params['starterCode'] = str(parsed['starterCode'])
        if parsed.get('constraints'):
            params['constraints'] = str(parsed['constraints'])

        ca = parsed.get('correctAnswer')
        if ca is None:
            ca = parsed.get('referenceSolution') or parsed.get('rubric')
        if ca is not None and not isinstance(ca, str):
            ca = json.dumps(ca, ensure_ascii=False)
        correct_s = (ca or 'Solution should satisfy the problem statement; judge algorithmic correctness.').strip()

        if not question:
            raise ValueError('Missing questionText')

        return {
            'questionText': question,
            'parameters': params,
            'answerExpression': str(parsed.get('answerExpression') or '0'),
            'correctAnswer': correct_s,
            'operation': 'code_judge',
            'problemKind': 'code',
            'difficultyScore': _difficulty_score(difficulty),
            'topicSlug': topic_slug,
            'sourceModel': result.get('model', 'gemini'),
            'careerTrack': career_track,
        }
    except Exception as exc:
        logger.warning('Failed to parse algorithm generation reply: %s — raw: %s', exc, raw_reply[:300])
        fallback = _fallback_code_challenge(topic_slug, difficulty, career_track)
        fallback['rawReply'] = raw_reply[:500]
        return fallback


def _fallback_code_to_math(topic_slug: str, difficulty: Optional[str], career_track: str) -> Dict[str, Any]:
    """Static code-to-math problems when LLM generation is unavailable."""
    if topic_slug == 'code_complexity':
        snippet = '''def process_data(arr):
    n = len(arr)
    result = []
    for i in range(n):
        for j in range(i, n):
            result.append(arr[i] + arr[j])
    return result'''
        return {
            'questionText': 'What is the worst-case time complexity of this function in Big-O notation?',
            'parameters': {
                'problemKind': 'code_to_math',
                'codeSnippet': snippet,
                'mathType': 'complexity',
                'language': 'python',
            },
            'answerExpression': '0',
            'correctAnswer': 'O(n^2)',
            'operation': 'math_from_code',
            'difficultyScore': _difficulty_score(difficulty),
            'topicSlug': topic_slug,
            'sourceModel': 'fallback-template',
            'careerTrack': career_track,
        }

    snippet = '''def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)'''
    return {
        'questionText': (
            'Write a recurrence relation T(n) describing the runtime of this recursive function '
            '(ignore memoization / assume naive branching).'
        ),
        'parameters': {
            'problemKind': 'code_to_math',
            'codeSnippet': snippet,
            'mathType': 'recurrence',
            'language': 'python',
        },
        'answerExpression': '0',
        'correctAnswer': 'T(n) = T(n-1) + T(n-2) + O(1)',
        'operation': 'math_from_code',
        'difficultyScore': _difficulty_score(difficulty),
        'topicSlug': topic_slug,
        'sourceModel': 'fallback-template',
        'careerTrack': career_track,
    }


def _generate_code_to_math_problem(
    service: Any,
    topic_slug: str,
    difficulty: str,
    skill_level: str,
    career_track: str,
) -> Dict[str, Any]:
    """Generate Python snippet; student answers with Big-O or recurrence (Math Bug Hunter)."""
    problem_type = 'complexity' if topic_slug == 'code_complexity' else 'recurrence'
    career_fragment = _career_prompt_fragment(career_track)

    examples = {
        'complexity': {
            'EASY': 'single loop over n, O(n)',
            'MEDIUM': 'nested loops, O(n^2) or O(n*m)',
            'HARD': 'divide-and-conquer or subtle loop bounds, e.g. O(n log n)',
        },
        'recurrence': {
            'EASY': 'simple linear recursion, e.g. T(n)=T(n-1)+O(1)',
            'MEDIUM': 'binary-style recursion, e.g. T(n)=2T(n/2)+O(n)',
            'HARD': 'multiple recursive calls or overlapping subproblems',
        },
    }
    diff_key = difficulty if difficulty in examples['complexity'] else 'MEDIUM'
    pattern_hint = examples[problem_type].get(diff_key, examples[problem_type]['MEDIUM'])

    system_prompt = (
        'You are a CS educator creating "code-to-math" reverse problems for IT students. '
        'Output ONE short, realistic Python code snippet (no imports, no file I/O, no network). '
        f'Problem type: {problem_type}. '
        'For complexity: code uses loops and/or recursion; the student must state worst-case time complexity in Big-O. '
        'For recurrence: code is a recursive function; the student must give T(n)=... matching the structure (ignore memoization). '
        + career_fragment
        + ' RESPOND WITH RAW JSON ONLY. No markdown fences. '
        'JSON keys: codeSnippet (string), questionText (string, what to derive), '
        'expectedMathAnswer (string, canonical short answer), '
        'explanation (string, one sentence), hints (array of strings, optional, max 2). '
        'Keep code under 25 lines.'
    )
    user_prompt = (
        f'Generate one {problem_type} problem: difficulty={difficulty}, skillLevel={skill_level}. '
        f'Pattern hint: {pattern_hint}. '
        'Return raw JSON only.'
    )
    result = service.chat(
        [
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': user_prompt},
        ],
        subject='code-to-math',
        module=topic_slug,
    )

    if 'error' in result:
        logger.warning('LLM code-to-math generation error: %s', result['error'])
        fb = _fallback_code_to_math(topic_slug, difficulty, career_track)
        fb['llmError'] = result['error']
        return fb

    raw_reply = str(result.get('reply', ''))
    cleaned = _clean_llm_json(raw_reply)
    try:
        parsed = json.loads(cleaned)
        code = (parsed.get('codeSnippet') or parsed.get('code') or '').strip()
        question = (parsed.get('questionText') or parsed.get('question') or '').strip()
        expected = (parsed.get('expectedMathAnswer') or parsed.get('expectedAnswer') or '').strip()
        if not code or not question or not expected:
            raise ValueError('Missing codeSnippet, questionText, or expectedMathAnswer')

        hints = parsed.get('hints') or []
        if not isinstance(hints, list):
            hints = []
        hints = [str(h) for h in hints if str(h).strip()][:2]

        return {
            'questionText': question,
            'parameters': {
                'problemKind': 'code_to_math',
                'codeSnippet': code,
                'mathType': problem_type,
                'language': 'python',
                'hints': hints,
            },
            'answerExpression': '0',
            'correctAnswer': expected,
            'operation': 'math_from_code',
            'difficultyScore': _difficulty_score(difficulty),
            'topicSlug': topic_slug,
            'sourceModel': result.get('model', 'gemini'),
            'careerTrack': career_track,
        }
    except Exception as exc:
        logger.warning('Failed to parse code-to-math reply: %s — raw: %s', exc, raw_reply[:400])
        fb = _fallback_code_to_math(topic_slug, difficulty, career_track)
        fb['rawReply'] = raw_reply[:500]
        return fb


@router.post('/generate')
def generate_problem(req: GenerateRequest):
    service = get_chatbot_service()
    topic_slug = (req.topicSlug or 'combinatorics').strip().lower()
    difficulty = (req.difficulty or 'MEDIUM').upper()
    skill_level = req.skillLevel or 'intermediate'
    career_track = _normalize_career_track(req.careerTrack)
    career_fragment = _career_prompt_fragment(career_track)

    if topic_slug in CODE_TO_MATH_TOPICS:
        return _generate_code_to_math_problem(service, topic_slug, difficulty, skill_level, career_track)

    if topic_slug in CODE_PRACTICE_TOPICS:
        return _generate_algorithm_code_problem(service, topic_slug, difficulty, skill_level, career_track)

    system_prompt = (
        'You are a discrete-math problem generator for IT and software engineering students. '
        'Wrap each problem in a short, realistic CS/IT scenario when it does not break the math: '
        'e.g. routing or dependencies as graphs, resource allocation as combinatorics, feature '
        'flags or message paths as logic, transforms as linear algebra. Keep the formal object '
        'mathematically precise.'
        + career_fragment
        + ' RESPOND WITH RAW JSON ONLY. '
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
        'Use an IT-relevant story hook in questionText when natural. '
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
        fallback = _fallback_generated(topic_slug, difficulty, career_track)
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
            'careerTrack': career_track,
        }
    except Exception as exc:
        logger.warning('Failed to parse LLM generation reply: %s — raw: %s', exc, raw_reply[:300])
        fallback = _fallback_generated(topic_slug, difficulty, career_track)
        fallback['rawReply'] = raw_reply[:500]
        return fallback


@router.post('/verify')
def verify_answer(req: VerifyRequest):
    if _is_code_judge_mode(req):
        return _verify_code_with_llm(req)

    if _is_math_from_code_mode(req):
        return _verify_math_notation_with_llm(req)

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
