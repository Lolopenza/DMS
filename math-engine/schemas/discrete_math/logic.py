from typing import List, Optional
from pydantic import BaseModel, field_validator


class LogicRequest(BaseModel):
    operation: str
    variables: List[str]
    formula: Optional[str] = None
    formula1: Optional[str] = None
    formula2: Optional[str] = None

    @field_validator('operation')
    @classmethod
    def validate_operation(cls, v: str) -> str:
        allowed = {'truth_table', 'equivalence', 'formula_analysis', 'implication', 'normal_forms'}
        if v not in allowed:
            raise ValueError(f'operation must be one of {allowed}')
        return v

    @field_validator('variables')
    @classmethod
    def validate_variables(cls, v: List[str]) -> List[str]:
        if not v:
            raise ValueError('variables must be a non-empty list')
        for var in v:
            if not (isinstance(var, str) and len(var) == 1 and var.isalpha()):
                raise ValueError(f'Each variable must be a single letter, got: {var!r}')
        return v

    model_config = {
        'json_schema_extra': {
            'examples': [
                {
                    'operation': 'truth_table',
                    'variables': ['P', 'Q'],
                    'formula': 'P & Q',
                },
                {
                    'operation': 'equivalence',
                    'variables': ['P', 'Q'],
                    'formula1': 'P | Q',
                    'formula2': 'Q | P',
                },
                {
                    'operation': 'formula_analysis',
                    'variables': ['P', 'Q'],
                    'formula': '(P -> Q) & P',
                },
                {
                    'operation': 'implication',
                    'variables': ['P', 'Q'],
                    'formula1': 'P & Q',
                    'formula2': 'P',
                },
                {
                    'operation': 'normal_forms',
                    'variables': ['P', 'Q', 'R'],
                    'formula': '(P -> Q) & (Q -> R)',
                },
            ]
        }
    }
