import ast
import itertools
from typing import Any, Callable, Dict, List, Optional

def negate(p: bool) -> bool:
    return not p

def conjoin(p: bool, q: bool) -> bool:
    return p and q

def disjoin(p: bool, q: bool) -> bool:
    return p or q

def implies(p: bool, q: bool) -> bool:
    return (not p) or q

def iff(p: bool, q: bool) -> bool:
    return implies(p, q) and implies(q, p)

def get_default_scope() -> Dict[str, object]:
    return {
        'implies': implies,
        'iff': iff,
        'negate': negate,
        'conjoin': conjoin,
        'disjoin': disjoin,
        'not': negate,
        'and': conjoin,
        'or': disjoin,
        'True': True,
        'False': False
    }


def _safe_eval_node(node: ast.AST, variables: Dict[str, bool], scope: Dict[str, object]) -> bool:
    if isinstance(node, ast.Expression):
        return _safe_eval_node(node.body, variables, scope)

    if isinstance(node, ast.BoolOp):
        values = [_safe_eval_node(value, variables, scope) for value in node.values]
        if isinstance(node.op, ast.And):
            return all(values)
        if isinstance(node.op, ast.Or):
            return any(values)
        raise ValueError('Unsupported boolean operator')

    if isinstance(node, ast.UnaryOp) and isinstance(node.op, ast.Not):
        return not _safe_eval_node(node.operand, variables, scope)

    if isinstance(node, ast.Compare):
        if len(node.ops) != 1 or len(node.comparators) != 1:
            raise ValueError('Chained comparisons are not supported')
        left = _safe_eval_node(node.left, variables, scope)
        right = _safe_eval_node(node.comparators[0], variables, scope)
        op = node.ops[0]
        if isinstance(op, ast.Eq):
            return left == right
        if isinstance(op, ast.NotEq):
            return left != right
        raise ValueError('Unsupported comparison operator')

    if isinstance(node, ast.Name):
        if node.id in variables:
            return variables[node.id]
        if node.id in scope and isinstance(scope[node.id], bool):
            return scope[node.id]
        raise ValueError(f'Unknown identifier: {node.id}')

    if isinstance(node, ast.Constant) and isinstance(node.value, bool):
        return node.value

    if isinstance(node, ast.Call):
        if not isinstance(node.func, ast.Name):
            raise ValueError('Only direct function calls are allowed')
        fn_name = node.func.id
        fn = scope.get(fn_name)
        if not callable(fn):
            raise ValueError(f'Unsupported function: {fn_name}')
        if node.keywords:
            raise ValueError('Keyword arguments are not supported')
        args = [_safe_eval_node(arg, variables, scope) for arg in node.args]
        result = fn(*args)
        if not isinstance(result, bool):
            raise ValueError(f'Function {fn_name} must return bool')
        return result

    raise ValueError(f'Unsupported expression node: {type(node).__name__}')


def _compile_safe_formula(formula_str: str, variable_names: List[str], scope: Dict[str, object]) -> Callable:
    tree = ast.parse(formula_str, mode='eval')

    allowed_callables = {name for name, value in scope.items() if callable(value)}
    allowed_bool_constants = {name for name, value in scope.items() if isinstance(value, bool)}
    allowed_variables = set(variable_names)
    allowed_names = allowed_variables | allowed_callables | allowed_bool_constants

    for node in ast.walk(tree):
        if isinstance(node, ast.Name) and node.id not in allowed_names:
            raise ValueError(f'Unknown identifier: {node.id}')
        if isinstance(node, ast.Call) and not isinstance(node.func, ast.Name):
            raise ValueError('Only direct function calls are allowed')
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id not in allowed_callables:
            raise ValueError(f'Unsupported function: {node.func.id}')

        allowed_nodes = (
            ast.Expression,
            ast.BoolOp,
            ast.UnaryOp,
            ast.Compare,
            ast.Name,
            ast.Constant,
            ast.Call,
            ast.Load,
            ast.And,
            ast.Or,
            ast.Not,
            ast.Eq,
            ast.NotEq,
        )
        if not isinstance(node, allowed_nodes):
            raise ValueError(f'Unsupported syntax: {type(node).__name__}')

    def evaluator(*args):
        if len(args) != len(variable_names):
            raise ValueError('Argument count does not match variable count')
        variables = {name: bool(value) for name, value in zip(variable_names, args)}
        return _safe_eval_node(tree, variables, scope)

    return evaluator

def parse_formula(formula_str: str, variable_names: List[str], execution_scope: Optional[Dict[str, object]] = None) -> Optional[Callable]:
    if execution_scope is None:
        execution_scope = get_default_scope()
    try:
        processed = formula_str.replace('&', ' and ').replace('|', ' or ').replace('~', 'not ')
        return _compile_safe_formula(processed, variable_names, execution_scope)
    except Exception:
        return None

def generate_truth_table(variables: List[str], expression_func: Callable) -> Dict[str, List[bool]]:
    num_vars = len(variables)
    table = {var: [] for var in variables}
    table['Result'] = []
    for values in itertools.product([False, True], repeat=num_vars):
        for i, var in enumerate(variables):
            table[var].append(values[i])
        try:
            result = expression_func(*values)
        except Exception:
            result = None
        table['Result'].append(result)
    return table

def generate_truth_table_from_string(formula_str: str, variables: List[str]) -> Dict[str, List[bool]]:
    func = parse_formula(formula_str, variables)
    if func is None:
        raise ValueError(f"Could not parse formula: {formula_str}")
    return generate_truth_table(variables, func)

def check_logical_equivalence(variables: List[str], formula1_str: str, formula2_str: str, execution_scope: Optional[Dict[str, object]] = None) -> bool:
    if execution_scope is None:
        execution_scope = get_default_scope()
    func1 = parse_formula(formula1_str, variables, execution_scope)
    func2 = parse_formula(formula2_str, variables, execution_scope)
    if func1 is None or func2 is None:
        return False
    table1 = generate_truth_table(variables, func1)
    table2 = generate_truth_table(variables, func2)
    return table1['Result'] == table2['Result']

def check_logical_equivalence_from_strings(formula1_str: str, formula2_str: str, variables: List[str]) -> bool:
    return check_logical_equivalence(variables, formula1_str, formula2_str)

