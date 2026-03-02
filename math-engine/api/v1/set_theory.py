import re
from collections import Counter
from typing import Any

from fastapi import APIRouter, HTTPException
from schemas.set_theory_schemas import SetOperationRequest, SetTheoryRequest
from core.set_theory.set_operations import (
    get_power_set, set_complement, cartesian_product,
    set_union, set_intersection, set_difference,
    set_symmetric_difference, is_subset,
)

router = APIRouter(prefix='/api/v1/set_theory', tags=['Set Theory'])

# ── helpers ───────────────────────────────────────────────────────────────────

def try_number(x):
    try:
        if isinstance(x, str) and x.strip() == '':
            return x
        n = float(x)
        return int(n) if n.is_integer() else n
    except Exception:
        return x


def parse_set_elements(s) -> set:
    return set(try_number(x) for x in s)


def parse_advanced_set(input_str: str, named_sets=None, named_universes=None) -> dict:
    steps = []
    input_str = input_str.strip()
    named_sets = named_sets or {}
    named_universes = named_universes or {}

    if input_str in named_sets:
        steps.append(f'Loaded named set: {input_str}')
        inner = parse_advanced_set(named_sets[input_str], named_sets, named_universes)
        return {'set': set(inner['set']) if isinstance(inner['set'], (set, list)) else set(), 'type': 'named', 'steps': steps}

    if input_str in named_universes:
        steps.append(f'Loaded named universe: {input_str}')
        inner = parse_advanced_set(named_universes[input_str], named_sets, named_universes)
        return {'set': set(inner['set']) if isinstance(inner['set'], (set, list)) else set(), 'type': 'named_universe', 'steps': steps}

    inf_map = {'N': 'ℕ', 'Z': 'ℤ', 'Q': 'ℚ', 'R': 'ℝ', 'C': 'ℂ'}
    if input_str in inf_map or input_str in inf_map.values():
        steps.append(f'Recognized infinite set: {input_str}')
        return {'set': inf_map.get(input_str, input_str), 'type': 'infinite', 'steps': steps}

    if input_str.startswith('{') and '|' in input_str:
        try:
            body = input_str.strip('{} ')
            _, cond = body.split('|', 1)
            cond = cond.strip()
            if 'in' in cond and '..' in cond:
                rng = cond.split('in')[1].strip()
                start, end = map(int, rng.split('..'))
                s = set(range(start, end + 1))
                steps.append(f'Parsed set-builder range: {start}..{end}')
                return {'set': s, 'type': 'range', 'steps': steps}
            steps.append(f'Set-builder condition not evaluated: {cond}')
            return {'set': set(), 'type': 'set-builder', 'steps': steps}
        except Exception as e:
            steps.append(f'Failed to parse set-builder: {e}')
            return {'set': set(), 'type': 'error', 'steps': steps}

    if '..' in input_str:
        try:
            start, end = map(int, input_str.split('..'))
            s = set(range(start, end + 1))
            steps.append(f'Parsed range: {start}..{end}')
            return {'set': s, 'type': 'range', 'steps': steps}
        except Exception as e:
            steps.append(f'Failed to parse range: {e}')
            return {'set': set(), 'type': 'error', 'steps': steps}

    if input_str.startswith('{') and '(' in input_str:
        try:
            items = input_str.strip('{} ').split('),')
            fuzzy = {}
            for item in items:
                item = item.strip('() {}')
                if not item:
                    continue
                el, mu = item.split(',')
                fuzzy[el.strip()] = float(mu.strip())
            steps.append(f'Parsed fuzzy set: {fuzzy}')
            return {'set': fuzzy, 'type': 'fuzzy', 'steps': steps}
        except Exception as e:
            steps.append(f'Failed to parse fuzzy set: {e}')
            return {'set': {}, 'type': 'error', 'steps': steps}

    if input_str.count(',') > 0:
        items = [x.strip() for x in input_str.strip('{} ').split(',') if x.strip()]
        multiset = Counter(items)
        steps.append(f'Parsed multiset: {multiset}')
        return {'set': multiset, 'type': 'multiset', 'steps': steps}

    items = [x.strip() for x in re.split(r'[ ,]+', input_str) if x.strip()]
    s: set = set()
    for x in items:
        try:
            s.add(int(x))
        except Exception:
            try:
                s.add(float(x))
            except Exception:
                s.add(x)
    steps.append(f'Parsed as plain set: {s}')
    return {'set': s, 'type': 'plain', 'steps': steps}


