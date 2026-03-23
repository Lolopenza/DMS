from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sympy as sp

router = APIRouter(prefix='/api/v1/problem_templates', tags=['Problem Templates'])


class ValidateRequest(BaseModel):
    operation: str
    answerExpression: str
    params: dict
    candidateAnswer: object


@router.post('/validate')
def validate_template_answer(req: ValidateRequest):
    try:
        expr = req.answerExpression
        for key, value in req.params.items():
            expr = expr.replace('{{' + str(key) + '}}', str(value))

        expected = sp.sympify(expr)
        candidate = sp.sympify(str(req.candidateAnswer))
        correct = sp.simplify(expected - candidate) == 0
        return {'correct': bool(correct)}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f'Validation failed: {exc}')
