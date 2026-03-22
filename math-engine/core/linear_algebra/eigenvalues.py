from core.linear_algebra.helpers import as_matrix, eigenvalues2x2


def solve(operation: str, body: dict):
    matrix = as_matrix(body.get('matrix'), 'matrix')

    if operation != 'eigenvalues':
        raise ValueError(f'Unknown eigenvalues operation: {operation}')
    if len(matrix) != 2 or len(matrix[0]) != 2:
        raise ValueError('Eigenvalues currently support only 2x2 matrices')

    return {'operation': operation, 'value': eigenvalues2x2(matrix)}
