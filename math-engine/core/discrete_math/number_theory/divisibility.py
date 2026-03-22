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

