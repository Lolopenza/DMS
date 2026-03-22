from core.algorithms.helpers import parse_graph


def _dfs(graph, start):
    visited = set()
    order = []

    def visit(node):
        if node in visited:
            return
        visited.add(node)
        order.append(node)
        for nxt in graph.get(node, []):
            visit(nxt)

    visit(start)
    return {'traversal': order, 'visited': list(visited), 'complexity': 'O(V + E)'}


def _bfs(graph, start):
    visited = {start}
    queue = [start]
    order = []

    while queue:
        node = queue.pop(0)
        order.append(node)
        for nxt in graph.get(node, []):
            if nxt not in visited:
                visited.add(nxt)
                queue.append(nxt)

    return {'traversal': order, 'visited': list(visited), 'complexity': 'O(V + E)'}


def solve(operation: str, body: dict):
    graph_text = body.get('graph')
    if not isinstance(graph_text, str):
        raise ValueError('graph must be string in format A->B,C;B->D')
    graph = parse_graph(graph_text)

    start = str(body.get('startNode', '')).strip()
    if not start:
        raise ValueError('startNode is required')

    if operation == 'dfs':
        return _dfs(graph, start)
    if operation == 'bfs':
        return _bfs(graph, start)
    raise ValueError(f'Unknown graph-algorithms operation: {operation}')
