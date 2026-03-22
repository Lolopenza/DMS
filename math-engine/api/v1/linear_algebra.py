from fastapi import APIRouter, HTTPException

from core.linear_algebra import calculate as calculate_linear_algebra
from schemas.subjects.linear_algebra import LinearAlgebraRequest

router = APIRouter(prefix='/api/v1/linear_algebra', tags=['Linear Algebra'])


@router.post('/')
def calculate(req: LinearAlgebraRequest):
    body = req.model_dump()
    try:
        result = calculate_linear_algebra(body, req.module, req.operation)
        return {'result': result}
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
