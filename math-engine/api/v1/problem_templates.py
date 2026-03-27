import re

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sympy as sp
from sympy.parsing.sympy_parser import parse_expr

router = APIRouter(prefix='/api/v1/problem_templates', tags=['Problem Templates'])


class ValidateRequest(BaseModel):
    operation: str
    answerExpression: str
    params: dict
    candidateAnswer: object


MAX_EXPRESSION_LENGTH = 300
MAX_OPERATOR_TOKENS = 80
ALLOWED_EXPR_RE = re.compile(r"^[0-9A-Za-z_+\-*/().,\s<>=!&|~^%]*$")
FORBIDDEN_EXPR_SUBSTRINGS = ('__', 'import', 'lambda', 'eval', 'exec', 'open(', 'os.', 'sys.', 'subprocess')
SAFE_EVAL_GLOBALS = {'__builtins__': {}}
SAFE_EVAL_LOCALS_BASE = {
    'Integer': sp.Integer,
    'Rational': sp.Rational,
    'Float': sp.Float,
    'factorial': sp.factorial,
}


def _normalize_logic_expression(expr: str) -> str:
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


def _safe_parse_expression(expr: str):
    normalized = _normalize_logic_expression(expr)
    _validate_expression_safety(normalized)
    token_candidates = set(re.findall(r'\b[A-Za-z_][A-Za-z0-9_]*\b', normalized))
    local_dict = dict(SAFE_EVAL_LOCALS_BASE)
    local_dict.update({'True': sp.true, 'False': sp.false})
    for token in token_candidates:
        if token in local_dict:
            continue
        local_dict[token] = sp.Symbol(token, real=True)
    return parse_expr(normalized, local_dict=local_dict, global_dict=SAFE_EVAL_GLOBALS, evaluate=True)


@router.post('/validate')
def validate_template_answer(req: ValidateRequest):
    try:
        expr = req.answerExpression
        for key, value in req.params.items():
            expr = expr.replace('{{' + str(key) + '}}', str(value))

        expected = _safe_parse_expression(expr)
        candidate = _safe_parse_expression(str(req.candidateAnswer))
        try:
            correct = sp.simplify(expected - candidate) == 0
        except Exception:
            correct = bool(expected.equals(candidate))
        return {'correct': bool(correct)}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f'Validation failed: {exc}')
