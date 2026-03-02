from fastapi import APIRouter, HTTPException
from schemas.number_theory_schemas import NumberTheoryRequest
from core.number_theory.divisibility import gcd, lcm, divisors, prime_factorization, euler_totient
from core.number_theory.cryptography import (
    modular_exponentiation, modular_inverse, generate_rsa_keys, rsa_encrypt, rsa_decrypt,
)

router = APIRouter(prefix='/api/v1/number_theory', tags=['Number Theory'])


@router.post('/')
def number_theory_calculate(req: NumberTheoryRequest):
    op = req.operation

    if op == 'gcd':
        return {'result': gcd(req.a, req.b)}
    if op == 'lcm':
        return {'result': lcm(req.a, req.b)}
    if op == 'divisors':
        return {'result': divisors(req.n)}
    if op == 'factorize':
        return {'result': prime_factorization(req.n)}
    if op == 'totient':
        return {'result': euler_totient(req.n)}
    if op == 'mod_exp':
        return {'result': modular_exponentiation(req.base, req.exponent, req.modulus)}
    if op == 'mod_inv':
        return {'result': modular_inverse(req.a, req.m)}

    if op == 'crt':
        if not req.remainders or not req.moduli or len(req.remainders) != len(req.moduli):
            raise HTTPException(400, 'remainders and moduli must be equal-length lists')
        from sympy.ntheory.modular import solve_congruence
        pairs = [(int(r), int(m)) for r, m in zip(req.remainders, req.moduli)]
        x, _ = solve_congruence(*pairs)
        return {'result': int(x)}

    if op == 'rsa_generate':
        bits = req.bits or 16
        pub, priv = generate_rsa_keys(bits)
        return {'result': {'public': pub, 'private': priv}}
    if op == 'rsa_encrypt':
        return {'result': rsa_encrypt(req.message, (req.n, req.e))}
    if op == 'rsa_decrypt':
        return {'result': rsa_decrypt(req.ciphertext, (req.n, req.d))}

    raise HTTPException(400, f'Unknown operation: {op}')
