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

if __name__ == '__main__':
    print("--- Propositional Logic Examples ---")

    print("Basic Operations:")
    p, q = True, False
    print(f"p = {p}, q = {q}")
    print(f"NOT p = {negate(p)}")
    print(f"p AND q = {conjoin(p, q)}")
    print(f"p OR q = {disjoin(p, q)}")
    print(f"p IMPLIES q = {implies(p, q)}")
    print(f"q IMPLIES p = {implies(q, p)}")
    print(f"p IFF q = {iff(p, q)}")

    print("\nTruth Table for: P AND (Q OR NOT P)")
    variables1 = ['P', 'Q']
    scope = {'conjoin': conjoin, 'disjoin': disjoin, 'negate': negate, 'implies': implies, 'iff': iff, 'True':True, 'False':False}
    expr1_func_direct = lambda p_val, q_val: conjoin(p_val, disjoin(q_val, negate(p_val)))
    table1_direct = generate_truth_table(variables1, expr1_func_direct)
    print("Direct lambda table:")
    print_truth_table(table1_direct, variables1)

    parsed_expr1_func = parse_formula("P and (Q or not P)", variables1, scope)
    if parsed_expr1_func:
        table1_parsed = generate_truth_table(variables1, parsed_expr1_func)
        print("\nParsed formula table (P and (Q or not P)):");
        print_truth_table(table1_parsed, variables1)
        assert table1_direct['Result'] == table1_parsed['Result']
    else:
        print("Failed to parse expr1")


    print("\nTruth Table for: (P -> Q) <-> (NOT Q -> NOT P)")
    variables2 = ['P', 'Q']
    expr2_func_direct = lambda p_val, q_val: iff(implies(p_val, q_val), implies(negate(q_val), negate(p_val)))
    table2_direct = generate_truth_table(variables2, expr2_func_direct)
    print("Direct lambda table:")
    print_truth_table(table2_direct, variables2)

    formula_str2 = "iff(implies(P, Q), implies(negate(Q), negate(P)))"
    parsed_expr2_func = parse_formula(formula_str2, variables2, scope)
    if parsed_expr2_func:
        table2_parsed = generate_truth_table(variables2, parsed_expr2_func)
        print("\nParsed formula table (iff(implies(P,Q), implies(negate(Q),negate(P)))):");
        print_truth_table(table2_parsed, variables2)
        assert table2_direct['Result'] == table2_parsed['Result']
    else:
        print("Failed to parse expr2")
        
    print("\nTruth Table for: NOT P")
    variables3 = ['P']
    expr3 = lambda p_val: negate(p_val)
    table3 = generate_truth_table(variables3, expr3)
    print_truth_table(table3, variables3)

    print("\nEquivalence Check Example:")
    vars_eq = ['P', 'Q']
    f1_str = "implies(P,Q)" 
    f2_str = "disjoin(negate(P), Q)" 
    
    f2_str_op = "not P or Q"

    are_eq = check_logical_equivalence(vars_eq, f1_str, f2_str_op, scope)
    print(f"Are '{f1_str}' and '{f2_str_op}' equivalent? {are_eq}") 

    f3_str = "conjoin(P,Q)" 
    are_eq2 = check_logical_equivalence(vars_eq, f1_str, f3_str, scope)
    print(f"Are '{f1_str}' and '{f3_str}' equivalent? {are_eq2}")
    are_eq2 = check_logical_equivalence(vars_eq, f1_str, f3_str, scope)
    print(f"Are '{f1_str}' and '{f3_str}' equivalent? {are_eq2}")
    
    parsed_expr1_func = parse_formula("P and (Q or not P)", variables1, scope)
    if parsed_expr1_func:
        table1_parsed = generate_truth_table(variables1, parsed_expr1_func)
        print("\nParsed formula table (P and (Q or not P)):");
        print_truth_table(table1_parsed, variables1)
        assert table1_direct['Result'] == table1_parsed['Result']
    else:
        print("Failed to parse expr1")


    print("\nTruth Table for: (P -> Q) <-> (NOT Q -> NOT P)")
    variables2 = ['P', 'Q']
    # Direct:
    expr2_func_direct = lambda p_val, q_val: iff(implies(p_val, q_val), implies(negate(q_val), negate(p_val)))
    table2_direct = generate_truth_table(variables2, expr2_func_direct)
    print("Direct lambda table:")
    print_truth_table(table2_direct, variables2)

    # Parsed:
    # JS sends: "(P → Q) ↔ (¬Q → ¬P)"
    # convertFormulaToBackendSyntax: "(P -> Q) <-> (~Q -> ~P)"
    # parse_formula (Python): "(implies(P, Q)) iff (implies(not Q, not P))"
    # or if implies/iff are not treated as functions but operators by eval:
    # "((not P) or Q) == ((not (not Q)) or (not P))"
    # The current parse_formula expects implies and iff to be functions in the scope.
    formula_str2 = "iff(implies(P, Q), implies(negate(Q), negate(P)))"
    parsed_expr2_func = parse_formula(formula_str2, variables2, scope)
    if parsed_expr2_func:
        table2_parsed = generate_truth_table(variables2, parsed_expr2_func)
        print("\nParsed formula table (iff(implies(P,Q), implies(negate(Q),negate(P)))):");
        print_truth_table(table2_parsed, variables2)
        assert table2_direct['Result'] == table2_parsed['Result']
    else:
        print("Failed to parse expr2")
        
    print("\nTruth Table for: NOT P")
    variables3 = ['P']
    expr3 = lambda p_val: negate(p_val)
    table3 = generate_truth_table(variables3, expr3)
    print_truth_table(table3, variables3)

    print("\nEquivalence Check Example:")
    # P -> Q  vs  ~P | Q
    # JS sends: "P → Q" and "¬P ∨ Q"
    # Backend gets: "P -> Q" and "~P | Q" (after convertFormulaToBackendSyntax)
    # parse_formula gets: "implies(P,Q)" and "not P or Q"
    vars_eq = ['P', 'Q']
    f1_str = "implies(P,Q)" 
    f2_str = "disjoin(negate(P), Q)" # or "not P or Q"
    
    # Test with "not P or Q" to match the operator style
    f2_str_op = "not P or Q"

    are_eq = check_logical_equivalence(vars_eq, f1_str, f2_str_op, scope)
    print(f"Are '{f1_str}' and '{f2_str_op}' equivalent? {are_eq}") # Expected: True

    f3_str = "conjoin(P,Q)" # P & Q
    are_eq2 = check_logical_equivalence(vars_eq, f1_str, f3_str, scope)
    print(f"Are '{f1_str}' and '{f3_str}' equivalent? {are_eq2}") # Expected: False

