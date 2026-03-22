from core.algorithms.helpers import as_num_array, to_int


def _fibonacci(n: int):
    if n <= 1:
        return {'result': n, 'steps': n, 'complexity': 'O(n)', 'memo': [0, 1][: n + 1]}

    memo = [0, 1]
    for _ in range(2, n + 1):
        memo.append(memo[-1] + memo[-2])
    return {'result': memo[n], 'steps': n, 'complexity': 'O(n)', 'memo': memo}


def _coin_change(n: int, coins):
    if any(c <= 0 or int(c) != c for c in coins):
        raise ValueError('steps must contain positive integers')

    integer_coins = [int(c) for c in coins]
    dp = [0] * (n + 1)
    dp[0] = 1
    for coin in integer_coins:
        for i in range(coin, n + 1):
            dp[i] += dp[i - coin]
    return {'ways': dp[n], 'complexity': 'O(n * m)'}


def solve(operation: str, body: dict):
    n = to_int(body.get('n'), 'n')
    if n < 0:
        raise ValueError('n must be non-negative')

    if operation == 'fibonacci':
        return _fibonacci(n)

    if operation == 'coin-change':
        coins = as_num_array(body.get('steps'), 'steps')
        return _coin_change(n, coins)

    raise ValueError(f'Unknown dynamic-programming operation: {operation}')
