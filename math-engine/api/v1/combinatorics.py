from fastapi import APIRouter, HTTPException
from schemas.discrete_math.combinatorics import CombinatoricsRequest
from core.discrete_math.combinatorics.basic import factorial, permutations, combinations
from core.discrete_math.combinatorics.advanced import pigeonhole_principle, catalan_number, stirling_numbers_second_kind

router = APIRouter(prefix='/api/v1/combinatorics', tags=['Combinatorics'])


@router.post('/')
def calculate(req: CombinatoricsRequest):
    op = req.operation

    if op == 'factorial':
        if req.n is None:
            raise HTTPException(400, 'n is required for factorial')
        return {'result': factorial(req.n)}

    if op == 'permutation':
        if req.n is None or req.r is None:
            raise HTTPException(400, 'n and r are required for permutation')
        return {'result': permutations(req.n, req.r)}

    if op == 'combination':
        if req.n is None or req.r is None:
            raise HTTPException(400, 'n and r are required for combination')
        return {'result': combinations(req.n, req.r)}

    if op == 'binomial':
        if req.n is None or req.k is None:
            raise HTTPException(400, 'n and k are required for binomial')
        return {'result': combinations(req.n, req.k)}

    if op == 'pigeonhole':
        if req.pigeons is None or req.holes is None:
            raise HTTPException(400, 'pigeons and holes are required for pigeonhole')
        return {'result': pigeonhole_principle(req.pigeons, req.holes)}

    if op == 'catalan':
        if req.n is None:
            raise HTTPException(400, 'n is required for catalan')
        return {'result': catalan_number(req.n)}

    if op == 'stirling':
        if req.n is None or req.k is None:
            raise HTTPException(400, 'n and k are required for stirling')
        return {'result': stirling_numbers_second_kind(req.n, req.k)}

    raise HTTPException(400, f'Unknown operation: {op}')
