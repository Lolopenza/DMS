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

if __name__ == '__main__':
    print("--- Combinatorics Basic Examples ---")

    print("Factorial:")
    try:
        print(f"5! = {factorial(5)}")
        print(f"0! = {factorial(0)}")
    except ValueError as e:
        print(f"Error calculating factorial: {e}")

    print("\nPermutations:")
    try:
        print(f"P(5, 2) = {permutations(5, 2)}")
        print(f"P(6, 6) = {permutations(6, 6)}") 
        print(f"P(6) = {permutations(6)}")      
        print(f"P(7, 0) = {permutations(7, 0)}")
    except ValueError as e:
        print(f"Error calculating permutations: {e}")

    print("\nCombinations:")
    try:
        print(f"C(5, 2) = {combinations(5, 2)}")
        print(f"C(6, 6) = {combinations(6, 6)}")
        print(f"C(7, 0) = {combinations(7, 0)}")
        print(f"C(10, 3) = {combinations(10, 3)}")
    except ValueError as e:
        print(f"Error calculating combinations: {e}")
        print(f"P(5, 2) = {permutations(5, 2)}")
        print(f"P(6, 6) = {permutations(6, 6)}")
        print(f"P(6) = {permutations(6)}")
        print(f"P(7, 0) = {permutations(7, 0)}")
    except ValueError as e:
        print(f"Error calculating permutations: {e}")

    print("\nCombinations:")
    try:
        print(f"C(5, 2) = {combinations(5, 2)}")
        print(f"C(6, 6) = {combinations(6, 6)}")
        print(f"C(7, 0) = {combinations(7, 0)}")
        print(f"C(10, 3) = {combinations(10, 3)}")
    except ValueError as e:
        print(f"Error calculating combinations: {e}")
        # print(f"C(4, 5) = {combinations(4, 5)}") # Should raise ValueError
    except ValueError as e:
        print(f"Error calculating combinations: {e}")
