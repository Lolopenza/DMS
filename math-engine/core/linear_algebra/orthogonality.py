from core.linear_algebra.helpers import EPS, as_vector, dot


def solve(operation: str, body: dict):
    vector = as_vector(body.get('vector'), 'vector')
    onto = as_vector(body.get('onto'), 'onto')

    if operation == 'dot-product':
        return {'operation': operation, 'value': dot(vector, onto)}

    if operation == 'is-orthogonal':
        d = dot(vector, onto)
        return {'operation': operation, 'value': abs(d) < EPS, 'dotProduct': d}

    if operation == 'projection':
        denom = dot(onto, onto)
        if abs(denom) < EPS:
            raise ValueError('Cannot project onto zero vector')
        factor = dot(vector, onto) / denom
        proj = [factor * x for x in onto]
        return {'operation': operation, 'value': proj, 'factor': factor}

    raise ValueError(f'Unknown orthogonality operation: {operation}')
