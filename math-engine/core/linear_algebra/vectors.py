from core.linear_algebra.helpers import as_vector, dot, magnitude


def solve(operation: str, body: dict):
    a = as_vector(body.get('a'), 'a')
    if operation == 'magnitude':
        return {'operation': operation, 'value': magnitude(a)}

    b = as_vector(body.get('b'), 'b')
    if operation == 'dot-product':
        return {'operation': operation, 'value': dot(a, b)}
    if operation == 'add':
        if len(a) != len(b):
            raise ValueError('Vectors must have equal dimensions')
        return {'operation': operation, 'value': [a[i] + b[i] for i in range(len(a))]}
    if operation == 'subtract':
        if len(a) != len(b):
            raise ValueError('Vectors must have equal dimensions')
        return {'operation': operation, 'value': [a[i] - b[i] for i in range(len(a))]}

    raise ValueError(f'Unknown vectors operation: {operation}')
