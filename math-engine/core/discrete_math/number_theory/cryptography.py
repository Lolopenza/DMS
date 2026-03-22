import random
from .divisibility import gcd, is_prime, extended_gcd

def modular_exponentiation(base, exponent, modulus):
    if modulus == 1:
        return 0
    result = 1
    base = base % modulus
    while exponent > 0:
        if exponent % 2 == 1:
            result = (result * base) % modulus
        exponent = exponent >> 1
        base = (base * base) % modulus
    return result

def modular_inverse(a, m):
    gcd_val, x, y = extended_gcd(a, m)
    if gcd_val != 1:
        raise ValueError(f"Modular inverse does not exist for {a} mod {m} (gcd is {gcd_val})")
    else:
        return (x % m + m) % m

def _generate_prime_candidate(length):
    p = random.getrandbits(length)
    p |= (1 << length - 1) | 1
    return p

def _is_probably_prime(n, k=40):
    if n < 2: return False
    if n == 2 or n == 3: return True
    if n % 2 == 0: return False
    r, d = 0, n - 1
    while d % 2 == 0:
        r += 1
        d //= 2
    for _ in range(k):
        a = random.randrange(2, n - 1)
        x = pow(a, d, n)
        if x == 1 or x == n - 1:
            continue
        for _ in range(r - 1):
            x = pow(x, 2, n)
            if x == n - 1:
                break
        else:
            return False
    return True

def generate_rsa_keys(bits=1024):
    p = _generate_prime_candidate(bits // 2)
    while not _is_probably_prime(p):
        p = _generate_prime_candidate(bits // 2)
    q = _generate_prime_candidate(bits // 2)
    while not _is_probably_prime(q) or p == q:
        q = _generate_prime_candidate(bits // 2)
    n = p * q
    phi_n = (p - 1) * (q - 1)
    e = 65537
    if gcd(e, phi_n) != 1:
        e = 3
        while gcd(e, phi_n) != 1:
             e += 2
             if e >= phi_n:
                 raise RuntimeError("Could not find a suitable public exponent e")
    d = modular_inverse(e, phi_n)
    public_key = (n, e)
    private_key = (n, d)
    return public_key, private_key

def rsa_encrypt(message, public_key):
    n, e = public_key
    if not isinstance(message, int) or message < 0:
         raise TypeError("Message must be a non-negative integer")
    if message >= n:
        raise ValueError(f"Message {message} is too large for the key size n={n}")
    ciphertext = modular_exponentiation(message, e, n)
    return ciphertext

def rsa_decrypt(ciphertext, private_key):
    n, d = private_key
    if not isinstance(ciphertext, int) or ciphertext < 0 or ciphertext >= n:
         raise ValueError(f"Invalid ciphertext {ciphertext} for key size n={n}")
    message = modular_exponentiation(ciphertext, d, n)
    return message

