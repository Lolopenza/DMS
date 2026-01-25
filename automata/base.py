from typing import Set, Any

class Automaton:
    def __init__(self, states, alphabet, transitions, start_state, accept_states):
        self.states = states
        self.alphabet = alphabet
        self.transitions = transitions
        self.start_state = start_state
        self.accept_states = accept_states
        self.id = None
        self._validate_base()

    def _validate_base(self):
        if self.start_state not in self.states:
            raise ValueError(f"Start state '{self.start_state}' not in states")
        for state in self.accept_states:
            if state not in self.states:
                raise ValueError(f"Accept state '{state}' not in states")