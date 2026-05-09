from fastapi import APIRouter, HTTPException

from core.calculus.service import calculate as calculate_calculus
from schemas.subjects.calculus import CalculusRequest

router = APIRouter(prefix='/api/v1/calculus', tags=['Calculus'])


@router.post('/')
def calculate(req: CalculusRequest):
    body = req.model_dump()
    try:
        result = calculate_calculus(body)
        return {'result': result}
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    except Exception as exc:
        raise HTTPException(400, f'Calculus error: {exc}') from exc
