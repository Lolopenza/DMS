from core.linear_algebra.helpers import as_matrix, det2, det3


def solve(operation: str, body: dict):
    matrix = as_matrix(body.get('matrix'), 'matrix')

    if operation != 'determinant':
        raise ValueError(f'Unknown determinants operation: {operation}')

    if len(matrix) == 2 and len(matrix[0]) == 2:
        return {'operation': operation, 'value': det2(matrix)}
    if len(matrix) == 3 and len(matrix[0]) == 3:
        return {'operation': operation, 'value': det3(matrix)}

    raise ValueError('Determinant supports only 2x2 or 3x3 matrices')
