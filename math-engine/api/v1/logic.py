import re
from typing import List, Set, Tuple
import sympy as sp
from sympy.logic.boolalg import SOPform, POSform
from fastapi import APIRouter, HTTPException
from schemas.discrete_math.logic import LogicRequest
from core.discrete_math.logic.propositional import generate_truth_table_from_string, check_logical_equivalence_from_strings

router = APIRouter(prefix='/api/v1/logic', tags=['Logic'])


def normalize_formula(formula: str) -> str:
    s = re.sub(r'\s+', ' ', formula)
    s = s.replace('¬', '~').replace('∧', '&').replace('∨', '|').replace('⊕', '^')
    s = s.replace('→', '->').replace('↔', '<->')
    s = s.replace('&', ' and ').replace('|', ' or ').replace('~', 'not ')
    s = re.sub(r'([A-Za-z0-9_])\s*->\s*([A-Za-z0-9_])', r'implies(\1, \2)', s)
    s = re.sub(r'([A-Za-z0-9_])\s*<->\s*([A-Za-z0-9_])', r'iff(\1, \2)', s)
    s = re.sub(r'([A-Za-z0-9_])\s*\^\s*([A-Za-z0-9_])', r'(\1 != \2)', s)
    return s


def extract_formula_variables(formula: str) -> set:
    return set(re.findall(r'\b([A-Za-z])\b', formula))


def table_dict_to_rows(table_dict: dict, variables: List[str]) -> Tuple[List[str], List[List[bool]], List[bool]]:
    headers = [*variables, 'Result']
    result_column = table_dict.get('Result', [])
    rows = []
    for i in range(len(result_column)):
        row = [table_dict[var][i] for var in variables]
        row.append(result_column[i])
        rows.append(row)
    return headers, rows, result_column


def classify_result_column(result_column: List[bool]) -> str:
    if all(result_column):
        return 'tautology'
    if not any(result_column):
        return 'contradiction'
    return 'contingency'


def _assert_formula_uses_listed_vars(formula: str, var_set: Set[str], field_name: str):
    used = extract_formula_variables(formula)
    if not used.issubset(var_set):
        raise HTTPException(400, f'{field_name} uses variables not listed: {sorted(used - var_set)}')


def _truth_table_payload(formula: str, variables: List[str]) -> dict:
    table_raw = generate_truth_table_from_string(normalize_formula(formula), variables)
    headers, rows, result_column = table_dict_to_rows(table_raw, variables)
    return {
        'headers': headers,
        'table': rows,
        'classification': classify_result_column(result_column),
        'raw': table_raw,
    }


@router.post('/')
def calculate(req: LogicRequest):
    var_set = set(req.variables)

    if req.operation == 'truth_table':
        if not req.formula:
            raise HTTPException(400, 'formula is required for truth_table')
        _assert_formula_uses_listed_vars(req.formula, var_set, 'formula')
        try:
            result = _truth_table_payload(req.formula, req.variables)
            return {'result': result}
        except Exception as e:
            raise HTTPException(400, f'Error generating truth table: {e}')

    if req.operation == 'equivalence':
        if not req.formula1 or not req.formula2:
            raise HTTPException(400, 'formula1 and formula2 are required for equivalence')
        _assert_formula_uses_listed_vars(req.formula1, var_set, 'formula1')
        _assert_formula_uses_listed_vars(req.formula2, var_set, 'formula2')
        try:
            result = check_logical_equivalence_from_strings(
                normalize_formula(req.formula1),
                normalize_formula(req.formula2),
                req.variables,
            )
            return {'result': result}
        except Exception as e:
            raise HTTPException(400, f'Error checking equivalence: {e}')

    if req.operation == 'formula_analysis':
        if not req.formula:
            raise HTTPException(400, 'formula is required for formula_analysis')
        _assert_formula_uses_listed_vars(req.formula, var_set, 'formula')
        try:
            payload = _truth_table_payload(req.formula, req.variables)
            result_column = [row[-1] for row in payload['table']]
            true_rows = sum(1 for x in result_column if x)
            false_rows = len(result_column) - true_rows
            return {
                'result': {
                    **payload,
                    'true_rows': true_rows,
                    'false_rows': false_rows,
                }
            }
        except Exception as e:
            raise HTTPException(400, f'Error analyzing formula: {e}')

    if req.operation == 'implication':
        if not req.formula1 or not req.formula2:
            raise HTTPException(400, 'formula1 and formula2 are required for implication')
        _assert_formula_uses_listed_vars(req.formula1, var_set, 'formula1')
        _assert_formula_uses_listed_vars(req.formula2, var_set, 'formula2')
        try:
            implication_formula = f'(not ({normalize_formula(req.formula1)})) or ({normalize_formula(req.formula2)})'
            table_raw = generate_truth_table_from_string(implication_formula, req.variables)
            _, rows, result_column = table_dict_to_rows(table_raw, req.variables)
            counterexamples = [rows[i] for i, value in enumerate(result_column) if not value]
            return {
                'result': {
                    'valid': all(result_column),
                    'counterexamples': counterexamples,
                    'checked_formula': f'({req.formula1}) -> ({req.formula2})',
                }
            }
        except Exception as e:
            raise HTTPException(400, f'Error checking implication: {e}')

    if req.operation == 'normal_forms':
        if not req.formula:
            raise HTTPException(400, 'formula is required for normal_forms')
        _assert_formula_uses_listed_vars(req.formula, var_set, 'formula')
        try:
            table_raw = generate_truth_table_from_string(normalize_formula(req.formula), req.variables)
            result_column = table_raw.get('Result', [])
            minterms = []
            maxterms = []
            for i in range(len(result_column)):
                assignment = [1 if table_raw[var][i] else 0 for var in req.variables]
                if result_column[i]:
                    minterms.append(assignment)
                else:
                    maxterms.append(assignment)

            symbols = sp.symbols(' '.join(req.variables))
            if len(req.variables) == 1:
                symbols = [symbols]

            dnf = SOPform(symbols, minterms) if minterms else sp.false
            cnf = POSform(symbols, maxterms) if maxterms else sp.true
            return {
                'result': {
                    'dnf': str(dnf),
                    'cnf': str(cnf),
                    'classification': classify_result_column(result_column),
                }
            }
        except Exception as e:
            raise HTTPException(400, f'Error building normal forms: {e}')

    raise HTTPException(400, f'Unknown operation: {req.operation}')
