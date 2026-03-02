from typing import Optional
from pydantic import BaseModel


class CombinatoricsRequest(BaseModel):
    operation: str
    n: Optional[int] = None
    r: Optional[int] = None
    k: Optional[int] = None
    pigeons: Optional[int] = None
    holes: Optional[int] = None

    model_config = {
        'json_schema_extra': {
            'examples': [
                {'operation': 'factorial', 'n': 5},
                {'operation': 'permutation', 'n': 5, 'r': 2},
                {'operation': 'combination', 'n': 5, 'r': 2},
                {'operation': 'catalan', 'n': 4},
                {'operation': 'stirling', 'n': 4, 'k': 2},
                {'operation': 'pigeonhole', 'pigeons': 10, 'holes': 3},
            ]
        }
    }
