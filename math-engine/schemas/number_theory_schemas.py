from typing import List, Optional
from pydantic import BaseModel


class NumberTheoryRequest(BaseModel):
    operation: str
    a: Optional[int] = None
    b: Optional[int] = None
    n: Optional[int] = None
    base: Optional[int] = None
    exponent: Optional[int] = None
    modulus: Optional[int] = None
    m: Optional[int] = None
    bits: Optional[int] = None
    message: Optional[int] = None
    e: Optional[int] = None
    d: Optional[int] = None
    ciphertext: Optional[int] = None
    remainders: Optional[List[int]] = None
    moduli: Optional[List[int]] = None

    model_config = {
        'json_schema_extra': {
            'examples': [
                {'operation': 'gcd', 'a': 48, 'b': 18},
                {'operation': 'lcm', 'a': 12, 'b': 8},
                {'operation': 'factorize', 'n': 360},
                {'operation': 'totient', 'n': 36},
                {'operation': 'mod_exp', 'base': 2, 'exponent': 10, 'modulus': 1000},
                {'operation': 'mod_inv', 'a': 3, 'm': 11},
                {'operation': 'crt', 'remainders': [2, 3, 2], 'moduli': [3, 5, 7]},
                {'operation': 'rsa_generate', 'bits': 16},
            ]
        }
    }
