import math


def to_float(value, name: str):
    try:
        return float(value)
    except Exception as exc:
        raise ValueError(f'{name} must be numeric') from exc


def to_int(value, name: str):
    try:
        return int(value)
    except Exception as exc:
        raise ValueError(f'{name} must be an integer') from exc


def as_num_array(raw, name: str):
    if isinstance(raw, list):
        out = [to_float(item, name) for item in raw]
        if not out:
            raise ValueError(f'{name} cannot be empty')
        return out

    if isinstance(raw, str):
        parts = [p.strip() for p in raw.split(',') if p.strip()]
        if not parts:
            raise ValueError(f'{name} cannot be empty')
        return [to_float(p, name) for p in parts]

    raise ValueError(f'{name} must be array or comma-separated string')


def parse_graph(graph_text: str):
    graph = {}
    for edge in graph_text.split(';'):
        edge = edge.strip()
        if not edge:
            continue
        if '->' not in edge:
            raise ValueError('Graph format must be like A->B,C;B->D')
        src, rhs = edge.split('->', 1)
        src = src.strip()
        if not src:
            continue
        neighbors = [n.strip() for n in rhs.split(',') if n.strip()]
        graph[src] = neighbors
    return graph


def complexity_value(n: int, complexity: str):
    table = {
        'constant': 1,
        'linear': n,
        'quadratic': n * n,
        'cubic': n * n * n,
        'logarithmic': math.ceil(math.log2(max(1, n))),
        'linearithmic': n * math.ceil(math.log2(max(1, n))),
        'exponential': 2 ** n,
    }
    return table.get(complexity)
