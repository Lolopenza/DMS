from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class ProbabilityRequest(BaseModel):
    operation: str
    favorable: Optional[int] = None
    total: Optional[int] = None
    pA: Optional[float] = None
    pB: Optional[float] = None
    pAandB: Optional[float] = None
    pEvent: Optional[float] = None
    joint: Optional[float] = None
    condition: Optional[float] = None
    priors: Optional[List[float]] = None
    likelihoods: Optional[List[float]] = None
    prior: Optional[float] = None
    true_pos: Optional[float] = None
    false_pos: Optional[float] = None
    n: Optional[int] = None
    p: Optional[float] = None
    k: Optional[int] = None
    dist: Optional[str] = None
    # lambda is a reserved keyword in Python — aliased
    lambda_: Optional[float] = None

    model_config = {
        'populate_by_name': True,
        'json_schema_extra': {
            'examples': [
                {'operation': 'simple', 'favorable': 3, 'total': 6},
                {'operation': 'union', 'pA': 0.6, 'pB': 0.5, 'pAandB': 0.3},
                {'operation': 'complement', 'pEvent': 0.25},
                {'operation': 'independence_check', 'pA': 0.4, 'pB': 0.5, 'pAandB': 0.2},
                {'operation': 'conditional', 'joint': 0.2, 'condition': 0.5},
                {'operation': 'total_probability', 'priors': [0.7, 0.3], 'likelihoods': [0.2, 0.8]},
                {'operation': 'bayes', 'prior': 0.01, 'true_pos': 0.9, 'false_pos': 0.1},
                {'operation': 'binomial_pmf', 'n': 10, 'p': 0.5, 'k': 3},
                {'operation': 'poisson_pmf', 'lambda_': 3.0, 'k': 2},
                {'operation': 'geometric_pmf', 'p': 0.3, 'k': 4},
                {'operation': 'distribution_summary', 'dist': 'binomial', 'n': 10, 'p': 0.5, 'k': 4},
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
