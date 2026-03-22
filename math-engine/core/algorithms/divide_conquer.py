from core.algorithms.helpers import to_float, to_int


def _power(base, exponent):
    if exponent == 0:
        return 1.0
    if exponent == 1:
        return base
    half = _power(base, exponent // 2)
    return half * half if exponent % 2 == 0 else half * half * base


def solve(operation: str, body: dict):
    if operation != 'binary-power':
        raise ValueError(f'Unknown divide-conquer operation: {operation}')

    base = to_float(body.get('base'), 'base')
    exponent = to_int(body.get('exponent'), 'exponent')
    if exponent < 0:
        raise ValueError('exponent must be non-negative')

    return {'result': _power(base, exponent), 'complexity': 'O(log n)'}
