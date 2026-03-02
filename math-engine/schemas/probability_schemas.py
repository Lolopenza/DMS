from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class ProbabilityRequest(BaseModel):
    operation: str
    favorable: Optional[int] = None
    total: Optional[int] = None
    joint: Optional[float] = None
    condition: Optional[float] = None
    prior: Optional[float] = None
    true_pos: Optional[float] = None
    false_pos: Optional[float] = None
    n: Optional[int] = None
    p: Optional[float] = None
    k: Optional[int] = None
    # lambda is a reserved keyword in Python — aliased
    lambda_: Optional[float] = None

    model_config = {
        'populate_by_name': True,
        'json_schema_extra': {
            'examples': [
                {'operation': 'simple', 'favorable': 3, 'total': 6},
                {'operation': 'conditional', 'joint': 0.2, 'condition': 0.5},
                {'operation': 'bayes', 'prior': 0.01, 'true_pos': 0.9, 'false_pos': 0.1},
                {'operation': 'binomial_pmf', 'n': 10, 'p': 0.5, 'k': 3},
                {'operation': 'poisson_pmf', 'lambda_': 3.0, 'k': 2},
                {'operation': 'geometric_pmf', 'p': 0.3, 'k': 4},
            ]
        }
    }

    @classmethod
    def model_validate(cls, obj: Any, **kwargs):
        if isinstance(obj, dict) and 'lambda' in obj:
            obj = dict(obj)
            obj['lambda_'] = obj.pop('lambda')
        return super().model_validate(obj, **kwargs)


class HypergeometricRequest(BaseModel):
    M: int
    n: int
    N: int
    k: int


class NegativeBinomialRequest(BaseModel):
    n: int
    p: float
    k: int


class JointProbabilityRequest(BaseModel):
    probs: List[float]


class CustomPMFRequest(BaseModel):
    values: List[Any]
    probs: List[float]


class StepByStepRequest(BaseModel):
    operation: str
    params: Dict[str, Any] = {}


class VennRequest(BaseModel):
    sets: Dict[str, List[Any]]


class SimulateRequest(BaseModel):
    distribution: str
    params: Dict[str, Any] = {}
    trials: int = 1000
