from core.algorithms import (
    asymptotic,
    divide_conquer,
    dynamic_programming,
    graph_algorithms,
    greedy,
    searching,
    sorting,
    string_algorithms,
)


def calculate(body: dict, module: str, operation: str):
    if module == 'asymptotic-analysis':
        return asymptotic.solve(operation, body)
    if module == 'sorting':
        return sorting.solve(operation, body)
    if module == 'searching':
        return searching.solve(operation, body)
    if module == 'graph-algorithms':
        return graph_algorithms.solve(operation, body)
    if module == 'dynamic-programming':
        return dynamic_programming.solve(operation, body)
    if module == 'greedy':
        return greedy.solve(operation, body)
    if module == 'divide-conquer':
        return divide_conquer.solve(operation, body)
    if module == 'string-algorithms':
        return string_algorithms.solve(operation, body)
    raise ValueError(f'Unknown module: {module}')
