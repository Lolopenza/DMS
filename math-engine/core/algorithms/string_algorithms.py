def _brute_force(text: str, pattern: str):
    matches = []
    m = len(pattern)
    for i in range(len(text) - m + 1):
        if text[i : i + m] == pattern:
            matches.append(i)
    return {'matches': matches, 'count': len(matches), 'complexity': 'O(n*m)'}


def _kmp(text: str, pattern: str):
    lps = [0] * len(pattern)
    length = 0
    i = 1
    while i < len(pattern):
        if pattern[i] == pattern[length]:
            length += 1
            lps[i] = length
            i += 1
        elif length > 0:
            length = lps[length - 1]
        else:
            lps[i] = 0
            i += 1

    matches = []
    i = 0
    j = 0
    while i < len(text):
        if text[i] == pattern[j]:
            i += 1
            j += 1
        if j == len(pattern):
            matches.append(i - j)
            j = lps[j - 1]
        elif i < len(text) and text[i] != pattern[j]:
            if j != 0:
                j = lps[j - 1]
            else:
                i += 1

    return {'matches': matches, 'count': len(matches), 'complexity': 'O(n + m)'}


def solve(operation: str, body: dict):
    text = str(body.get('text', ''))
    pattern = str(body.get('pattern', ''))
    if not text or not pattern:
        raise ValueError('text and pattern are required')

    if operation == 'brute-force':
        return _brute_force(text, pattern)
    if operation == 'kmp-search':
        return _kmp(text, pattern)
    raise ValueError(f'Unknown string-algorithms operation: {operation}')
