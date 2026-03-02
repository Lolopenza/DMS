import math
from .basic import combinations, factorial

def pigeonhole_principle(n_pigeons, n_holes):
    if not isinstance(n_pigeons, int) or n_pigeons <= 0:
        raise ValueError("Number of pigeons must be a positive integer.")
    if not isinstance(n_holes, int) or n_holes <= 0:
        raise ValueError("Number of holes must be a positive integer.")

    return math.ceil(n_pigeons / n_holes)

def catalan_number(n):
    if not isinstance(n, int) or n < 0:
        raise ValueError("Catalan number index n must be a non-negative integer.")

    try:
        comb = combinations(2 * n, n)
        return comb // (n + 1)
    except ValueError as e:
        raise ValueError(f"Could not calculate Catalan number for n={n}: {e}")

def stirling_numbers_second_kind(n, k):
    if n == k == 0:
        return 1
    if n == 0 or k == 0:
        return 0
    return k * stirling_numbers_second_kind(n - 1, k) + stirling_numbers_second_kind(n - 1, k - 1)

def bell_number(n):
    bell = [0] * (n + 1)
    bell[0] = 1
    for i in range(1, n + 1):
        for j in range(i - 1, -1, -1):
            bell[j + 1] += bell[j]
    return bell[n]

if __name__ == '__main__':
    print("--- Combinatorics Advanced Examples ---")

    print("Pigeonhole Principle:")
    try:
        pigeons, holes = 10, 3
        min_in_one_hole = pigeonhole_principle(pigeons, holes)
        print(f"With {pigeons} pigeons and {holes} holes, at least one hole must contain {min_in_one_hole} pigeons.")

        pigeons, holes = 5, 5
        min_in_one_hole = pigeonhole_principle(pigeons, holes)
        print(f"With {pigeons} pigeons and {holes} holes, at least one hole must contain {min_in_one_hole} pigeons.")

        pigeons, holes = 12, 5
        min_in_one_hole = pigeonhole_principle(pigeons, holes)
        print(f"With {pigeons} pigeons and {holes} holes, at least one hole must contain {min_in_one_hole} pigeons.")
    except ValueError as e:
        print(f"Error applying Pigeonhole Principle: {e}")

    print("\nCatalan Numbers:")
    try:
        for i in range(11):
            print(f"C_{i} = {catalan_number(i)}")
    except ValueError as e:
        print(f"Error calculating Catalan numbers: {e}")
