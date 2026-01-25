import jsonschema
from jsonschema import validate

dfa_schema = {
    "type": "object",
    "properties": {
        "states": {"type": "array", "items": {"type": "string"}},
        "alphabet": {"type": "array", "items": {"type": "string"}},
        "transitions": {"type": "object"},
        "start_state": {"type": "string"},
        "accept_states": {"type": "array", "items": {"type": "string"}},
        "input_string": {"type": "string"}
    },
    "required": ["states", "alphabet", "transitions", "start_state", "accept_states"]
}

nfa_schema = {
    "type": "object",
    "properties": {
        "states": {"type": "array", "items": {"type": "string"}},
        "alphabet": {"type": "array", "items": {"type": "string"}},
        "transitions": {"type": "object"},
        "start_state": {"type": "string"},
        "accept_states": {"type": "array", "items": {"type": "string"}},
        "input_string": {"type": "string"}
    },
    "required": ["states", "alphabet", "transitions", "start_state", "accept_states"]
}

def validate_input(data, automaton_type):
    if automaton_type == 'dfa':
        required_keys = ['states', 'alphabet', 'transitions', 'start_state', 'accept_states']
    elif automaton_type == 'nfa':
        required_keys = ['states', 'alphabet', 'transitions', 'start_state', 'accept_states']
    else:
        raise ValueError('Unknown automaton type')
    for key in required_keys:
        if key not in data:
            raise ValueError(f'Missing required key: {key}')

    if automaton_type == 'dfa':
        validate(instance=data, schema=dfa_schema)
    elif automaton_type == 'nfa':
        validate(instance=data, schema=nfa_schema)
    else:
        raise ValueError('Unknown automaton type for validation')