def parse_set_with_steps(input_val: Any, named_sets=None, named_universes=None) -> dict:
    if isinstance(input_val, str):
        return parse_advanced_set(input_val, named_sets, named_universes)
    if isinstance(input_val, list):
        s: set = set()
        steps = []
        for x in input_val:
            if isinstance(x, str):
                res = parse_advanced_set(x, named_sets, named_universes)
                if isinstance(res['set'], set):
                    s.update(res['set'])
                steps.extend(res['steps'])
            else:
                s.add(x)
        steps.append(f'Parsed list as set: {s}')
        return {'set': s, 'type': 'plain', 'steps': steps}
    return {'set': set(), 'type': 'error', 'steps': ['Input not recognized']}


def to_set(s) -> set:
    if hasattr(s, 'keys'):
        return set(s.keys())
    if isinstance(s, (set, list, tuple)):
        return set(s)
    return set()


# ── simple set operations endpoint (legacy-compatible) ────────────────────────

@router.post('/operations')
def set_operations(req: SetOperationRequest):
    op = req.operation
    setA = parse_set_elements(req.setA or [])
    setB = parse_set_elements(req.setB or [])
    setC = parse_set_elements(req.setC or [])
    universe = parse_set_elements(req.universe or [])

    if op == 'union':
        return {'result': list(set_union(setA, setB))}
    if op == 'intersection':
        return {'result': list(set_intersection(setA, setB))}
    if op == 'difference':
        return {'result': list(set_difference(setA, setB))}
    if op == 'symmetric':
        return {'result': list(set_symmetric_difference(setA, setB))}
    if op == 'empty':
        return {'result': len(setC) == 0}
    if op == 'finite':
        return {'result': '...' not in setC}
    if op == 'infinite':
        return {'result': '...' in setC}
    if op == 'cardinality':
        return {'result': '∞' if '...' in setC else len(setC)}
    if op == 'subset':
        return {'result': is_subset(setA, setB)}
    if op == 'superset':
        return {'result': is_subset(setB, setA)}
    if op == 'disjoint':
        return {'result': setA.isdisjoint(setB)}
    if op == 'equal':
        return {'result': setA == setB}
    if op == 'power':
        return {'result': [list(fs) for fs in get_power_set(setC)]}
    if op == 'complement':
        if not universe:
            raise HTTPException(400, 'universe is required for complement')
        return {'result': list(set_complement(universe, setC))}
    if op == 'cartesian':
        return {'result': [list(pair) for pair in cartesian_product(setA, setB)]}
    raise HTTPException(400, f'Unknown operation: {op}')


# ── advanced set theory endpoint ──────────────────────────────────────────────

