from fastapi import APIRouter, HTTPException
from schemas.automata_schemas import AutomataRequest, PDARequest, TMRequest
from core.automata.dfa import DFA
from core.automata.nfa import NFA
from core.automata.regex import RegexToNFA
from core.automata.simulation import AutomatonSimulator
from core.automata.validation import validate_input
from core.automata.pda import PDA
from core.automata.tm import TuringMachine

router = APIRouter(prefix='/api/v1/automata', tags=['Automata'])


def _normalize_dfa_data(data: dict) -> dict:
    """Convert nested-dict transitions {"q0": {"a": "q1"}} → flat {"q0,a": "q1"}."""
    transitions = data.get('transitions', {})
    if transitions and isinstance(next(iter(transitions.values()), None), dict):
        flat = {}
        for state, sym_map in transitions.items():
            for symbol, target in sym_map.items():
                flat[f'{state},{symbol}'] = target
        data = {**data, 'transitions': flat}
    return data


def _normalize_nfa_data(data: dict) -> dict:
    """Convert list-valued transitions {"q0": {"a": ["q1"]}} → set-valued."""
    transitions = data.get('transitions', {})
    normalized = {}
    for state, sym_map in transitions.items():
        normalized[state] = {sym: set(v) if isinstance(v, list) else v
                             for sym, v in sym_map.items()}
    return {**data, 'transitions': normalized}


@router.post('/')
def automata_calculate(req: AutomataRequest):
    op = req.operation

    if op == 'dfa_process':
        dfa_data = _normalize_dfa_data(req.dfa)
        validate_input(dfa_data, 'dfa')
        dfa = DFA(**dfa_data)
        accepted, trace = dfa.process_string(req.input_string or '')
        return {'result': {'accepted': accepted, 'trace': trace}}

    if op == 'nfa_process':
        nfa_data = _normalize_nfa_data(req.nfa)
        validate_input(nfa_data, 'nfa')
        nfa = NFA(**nfa_data)
        accepted, final_states = nfa.process_string(req.input_string or '')
        return {'result': {'accepted': accepted, 'final_states': list(final_states)}}

    if op == 'regex_to_nfa':
        nfa = RegexToNFA(req.regex or '').convert()
        return {'result': nfa.to_dict()}

    if op == 'dfa_minimize':
        dfa_data = _normalize_dfa_data(req.dfa)
        validate_input(dfa_data, 'dfa')
        dfa = DFA(**dfa_data)
        return {'result': dfa.minimize().to_dict()}

    if op == 'nfa_to_dfa':
        nfa_data = _normalize_nfa_data(req.nfa)
        validate_input(nfa_data, 'nfa')
        nfa = NFA(**nfa_data)
        return {'result': nfa.to_dfa().to_dict()}

    if op == 'simulate_step':
        automaton_type = req.automaton_type
        automaton_data = req.automaton_data
        action = req.action or 'forward'
        validate_input(automaton_data, automaton_type)
        if automaton_type == 'dfa':
            automaton = DFA.from_dict(_normalize_dfa_data(automaton_data))
        elif automaton_type == 'nfa':
            automaton = NFA.from_dict(_normalize_nfa_data(automaton_data))
        else:
            raise HTTPException(400, 'Invalid automaton type')
        simulator = AutomatonSimulator(automaton, req.input_string or '')
        if req.current_sim_state:
            simulator.set_state(req.current_sim_state)
        if action == 'forward':
            accepted, states = simulator.step_forward()
        elif action == 'back':
            accepted, states = simulator.step_back()
        elif action == 'reset':
            accepted, states = simulator.reset()
        else:
            raise HTTPException(400, 'Invalid simulation action')
        return {'result': {'state': simulator.get_state(), 'accepted': accepted, 'current_states': list(states)}}

    if op == 'regex_to_dfa':
        nfa = RegexToNFA(req.regex or '').convert()
        return {'result': nfa.to_dfa().to_dict()}

    if op == 'minimize':
        dfa = DFA(**_normalize_dfa_data(req.dfa))
        return {'result': dfa.minimize().to_dict()}

    if op == 'equivalence':
        dfa1 = DFA(**_normalize_dfa_data(req.dfa1))
        dfa2 = DFA(**_normalize_dfa_data(req.dfa2))
        equivalent, counterexample = dfa1.is_equivalent_to(dfa2)
        return {'result': {'equivalent': equivalent, 'counterexample': counterexample}}

    if op in ('union', 'intersection', 'complement', 'difference'):
        dfa1 = DFA(**_normalize_dfa_data(req.dfa1))
        dfa2 = DFA(**_normalize_dfa_data(req.dfa2)) if req.dfa2 else None
        if op == 'union':
            result = dfa1.union(dfa2).to_dict()
        elif op == 'intersection':
            result = dfa1.intersection(dfa2).to_dict()
        elif op == 'complement':
            result = dfa1.complement().to_dict()
        else:
            result = dfa1.difference(dfa2).to_dict()
        return {'result': result}

    if op == 'batch_test':
        automaton_type = req.type
        automaton_data = req.automaton
        strings = req.strings or []
        if automaton_type == 'dfa':
            automaton = DFA(**_normalize_dfa_data(automaton_data))
        elif automaton_type == 'nfa':
            automaton = NFA(**_normalize_nfa_data(automaton_data))
        else:
            raise HTTPException(400, 'Unsupported automaton type')
        results = [{'string': s, 'accepted': automaton.process_string(s)[0]} for s in strings]
        return {'result': results}

    if op == 'import_export':
        return {'result': req.model_dump()}

    raise HTTPException(400, f'Unknown operation: {op}')


@router.post('/pda')
def pda_process(req: PDARequest):
    pda = PDA(**req.pda)
    accepted, trace = pda.process_string(req.input_string)
    return {'result': {'accepted': accepted, 'trace': trace}}


@router.post('/tm')
def tm_process(req: TMRequest):
    tm = TuringMachine(**req.tm)
    accepted, tape_trace = tm.process_string(req.input_string)
    return {'result': {'accepted': accepted, 'tape_trace': tape_trace}}
