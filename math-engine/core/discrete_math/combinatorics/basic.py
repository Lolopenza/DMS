import math

def factorial(n):
    if n < 0:
        raise ValueError("n must be non-negative")
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result

def permutations(n, k):
    if k < 0 or k > n:
        return 0
    return factorial(n) // factorial(n - k)

def combinations(n, k):
    if k < 0 or k > n:
        return 0
    return factorial(n) // (factorial(k) * factorial(n - k))
