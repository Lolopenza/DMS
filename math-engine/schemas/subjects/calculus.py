from typing import Literal

from pydantic import BaseModel, Field


class CalculusRequest(BaseModel):
    """Unified calculus calculator request (SymPy-backed)."""

    module: Literal['limits', 'derivatives', 'integrals', 'series', 'multivariable', 'ode']
    operation: str = Field(
        ...,
        description='Sub-operation, e.g. limit, derivative, indefinite, definite, taylor, partial, ode',
    )
    expr: str = Field(default='', description='Expression in x (or multivariable symbols as named)')
    variable: str = Field(default='x', description='Main variable for limit/derivative/integral/series')
    wrt: str = Field(default='x', description='Variable for partial derivative')
    variables: str = Field(default='x,y', description='Comma-separated symbols for multivariable context')
    point: str = Field(default='0', description="Limit point: 0, oo, -oo, or expression")
    direction: str = Field(
        default='+-',
        description="One-sided limit: '+-' both, '+' from right, '-' from left",
    )
    order: int = Field(default=1, ge=1, le=12, description='Derivative or series order / depth')
    taylor_order: int = Field(default=6, ge=1, le=20, description='Number of terms in Taylor expansion')
    about: str = Field(default='0', description='Expand about this point (series)')
    a: str = Field(default='0', description='Definite integral lower bound')
    b: str = Field(default='1', description='Definite integral upper bound')
    ode_rhs: str = Field(
        default='',
        description="First-order ODE in form y' = f(x, y); right-hand side only, e.g. x + y",
    )

    model_config = {
        'json_schema_extra': {
            'examples': [
                {
                    'module': 'limits',
                    'operation': 'limit',
                    'expr': 'sin(x)/x',
                    'variable': 'x',
                    'point': '0',
                    'direction': '+-',
                },
                {
                    'module': 'derivatives',
                    'operation': 'derivative',
                    'expr': 'x**3 + 2*x',
                    'variable': 'x',
                    'order': 1,
                },
            ]
        }
    }