@router.post('/')
def set_theory(req: SetTheoryRequest):
    action = req.action
    named_sets: dict = req.named_sets or {}
    named_universes: dict = req.named_universes or {}

    # Named sets/universes CRUD
    if action == 'list_named_sets':
        return {'named_sets': named_sets}
    if action == 'list_named_universes':
        return {'named_universes': named_universes}
    if action in ('save_named_set', 'delete_named_set', 'save_named_universe', 'delete_named_universe'):
        # State is managed client-side or by Java backend; engine just echoes
        return {'success': True, 'message': 'State managed by caller'}

    # Batch
    if action == 'batch':
        results = []
        for op_data in (req.operations or []):
            try:
                sub = SetTheoryRequest(**op_data)
                results.append(set_theory(sub))
            except Exception as e:
                results.append({'error': str(e)})
        return {'results': results}

    # Set operations
    op = req.operation
    setA_parsed = parse_set_with_steps(req.setA or [], named_sets, named_universes)
    setB_parsed = parse_set_with_steps(req.setB or [], named_sets, named_universes)
    univ_parsed = parse_set_with_steps(req.universe or [], named_sets, named_universes)
    steps = []
    result = None

    a_set = to_set(setA_parsed['set'])
    b_set = to_set(setB_parsed['set'])
    u_set = to_set(univ_parsed['set'])

    if op == 'union':
        result = list(a_set | b_set)
        steps = setA_parsed['steps'] + setB_parsed['steps'] + [f'Union: {result}']
    elif op == 'intersection':
        result = list(a_set & b_set)
        steps = setA_parsed['steps'] + setB_parsed['steps'] + [f'Intersection: {result}']
    elif op == 'difference':
        result = list(a_set - b_set)
        steps = setA_parsed['steps'] + setB_parsed['steps'] + [f'Difference: {result}']
    elif op in ('symmetric', 'symmetric_difference'):
        result = list(a_set ^ b_set)
        steps = setA_parsed['steps'] + setB_parsed['steps'] + [f'Symmetric difference: {result}']
    elif op == 'complement':
        if not u_set:
            raise HTTPException(400, 'universe is required for complement')
        result = list(u_set - a_set)
        steps = univ_parsed['steps'] + setA_parsed['steps'] + [f'Complement: {result}']
    elif op == 'subset':
        result = a_set.issubset(b_set)
        steps = setA_parsed['steps'] + setB_parsed['steps'] + [f'Subset: {result}']
    elif op == 'superset':
        result = b_set.issubset(a_set)
        steps = setA_parsed['steps'] + setB_parsed['steps'] + [f'Superset: {result}']
    elif op == 'disjoint':
        result = a_set.isdisjoint(b_set)
        steps = setA_parsed['steps'] + setB_parsed['steps'] + [f'Disjoint: {result}']
    elif op == 'equal':
        result = a_set == b_set
        steps = setA_parsed['steps'] + setB_parsed['steps'] + [f'Equal: {result}']
    elif op == 'proper_subset':
        result = a_set < b_set
        steps = setA_parsed['steps'] + setB_parsed['steps'] + [f'Proper subset: {result}']
    elif op in ('power', 'power_set'):
        result = [list(s) for s in get_power_set(a_set)]
        steps = setA_parsed['steps'] + [f'Power set computed']
    elif op in ('cartesian', 'cartesian_product'):
        result = [list(pair) for pair in cartesian_product(a_set, b_set)]
        steps = setA_parsed['steps'] + setB_parsed['steps'] + [f'Cartesian product']
    elif op in ('empty', 'finite', 'infinite', 'cardinality'):
        if op == 'empty':
            result = len(a_set) == 0
        elif op == 'finite':
            result = '...' not in a_set
        elif op == 'infinite':
            result = '...' in a_set
        elif op == 'cardinality':
            result = '∞' if '...' in a_set else len(a_set)
        steps = setA_parsed['steps'] + [f'{op}: {result}']
    elif op and op.startswith('relation_'):
        rel = set(tuple(pair) for pair in (req.relation or []))
        univ = to_set(univ_parsed['set'])

        def is_reflexive(r, u): return all((x, x) in r for x in u)
        def is_symmetric(r): return all((b, a) in r for (a, b) in r)
        def is_antisymmetric(r): return all(a == b or (b, a) not in r for (a, b) in r)
        def is_transitive(r): return all((a, d) in r for (a, b) in r for (c, d) in r if b == c)
        def rel_inverse(r): return set((b, a) for (a, b) in r)
        def rel_composition(r1, r2): return set((a, d) for (a, b) in r1 for (c, d) in r2 if b == c)
        def reflexive_closure(r, u): return r | set((x, x) for x in u)
        def symmetric_closure(r): return r | set((b, a) for (a, b) in r)
        def transitive_closure(r):
            closure = set(r)
            changed = True
            while changed:
                new = set((a, d) for (a, b) in closure for (c, d) in closure if b == c)
                if not new <= closure:
                    closure |= new
                else:
                    changed = False
            return closure

        if op == 'relation_reflexive':
            result = is_reflexive(rel, univ)
        elif op == 'relation_symmetric':
            result = is_symmetric(rel)
        elif op == 'relation_antisymmetric':
            result = is_antisymmetric(rel)
        elif op == 'relation_transitive':
            result = is_transitive(rel)
        elif op == 'relation_inverse':
            result = [list(p) for p in rel_inverse(rel)]
        elif op == 'relation_composition':
            r2 = set(tuple(pair) for pair in (req.relation2 or []))
            result = [list(p) for p in rel_composition(rel, r2)]
        elif op == 'relation_reflexive_closure':
            result = [list(p) for p in reflexive_closure(rel, univ)]
        elif op == 'relation_symmetric_closure':
            result = [list(p) for p in symmetric_closure(rel)]
        elif op == 'relation_transitive_closure':
            result = [list(p) for p in transitive_closure(rel)]
        else:
            raise HTTPException(400, f'Unknown relation operation: {op}')
        steps.append(f'{op}: {result}')
    else:
        raise HTTPException(400, f'Unknown operation: {op}')

    return {'result': result, 'steps': steps}
