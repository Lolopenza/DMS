from core.algorithms.helpers import as_num_array


def _bubble_sort(arr):
    result = arr[:]
    comparisons = 0
    swaps = 0

    for i in range(len(result)):
        for j in range(len(result) - 1 - i):
            comparisons += 1
            if result[j] > result[j + 1]:
                result[j], result[j + 1] = result[j + 1], result[j]
                swaps += 1

    return {
        'sorted': result,
        'comparisons': comparisons,
        'swaps': swaps,
        'complexity': 'O(n^2)',
    }


def _merge_sort(arr):
    def merge(left, right):
        out = []
        i = 0
        j = 0
        while i < len(left) and j < len(right):
            if left[i] <= right[j]:
                out.append(left[i])
                i += 1
            else:
                out.append(right[j])
                j += 1
        return out + left[i:] + right[j:]

    def sort(items):
        if len(items) <= 1:
            return items
        m = len(items) // 2
        return merge(sort(items[:m]), sort(items[m:]))

    return {
        'sorted': sort(arr),
        'complexity': 'O(n log n)',
    }


def _quick_sort(arr):
    items = arr[:]
    comparisons = 0

    def partition(a, low, high):
        nonlocal comparisons
        pivot = a[high]
        i = low - 1
        for j in range(low, high):
            comparisons += 1
            if a[j] < pivot:
                i += 1
                a[i], a[j] = a[j], a[i]
        a[i + 1], a[high] = a[high], a[i + 1]
        return i + 1

    def sort(a, low, high):
        if low < high:
            pi = partition(a, low, high)
            sort(a, low, pi - 1)
            sort(a, pi + 1, high)

    sort(items, 0, len(items) - 1)
    return {
        'sorted': items,
        'comparisons': comparisons,
        'complexity': 'O(n log n) average',
    }


def solve(operation: str, body: dict):
    arr = as_num_array(body.get('array'), 'array')
    if operation == 'bubble-sort':
        return _bubble_sort(arr)
    if operation == 'merge-sort':
        return _merge_sort(arr)
    if operation == 'quick-sort':
        return _quick_sort(arr)
    raise ValueError(f'Unknown sorting operation: {operation}')
