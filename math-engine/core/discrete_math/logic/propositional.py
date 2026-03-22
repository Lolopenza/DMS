import itertools
from typing import List, Callable, Dict, Optional

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

def parse_formula(formula_str: str, variable_names: List[str], execution_scope: Optional[Dict[str, object]] = None) -> Optional[Callable]:
    if execution_scope is None:
        execution_scope = get_default_scope()
    try:
        processed = formula_str.replace('&', ' and ').replace('|', ' or ').replace('~', 'not ')
        lambda_vars = ", ".join(variable_names)
        return eval(f"lambda {lambda_vars}: {processed}", {}, execution_scope)
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

