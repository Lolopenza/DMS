import numpy as np

try:
    from scipy import sparse
    HAS_SCIPY = True
except ImportError:
    HAS_SCIPY = False

from fastapi import APIRouter, HTTPException
from schemas.discrete_math.graph import (
    MatrixPowerRequest, MatrixNodeRequest, MatrixRequest, GraphInfoRequest,
)

router = APIRouter(prefix='/api/v1/adjacency_matrix', tags=['Adjacency Matrix'])


@router.post('/power')
def matrix_power(req: MatrixPowerRequest):
    arr = np.array(req.matrix, dtype=float)
    result = np.linalg.matrix_power(arr, int(req.power))
    return {'result': result.tolist(), 'error': None}


@router.post('/info')
def graph_info(req: GraphInfoRequest):
    matrix = np.array(req.graph['matrix'], dtype=float)
    n = matrix.shape[0]
    directed = req.graph.get('directed', False)
    weighted = req.graph.get('weighted', False)
    degrees = matrix.sum(axis=1) if directed else matrix.sum(axis=0) + matrix.sum(axis=1)
    num_edges = int(matrix.sum()) if directed else int(matrix.sum() // 2)
    return {
        'result': {
            'num_vertices': n,
            'num_edges': num_edges,
            'degrees': degrees.tolist(),
            'directed': directed,
            'weighted': weighted,
        },
        'source': 'local',
    }


@router.post('/degree')
def matrix_degree(req: MatrixNodeRequest):
    arr = np.array(req.matrix, dtype=int)
    node = req.node
    if not (0 <= node < arr.shape[0]):
        raise HTTPException(400, 'Invalid node index')
    if req.directed:
        in_deg = int(arr[:, node].sum())
        out_deg = int(arr[node, :].sum())
        return {'result': {'in_degree': in_deg, 'out_degree': out_deg, 'total': in_deg + out_deg}}
    deg = int(arr[node, :].sum() + arr[:, node].sum())
    return {'result': {'degree': deg}}


@router.post('/neighbors')
def matrix_neighbors(req: MatrixNodeRequest):
    arr = np.array(req.matrix, dtype=int)
    node = req.node
    if not (0 <= node < arr.shape[0]):
        raise HTTPException(400, 'Invalid node index')
    n = arr.shape[0]
    if req.directed:
        return {'result': {
            'out_neighbors': [int(j) for j in range(n) if arr[node, j] != 0],
            'in_neighbors': [int(i) for i in range(n) if arr[i, node] != 0],
        }}
    neighbors = sorted(set(
        [int(j) for j in range(n) if arr[node, j] != 0] +
        [int(i) for i in range(n) if arr[i, node] != 0]
    ))
    return {'result': {'neighbors': neighbors}}


@router.post('/to_adjacency_list')
def to_adjacency_list(req: MatrixRequest):
    arr = np.array(req.matrix)
    n = arr.shape[0]
    adj_list = {str(i): [int(j) for j in range(n) if arr[i, j] != 0] for i in range(n)}
    return {'result': adj_list}


@router.post('/to_edge_list')
def to_edge_list(req: MatrixRequest):
    arr = np.array(req.matrix)
    n = arr.shape[0]
    edge_list = [
        [int(i), int(j), float(arr[i, j])]
        for i in range(n) for j in range(n) if arr[i, j] != 0
    ]
    return {'result': edge_list}


@router.post('/validate')
def validate_matrix(req: MatrixRequest):
    arr = np.array(req.matrix)
    square = arr.shape[0] == arr.shape[1]
    symmetric = square and bool(np.allclose(arr, arr.T))
    return {'result': {'square': square, 'symmetric': symmetric, 'error': None}}


@router.post('/attributes')
def matrix_attributes(req: dict):
    return {'result': req}


@router.post('/batch_analysis')
def batch_analysis(req: MatrixRequest):
    arr = np.array(req.matrix)
    n = arr.shape[0]
    use_sparse = HAS_SCIPY and n > 100
    arr_sparse = sparse.csr_matrix(arr) if use_sparse else None
    results = []
    for i in range(n):
        if use_sparse:
            row = arr_sparse.getrow(i).toarray().ravel()
            col = arr_sparse.getcol(i).toarray().ravel()
        else:
            row = arr[i, :]
            col = arr[:, i]
        if req.directed:
            results.append({
                'node': i,
                'in_degree': int(col.sum()),
                'out_degree': int(row.sum()),
                'total': int(col.sum() + row.sum()),
                'out_neighbors': [int(j) for j in range(n) if row[j] != 0],
                'in_neighbors': [int(j) for j in range(n) if col[j] != 0],
            })
        else:
            results.append({
                'node': i,
                'degree': int(row.sum() + col.sum()),
                'neighbors': sorted(set(
                    [int(j) for j in range(n) if row[j] != 0] +
                    [int(j) for j in range(n) if col[j] != 0]
                )),
            })
    return {'result': results}
