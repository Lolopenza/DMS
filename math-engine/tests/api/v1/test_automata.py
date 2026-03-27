import pytest


URL = '/api/v1/automata/'

DFA_AB = {
    'states': ['q0', 'q1', 'q2', 'qd'],
    'alphabet': ['a', 'b'],
    'transitions': {
        'q0': {'a': 'q1', 'b': 'qd'},
        'q1': {'a': 'qd', 'b': 'q2'},
        'q2': {'a': 'qd', 'b': 'qd'},
        'qd': {'a': 'qd', 'b': 'qd'},
    },
    'start_state': 'q0',
    'accept_states': ['q2'],
}

NFA_A_STAR = {
    'states': ['q0', 'q1'],
    'alphabet': ['a', 'b'],
    'transitions': {'q0': {'a': ['q0', 'q1']}, 'q1': {'b': ['q1']}},
    'start_state': 'q0',
    'accept_states': ['q1'],
}


def test_given_valid_dfa_and_accepting_word_when_processed_then_returns_accepted_true(client):
    r = client.post(URL, json={'operation': 'dfa_process', 'dfa': DFA_AB, 'input_string': 'ab'})
    assert r.status_code == 200
    assert r.json()['result']['accepted'] is True


def test_given_valid_dfa_and_rejecting_word_when_processed_then_returns_accepted_false(client):
    r = client.post(URL, json={'operation': 'dfa_process', 'dfa': DFA_AB, 'input_string': 'ba'})
    assert r.status_code == 200
    assert r.json()['result']['accepted'] is False


def test_given_valid_dfa_and_empty_word_when_processed_then_returns_rejected(client):
    r = client.post(URL, json={'operation': 'dfa_process', 'dfa': DFA_AB, 'input_string': ''})
    assert r.status_code == 200
    assert r.json()['result']['accepted'] is False


def test_given_valid_nfa_when_processed_then_response_contains_acceptance_flag(client):
    r = client.post(URL, json={'operation': 'nfa_process', 'nfa': NFA_A_STAR, 'input_string': 'ab'})
    assert r.status_code == 200
    assert 'accepted' in r.json()['result']


def test_given_regex_when_converted_then_returns_nfa_shape(client):
    r = client.post(URL, json={'operation': 'regex_to_nfa', 'regex': 'a*b'})
    assert r.status_code == 200
    result = r.json()['result']
    assert 'states' in result
    assert 'transitions' in result


def test_given_valid_dfa_when_minimized_then_returns_minimized_structure(client):
    r = client.post(URL, json={'operation': 'dfa_minimize', 'dfa': DFA_AB})
    assert r.status_code == 200
    assert 'states' in r.json()['result']


def test_given_valid_nfa_when_converted_to_dfa_then_returns_dfa_structure(client):
    r = client.post(URL, json={'operation': 'nfa_to_dfa', 'nfa': NFA_A_STAR})
    assert r.status_code == 200
    result = r.json()['result']
    assert 'states' in result
    assert 'transitions' in result


def test_given_batch_input_when_batch_test_called_then_returns_result_for_each_string(client):
    r = client.post(URL, json={
        'operation': 'batch_test',
        'type': 'dfa',
        'automaton': DFA_AB,
        'strings': ['ab', 'ba', 'a', ''],
    })
    assert r.status_code == 200
    results = r.json()['result']
    assert len(results) == 4
    accepted_map = {item['string']: item['accepted'] for item in results}
    assert accepted_map['ab'] is True
    assert accepted_map['ba'] is False


def test_given_valid_pda_when_processed_then_response_contains_acceptance_flag(client):
    pda = {
        'states': ['q0', 'q1', 'q2'],
        'input_alphabet': ['a', 'b'],
        'stack_alphabet': ['A', 'Z'],
        'transitions': {
            'q0,a,Z': ['q0,AZ'],
            'q0,a,A': ['q0,AA'],
            'q0,b,A': ['q1,'],
            'q1,b,A': ['q1,'],
            'q1,,Z': ['q2,Z'],
        },
        'start_state': 'q0',
        'accept_states': ['q2'],
        'start_stack': 'Z',
    }
    r = client.post('/api/v1/automata/pda', json={'pda': pda, 'input_string': 'aabb'})
    assert r.status_code == 200
    assert 'accepted' in r.json()['result']


def test_given_unknown_operation_when_automata_endpoint_called_then_returns_400(client):
    r = client.post(URL, json={'operation': 'invalid'})
    assert r.status_code == 400
