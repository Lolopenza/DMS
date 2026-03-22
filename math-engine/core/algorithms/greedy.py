from core.algorithms.helpers import to_float


def solve(operation: str, body: dict):
    if operation != 'fractional-knapsack':
        raise ValueError(f'Unknown greedy operation: {operation}')

    cap = to_float(body.get('capacity'), 'capacity')
    items_text = body.get('items')
    if not isinstance(items_text, str):
        raise ValueError('items must be string in format value:weight;value:weight')

    items = []
    for chunk in items_text.split(';'):
        chunk = chunk.strip()
        if not chunk:
            continue
        if ':' not in chunk:
            raise ValueError('Invalid items format. Use value:weight;value:weight')

        v, w = chunk.split(':', 1)
        value = to_float(v.strip(), 'item value')
        weight = to_float(w.strip(), 'item weight')
        if weight <= 0:
            raise ValueError('item weight must be positive')

        items.append({'value': value, 'weight': weight, 'ratio': value / weight})

    items.sort(key=lambda x: x['ratio'], reverse=True)
    total_value = 0.0
    total_weight = 0.0
    selected = []

    for item in items:
        if total_weight + item['weight'] <= cap:
            total_weight += item['weight']
            total_value += item['value']
            selected.append({**item, 'fraction': 1})
        else:
            remain = cap - total_weight
            if remain <= 0:
                break
            fraction = remain / item['weight']
            total_weight = cap
            total_value += item['value'] * fraction
            selected.append({**item, 'fraction': fraction})
            break

    return {'value': total_value, 'weight': total_weight, 'items': selected, 'complexity': 'O(n log n)'}
