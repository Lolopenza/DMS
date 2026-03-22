from core.linear_algebra.helpers import as_matrix, as_vector, solve2x2


def solve(operation: str, body: dict):
    matrix = as_matrix(body.get('matrix'), 'matrix')
    b = as_vector(body.get('b'), 'b')

    if operation not in ('solve', 'gaussian-elimination'):
        raise ValueError(f'Unknown linear-systems operation: {operation}')

    if len(matrix) != 2 or len(matrix[0]) != 2 or len(b) != 2:
        raise ValueError('Linear systems currently support only 2x2 inputs')

    return {'operation': operation, 'value': solve2x2(matrix, b)}
