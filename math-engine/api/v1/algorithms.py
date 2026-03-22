from fastapi import APIRouter, HTTPException

from core.algorithms import calculate as calculate_algorithms
from schemas.subjects.algorithms import AlgorithmsRequest

router = APIRouter(prefix='/api/v1/algorithms', tags=['Algorithms'])
@router.post('/')
def calculate(req: AlgorithmsRequest):
    body = req.model_dump()
    try:
        result = calculate_algorithms(body, req.module, req.operation)
        return {'result': result}
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
