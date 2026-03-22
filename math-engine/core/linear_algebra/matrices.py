from core.linear_algebra.helpers import as_matrix, det2, det3, inverse2, mat_add, mat_mul, transpose


def solve(operation: str, body: dict):
    a = as_matrix(body.get('a'), 'a')

    if operation == 'transpose':
        return {'operation': operation, 'value': transpose(a)}

    if operation == 'determinant':
        if len(a) == 2 and len(a[0]) == 2:
            return {'operation': operation, 'value': det2(a)}
        if len(a) == 3 and len(a[0]) == 3:
            return {'operation': operation, 'value': det3(a)}
        raise ValueError('Determinant supports only 2x2 or 3x3 matrices')

    if operation == 'inverse':
        if len(a) != 2 or len(a[0]) != 2:
            raise ValueError('Inverse currently supports only 2x2 matrices')
        return {'operation': operation, 'value': inverse2(a)}

    b = as_matrix(body.get('b'), 'b')
    if operation == 'add':
        return {'operation': operation, 'value': mat_add(a, b)}
    if operation == 'multiply':
        return {'operation': operation, 'value': mat_mul(a, b)}

    raise ValueError(f'Unknown matrices operation: {operation}')
