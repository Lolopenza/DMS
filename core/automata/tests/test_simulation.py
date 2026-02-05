import pytest
from automata.dfa import DFA
from automata.nfa import NFA
from automata.simulation import AutomatonSimulator

def test_dfa_simulation():
    dfa = DFA(
        states={'q0', 'q1', 'q2'},
        alphabet={'0', '1'},
        transitions={
            'q0,0': 'q0',
            'q0,1': 'q1',
            'q1,0': 'q2',
            'q1,1': 'q0',
            'q2,0': 'q2',
            'q2,1': 'q1'
        },
        start_state='q0',
        accept_states={'q2'}
    )
    
    simulator = AutomatonSimulator(dfa, '101')
    
    # Initial state
    assert simulator.current_states == {'q0'}
    assert simulator.position == 0
    assert not simulator.finished
    assert not simulator.accepted
    
    # Step 1: '1'
    accepted, states = simulator.step_forward()
    assert states == {'q1'}
    assert simulator.position == 1
    assert not simulator.finished
    assert not accepted
    
    # Step 2: '0'
    accepted, states = simulator.step_forward()
    assert states == {'q2'}
    assert simulator.position == 2
    assert not simulator.finished
    assert not accepted
    
    # Step 3: '1'
    accepted, states = simulator.step_forward()
    assert states == {'q1'}
    assert simulator.position == 3
    assert simulator.finished
    assert not accepted
    
    # Step back
    accepted, states = simulator.step_back()
    assert states == {'q2'}
    assert simulator.position == 2
    assert not simulator.finished
    assert not accepted
    
    # Reset
    accepted, states = simulator.reset()
    assert states == {'q0'}
    assert simulator.position == 0
    assert not simulator.finished
    assert not accepted

def test_nfa_simulation():
    nfa = NFA(
        states={'q0', 'q1', 'q2'},
        alphabet={'0', '1'},
        transitions={
            'q0': {'0': {'q0'}, '1': {'q0', 'q1'}, '': set()},
            'q1': {'0': set(), '1': {'q2'}, '': set()},
            'q2': {'0': {'q2'}, '1': {'q2'}, '': set()}
        },
        start_state='q0',
        accept_states={'q2'}
    )
    
    simulator = AutomatonSimulator(nfa, '11')
    
    # Initial state
    assert simulator.current_states == {'q0'}
    assert simulator.position == 0
    assert not simulator.finished
    assert not simulator.accepted
    
    # Step 1: '1'
    accepted, states = simulator.step_forward()
    assert states == {'q0', 'q1'}
    assert simulator.position == 1
    assert not simulator.finished
    assert not accepted
    
    # Step 2: '1'
    accepted, states = simulator.step_forward()
    assert states == {'q0', 'q1', 'q2'}
    assert simulator.position == 2
    assert simulator.finished
    assert accepted
    
    # Step back
    accepted, states = simulator.step_back()
    assert states == {'q0', 'q1'}
    assert simulator.position == 1
    assert not simulator.finished
    assert not accepted
    
    # Reset
    accepted, states = simulator.reset()
    assert states == {'q0'}
    assert simulator.position == 0
    assert not simulator.finished
    assert not accepted

def test_invalid_input():
    dfa = DFA(
        states={'q0', 'q1'},
        alphabet={'0', '1'},
        transitions={
            'q0,0': 'q1',
            'q0,1': 'q0',
            'q1,0': 'q1',
            'q1,1': 'q0'
        },
        start_state='q0',
        accept_states={'q1'}
    )
    
    with pytest.raises(ValueError):
        AutomatonSimulator(dfa, '2')
    
    simulator = AutomatonSimulator(dfa, '01')
    with pytest.raises(ValueError):
        simulator.input_string = '2'
        simulator.step_forward()

def test_nfa_with_epsilon():
    nfa = NFA(
        states={'q0', 'q1', 'q2'},
        alphabet={'a', 'b'},
        transitions={
            'q0': {'': {'q1'}, 'a': set(), 'b': set()},
            'q1': {'a': {'q1'}, 'b': {'q2'}, '': set()},
            'q2': {'a': set(), 'b': set(), '': set()}
        },
        start_state='q0',
        accept_states={'q2'}
    )
    
    simulator = AutomatonSimulator(nfa, 'ab')
    
    # Initial state (with epsilon closure)
    assert simulator.current_states == {'q0', 'q1'}
    
    # Step 1: 'a'
    accepted, states = simulator.step_forward()
    assert states == {'q1'}
    
    # Step 2: 'b'
    accepted, states = simulator.step_forward()
    assert states == {'q2'}
    assert accepted 