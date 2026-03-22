from core.linear_algebra.helpers import as_matrix, rank


def solve(operation: str, body: dict):
    vectors = as_matrix(body.get('vectors'), 'vectors')

    if operation not in ('basis-check', 'rank'):
        raise ValueError(f'Unknown vector-spaces operation: {operation}')

    r = rank(vectors)
    return {
        'operation': operation,
        'value': {
            'rank': r,
            'vectorCount': len(vectors),
            'dimension': len(vectors[0]),
            'isLinearlyIndependent': r == len(vectors),
            'spansSpace': r == len(vectors[0]),
        },
    }
