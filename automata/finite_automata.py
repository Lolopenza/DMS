from automata.base import Automaton

class FiniteAutomaton(Automaton):
    def __init__(self, states, alphabet, transitions, start_state, accept_states):
        super().__init__(states, alphabet, transitions, start_state, accept_states)
