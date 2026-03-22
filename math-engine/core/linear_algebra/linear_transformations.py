from core.linear_algebra.helpers import as_matrix, as_vector, mat_mul


def solve(operation: str, body: dict):
    matrix = as_matrix(body.get('matrix'), 'matrix')
    vector = as_vector(body.get('vector'), 'vector')

    if operation != 'apply-transformation':
        raise ValueError(f'Unknown linear-transformations operation: {operation}')
    if len(matrix[0]) != len(vector):
        raise ValueError('Matrix and vector dimensions are incompatible')

    col = [[v] for v in vector]
    result = mat_mul(matrix, col)
    return {'operation': operation, 'value': [row[0] for row in result]}
