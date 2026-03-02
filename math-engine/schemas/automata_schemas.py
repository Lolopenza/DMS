from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class DFAData(BaseModel):
    states: List[str]
    alphabet: List[str]
    transitions: Dict[str, Dict[str, str]]
    start_state: str
    accept_states: List[str]


class NFAData(BaseModel):
    states: List[str]
    alphabet: List[str]
    transitions: Dict[str, Dict[str, List[str]]]
    start_state: str
    accept_states: List[str]


class AutomataRequest(BaseModel):
    operation: str
    dfa: Optional[Dict[str, Any]] = None
    nfa: Optional[Dict[str, Any]] = None
    dfa1: Optional[Dict[str, Any]] = None
    dfa2: Optional[Dict[str, Any]] = None
    regex: Optional[str] = None
    input_string: Optional[str] = None
    automaton_type: Optional[str] = None
    automaton_data: Optional[Dict[str, Any]] = None
    action: Optional[str] = None
    current_sim_state: Optional[Any] = None
    type: Optional[str] = None
    automaton: Optional[Dict[str, Any]] = None
    strings: Optional[List[str]] = None

    model_config = {
        'json_schema_extra': {
            'examples': [
                {
                    'operation': 'dfa_process',
                    'input_string': 'ab',
                    'dfa': {
                        'states': ['q0', 'q1', 'q2'],
                        'alphabet': ['a', 'b'],
                        'transitions': {'q0': {'a': 'q1'}, 'q1': {'b': 'q2'}, 'q2': {}},
                        'start_state': 'q0',
                        'accept_states': ['q2'],
                    },
                },
                {
                    'operation': 'regex_to_nfa',
                    'regex': 'a*b',
                },
                {
                    'operation': 'nfa_to_dfa',
                    'nfa': {
                        'states': ['q0', 'q1'],
                        'alphabet': ['a', 'b'],
                        'transitions': {'q0': {'a': ['q0', 'q1']}, 'q1': {'b': ['q1']}},
                        'start_state': 'q0',
                        'accept_states': ['q1'],
                    },
                },
            ]
        }
    }


class PDARequest(BaseModel):
    pda: Dict[str, Any]
    input_string: Optional[str] = ''


class TMRequest(BaseModel):
    tm: Dict[str, Any]
    input_string: Optional[str] = ''
