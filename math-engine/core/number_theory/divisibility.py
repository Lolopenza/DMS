import math
from functools import reduce 

def gcd(a, b):
    a = abs(a)
    b = abs(b)
    while b:
        a, b = b, a % b
    return a

def lcm(a, b):
    if a == 0 or b == 0:
        return 0
    return abs(a * b) // gcd(a, b)

def extended_gcd(a, b):
    if b == 0:
        return a, 1, 0
    else:
        g, x, y = extended_gcd(b, a % b)
        return g, y, x - (a // b) * y

def is_prime(n):
    if not isinstance(n, int):
        raise TypeError("Input must be an integer.")
    if n <= 1:
        return False
    if n <= 3:
        return True
    if n % 2 == 0 or n % 3 == 0:
        return False
    i = 5
    while i * i <= n:
        if n % i == 0 or n % (i + 2) == 0:
            return False
        i += 6
    return True

def prime_factorization(n):
    if not isinstance(n, int) or n <= 1:
        raise ValueError("Input must be an integer greater than 1.")

    factors = {}
    d = 2
    temp_n = n
    while d * d <= temp_n:
        while temp_n % d == 0:
            factors[d] = factors.get(d, 0) + 1
            temp_n //= d
        d += 1
    if temp_n > 1: 
        factors[temp_n] = factors.get(temp_n, 0) + 1
    return factors

def divisors(n):
    if not isinstance(n, int):
        raise TypeError("Input must be an integer.")
    n = abs(n)
    if n == 0:
        return set()

    divs = {1, n}
    for i in range(2, int(math.sqrt(n)) + 1):
        if n % i == 0:
            divs.add(i)
            divs.add(n // i)
    return sorted(list(divs)) 

def euler_totient(n):
    if not isinstance(n, int) or n <= 0:
        raise ValueError("Input must be a positive integer.")
    if n == 1:
        return 1

    factors = prime_factorization(n)
    result = n
    for p in factors:
        result = result * (1.0 - (1.0 / float(p)))
    return int(result)

def chinese_remainder_theorem(remainders, moduli):
    if not remainders or not moduli or len(remainders) != len(moduli):
        raise ValueError("Remainders and moduli lists must be non-empty and have the same length.")

    N = 1
    for n_i in moduli:
        if not isinstance(n_i, int) or n_i <= 1:
            raise ValueError("Moduli must be integers greater than 1.")
        N *= n_i

    for i in range(len(moduli)):
        for j in range(i + 1, len(moduli)):
            if gcd(moduli[i], moduli[j]) != 1:
                raise ValueError("Moduli must be pairwise coprime.")

    result = 0
    for i in range(len(moduli)):
        a_i = remainders[i]
        n_i = moduli[i]
        if not isinstance(a_i, int):
            raise ValueError("Remainders must be integers.")

        N_i = N // n_i
        g, x, y = extended_gcd(N_i, n_i)
        result += a_i * N_i * x

    return result % N

def gcd_multiple(numbers):
    if not numbers:
        raise ValueError("Input list cannot be empty")
    if len(numbers) == 1:
        return abs(numbers[0])
    
    result = abs(numbers[0])
    for i in range(1, len(numbers)):
        result = gcd(result, abs(numbers[i]))
        if result == 1: 
            return 1
    return result

if __name__ == '__main__':
    print("--- Divisibility Examples ---")

    print("\nIs Prime:")
    print(f"Is 17 prime? {is_prime(17)}")
    print(f"Is 1 prime? {is_prime(1)}")
    print(f"Is 2 prime? {is_prime(2)}")
    print(f"Is 15 prime? {is_prime(15)}")
    print(f"Is 97 prime? {is_prime(97)}")

    print("\nPrime Factorization:")
    print(f"Factorization of 60: {prime_factorization(60)}")
    print(f"Factorization of 97: {prime_factorization(97)}")
    print(f"Factorization of 1024: {prime_factorization(1024)}")

    print("\nDivisors:")
    print(f"Divisors of 60: {divisors(60)}")
    print(f"Divisors of 17: {divisors(17)}")
    print(f"Divisors of 1: {divisors(1)}")
    print(f"Divisors of 0: {divisors(0)}")

    print("\nEuler's Totient Function (phi):")
    print(f"phi(10) = {euler_totient(10)}") 
    print(f"phi(7) = {euler_totient(7)}")  
    print(f"phi(1) = {euler_totient(1)}")
    print(f"phi(12) = {euler_totient(12)}") 

    print("\nChinese Remainder Theorem:")
    remainders_crt = [2, 3, 2]
    moduli_crt = [3, 5, 7]
    try:
        solution = chinese_remainder_theorem(remainders_crt, moduli_crt)
        print(f"System: x = {remainders_crt[0]} (mod {moduli_crt[0]}), x = {remainders_crt[1]} (mod {moduli_crt[1]}), x = {remainders_crt[2]} (mod {moduli_crt[2]})")
        print(f"Smallest non-negative solution: x = {solution}") 
    except ValueError as e:
        print(f"CRT Error: {e}")

    remainders_fail = [1, 2]
    moduli_fail = [4, 6]
    try:
        chinese_remainder_theorem(remainders_fail, moduli_fail)
    except ValueError as e:
        print(f"\nCRT Error (expected for non-coprime moduli [4, 6]): {e}")

    print("\nGCD Multiple Examples:")
    nums1 = [12, 18, 30]
    print(f"gcd({nums1}) = {gcd_multiple(nums1)}") 
    nums2 = [8, 9, 10]
    print(f"gcd({nums2}) = {gcd_multiple(nums2)}") 
    nums3 = [48, 60, 72, 108]
    print(f"gcd({nums3}) = {gcd_multiple(nums3)}") 
    nums4 = [17]
    print(f"gcd({nums4}) = {gcd_multiple(nums4)}") 
    try:
        gcd_multiple([])
    except ValueError as e:
        print(f"gcd([]) Error: {e}")
    print(f"Divisors of 1: {divisors(1)}")
    print(f"Divisors of 0: {divisors(0)}")

    print("\nEuler's Totient Function (phi):")
    print(f"phi(10) = {euler_totient(10)}") 
    print(f"phi(7) = {euler_totient(7)}")  
    print(f"phi(1) = {euler_totient(1)}")
    print(f"phi(12) = {euler_totient(12)}") 

    print("\nChinese Remainder Theorem:")
    remainders_crt = [2, 3, 2]
    moduli_crt = [3, 5, 7]
    try:
        solution = chinese_remainder_theorem(remainders_crt, moduli_crt)
        print(f"System: x = {remainders_crt[0]} (mod {moduli_crt[0]}), x = {remainders_crt[1]} (mod {moduli_crt[1]}), x = {remainders_crt[2]} (mod {moduli_crt[2]})")
        print(f"Smallest non-negative solution: x = {solution}") 
    except ValueError as e:
        print(f"CRT Error: {e}")

    remainders_fail = [1, 2]
    moduli_fail = [4, 6]
    try:
        chinese_remainder_theorem(remainders_fail, moduli_fail)
    except ValueError as e:
        print(f"\nCRT Error (expected for non-coprime moduli [4, 6]): {e}")

    print("\nGCD Multiple Examples:")
    nums1 = [12, 18, 30]
    print(f"gcd({nums1}) = {gcd_multiple(nums1)}") 
    nums2 = [8, 9, 10]
    print(f"gcd({nums2}) = {gcd_multiple(nums2)}") 
    nums3 = [48, 60, 72, 108]
    print(f"gcd({nums3}) = {gcd_multiple(nums3)}") 
    nums4 = [17]
    print(f"gcd({nums4}) = {gcd_multiple(nums4)}") 
    try:
        gcd_multiple([])
    except ValueError as e:
        print(f"gcd([]) Error: {e}")
    nums4 = [17]
    print(f"gcd({nums4}) = {gcd_multiple(nums4)}") # Expected: 17
    try:
        gcd_multiple([])
    except ValueError as e:
        print(f"gcd([]) Error: {e}")
