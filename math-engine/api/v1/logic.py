import re
from fastapi import APIRouter, HTTPException
from schemas.logic_schemas import LogicRequest
from core.logic.propositional import generate_truth_table_from_string, check_logical_equivalence_from_strings

router = APIRouter(prefix='/api/v1/logic', tags=['Logic'])


def normalize_formula(formula: str) -> str:
    s = re.sub(r'\s+', ' ', formula)
    s = s.replace('&', ' and ').replace('|', ' or ').replace('~', 'not ')
    s = re.sub(r'([A-Za-z0-9_])\s*->\s*([A-Za-z0-9_])', r'implies(\1, \2)', s)
    s = re.sub(r'([A-Za-z0-9_])\s*<->\s*([A-Za-z0-9_])', r'iff(\1, \2)', s)
    s = re.sub(r'([A-Za-z0-9_])\s*\^\s*([A-Za-z0-9_])', r'(\1 != \2)', s)
    return s


def extract_formula_variables(formula: str) -> set:
    return set(re.findall(r'\b([A-Za-z])\b', formula))


@router.post('/')
def calculate(req: LogicRequest):
    var_set = set(req.variables)

    if req.operation == 'truth_table':
        if not req.formula:
            raise HTTPException(400, 'formula is required for truth_table')
        used = extract_formula_variables(req.formula)
        if not used.issubset(var_set):
            raise HTTPException(400, f'Formula uses variables not listed: {sorted(used - var_set)}')
        try:
            result = generate_truth_table_from_string(normalize_formula(req.formula), req.variables)
            return {'result': result}
        except Exception as e:
            raise HTTPException(400, f'Error generating truth table: {e}')

    if req.operation == 'equivalence':
        if not req.formula1 or not req.formula2:
            raise HTTPException(400, 'formula1 and formula2 are required for equivalence')
        used = extract_formula_variables(req.formula1) | extract_formula_variables(req.formula2)
        if not used.issubset(var_set):
            raise HTTPException(400, f'Formulas use variables not listed: {sorted(used - var_set)}')
        try:
            result = check_logical_equivalence_from_strings(
                normalize_formula(req.formula1),
                normalize_formula(req.formula2),
                req.variables,
            )
            return {'result': result}
        except Exception as e:
            raise HTTPException(400, f'Error checking equivalence: {e}')

    raise HTTPException(400, f'Unknown operation: {req.operation}')
