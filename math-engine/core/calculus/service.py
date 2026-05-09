"""
SymPy-backed calculus operations for the /api/v1/calculus endpoint.
"""
from __future__ import annotations

import re
from typing import Any, Dict

import sympy as sp
from sympy.parsing.sympy_parser import (
    implicit_multiplication_application,
    parse_expr,
    standard_transformations,
)

_TRANSFORMATIONS = standard_transformations + (implicit_multiplication_application,)


def _base_locals() -> Dict[str, Any]:
    return {
        'sin': sp.sin,
        'cos': sp.cos,
        'tan': sp.tan,
        'asin': sp.asin,
        'acos': sp.acos,
        'atan': sp.atan,
        'sinh': sp.sinh,
        'cosh': sp.cosh,
        'tanh': sp.tanh,
        'sqrt': sp.sqrt,
        'exp': sp.exp,
        'log': sp.log,
        'ln': sp.log,
        'abs': sp.Abs,
        'pi': sp.pi,
        'E': sp.E,
        'I': sp.I,
        'oo': sp.oo,
    }


def _parse_expr(s: str, extra: Dict[str, Any] | None = None) -> sp.Expr:
    if not s or not str(s).strip():
        raise ValueError('Expression must be non-empty')
    local = {**_base_locals(), **(extra or {})}
    return parse_expr(str(s).strip(), local_dict=local, transformations=_TRANSFORMATIONS)


def _parse_point(s: str) -> Any:
    t = str(s).strip().lower()
    if t in ('oo', '+oo', 'inf', '+inf', 'infinity'):
        return sp.oo
    if t in ('-oo', '-inf'):
        return -sp.oo
    return _parse_expr(s)


def _to_result(expr: Any) -> Dict[str, Any]:
    if expr is None:
        return {'repr': 'None', 'latex': ''}
    try:
        latex = sp.latex(expr)
    except Exception:
        latex = ''
    out: Dict[str, Any] = {'repr': str(expr), 'latex': latex}
    try:
        if hasattr(expr, 'evalf') and expr.is_number:
            out['numeric'] = float(expr.evalf())
    except (TypeError, ValueError):
        pass
    return out


def _dir_to_sympy(direction: str) -> str:
    d = (direction or '+-').strip()
    if d in ('+', 'plus', 'right'):
        return '+'
    if d in ('-', 'minus', 'left'):
        return '-'
    return '+-'


def run_limits(op: str, data: Dict[str, Any]) -> Dict[str, Any]:
    if op != 'limit':
        raise ValueError(f'Unknown limits operation: {op}')
    x = sp.symbols(str(data.get('variable') or 'x'))
    expr = _parse_expr(data.get('expr') or '', {str(x): x})
    point = _parse_point(data.get('point') or '0')
    direction = _dir_to_sympy(data.get('direction') or '+-')
    if direction == '+-':
        lim = sp.limit(expr, x, point)
    else:
        lim = sp.limit(expr, x, point, dir=direction)
    return {'value': _to_result(lim)}


def run_derivatives(op: str, data: Dict[str, Any]) -> Dict[str, Any]:
    if op != 'derivative':
        raise ValueError(f'Unknown derivatives operation: {op}')
    x = sp.symbols(str(data.get('variable') or 'x'))
    order = int(data.get('order') or 1)
    expr = _parse_expr(data.get('expr') or '', {str(x): x})
    d = sp.diff(expr, x, order)
    return {'derivative': _to_result(d)}


def run_integrals(op: str, data: Dict[str, Any]) -> Dict[str, Any]:
    x = sp.symbols(str(data.get('variable') or 'x'))
    local = {str(x): x}
    expr = _parse_expr(data.get('expr') or '', local)
    if op == 'indefinite':
        anti = sp.integrate(expr, x)
        return {'antiderivative': _to_result(anti)}
    if op == 'definite':
        a = _parse_point(data.get('a') or '0')
        b = _parse_point(data.get('b') or '1')
        val = sp.integrate(expr, (x, a, b))
        return {'value': _to_result(val)}
    raise ValueError(f'Unknown integrals operation: {op}')


def run_series(op: str, data: Dict[str, Any]) -> Dict[str, Any]:
    if op != 'taylor':
        raise ValueError(f'Unknown series operation: {op}')
    x = sp.symbols(str(data.get('variable') or 'x'))
    expr = _parse_expr(data.get('expr') or '', {str(x): x})
    about = _parse_point(data.get('about') or '0')
    n = int(data.get('taylor_order') or data.get('order') or 6)
    # sympy.series with Order term
    s = expr.series(x, about, n).removeO()
    return {'series': _to_result(s)}


def run_multivariable(op: str, data: Dict[str, Any]) -> Dict[str, Any]:
    if op != 'partial':
        raise ValueError(f'Unknown multivariable operation: {op}')
    wrt_name = str(data.get('wrt') or 'x').strip()
    var_list = [v.strip() for v in re.split(r'[\s,]+', data.get('variables') or 'x,y') if v.strip()]
    syms = sp.symbols(' '.join(var_list))
    if not isinstance(syms, tuple):
        syms = (syms,)
    local = {str(s): s for s in syms}
    expr = _parse_expr(data.get('expr') or '', local)
    if wrt_name not in local:
        raise ValueError(f'wrt={wrt_name} must appear in variables={var_list}')
    wrt = local[wrt_name]
    d = sp.diff(expr, wrt)
    return {'partial': _to_result(d)}


def run_ode(op: str, data: Dict[str, Any]) -> Dict[str, Any]:
    if op != 'first_order':
        raise ValueError(f'Unknown ode operation: {op}')
    rhs_s = str(data.get('ode_rhs') or data.get('expr') or '').strip()
    if not rhs_s:
        raise ValueError('ode_rhs (right-hand side of y′ = …) is required')
    x = sp.symbols('x')
    y = sp.Function('y')
    yx = y(x)
    local = {**_base_locals(), 'x': x, 'y': yx}
    rhs = parse_expr(rhs_s, local_dict=local, transformations=_TRANSFORMATIONS)
    eq = sp.Eq(yx.diff(x), rhs)
    sol = sp.dsolve(eq, yx)
    return {'solution': _to_result(sol)}


def calculate(body: Dict[str, Any]) -> Dict[str, Any]:
    module = body.get('module')
    op = body.get('operation')
    if module == 'limits':
        return run_limits(op, body)
    if module == 'derivatives':
        return run_derivatives(op, body)
    if module == 'integrals':
        return run_integrals(op, body)
    if module == 'series':
        return run_series(op, body)
    if module == 'multivariable':
        return run_multivariable(op, body)
    if module == 'ode':
        return run_ode(op, body)
    raise ValueError(f'Unknown calculus module: {module}')

