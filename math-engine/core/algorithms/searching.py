from core.algorithms.helpers import as_num_array, to_float


def _linear_search(arr, target):
    for i, value in enumerate(arr):
        if value == target:
            return {'found': True, 'index': i, 'iterations': i + 1, 'complexity': 'O(n)'}
    return {'found': False, 'index': -1, 'iterations': len(arr), 'complexity': 'O(n)'}


def _binary_search(arr, target):
    sorted_arr = sorted(arr)
    left = 0
    right = len(sorted_arr) - 1
    iterations = 0
    while left <= right:
        iterations += 1
        mid = (left + right) // 2
        if sorted_arr[mid] == target:
            return {
                'found': True,
                'index': mid,
                'iterations': iterations,
                'complexity': 'O(log n)',
                'sorted': sorted_arr,
            }
        if sorted_arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return {
        'found': False,
        'index': -1,
        'iterations': iterations,
        'complexity': 'O(log n)',
        'sorted': sorted_arr,
    }


def solve(operation: str, body: dict):
    arr = as_num_array(body.get('array'), 'array')
    target = to_float(body.get('target'), 'target')

    if operation == 'linear-search':
        return _linear_search(arr, target)
    if operation == 'binary-search':
        return _binary_search(arr, target)
    raise ValueError(f'Unknown searching operation: {operation}')
