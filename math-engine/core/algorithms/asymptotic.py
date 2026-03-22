from core.algorithms.helpers import complexity_value, to_int


def solve(operation: str, body: dict):
    if operation == 'time-complexity':
        complexity = str(body.get('complexity', '')).strip().lower()
        n = to_int(body.get('n', 100), 'n')
        value = complexity_value(n, complexity)
        if value is None:
            raise ValueError(f'Unsupported complexity: {complexity}')
        return {
            'operation': operation,
            'complexity': complexity,
            'inputSize': n,
            'operations': value,
        }

    if operation == 'compare-complexities':
        variants = ['constant', 'logarithmic', 'linear', 'linearithmic', 'quadratic']
        compared = [{'type': c, 'value': complexity_value(1000, c)} for c in variants]
        compared.sort(key=lambda x: x['value'])
        return {
            'operation': operation,
            'comparison': compared,
            'fastest': compared[0],
            'slowest': compared[-1],
        }

    raise ValueError(f'Unknown asymptotic-analysis operation: {operation}')
