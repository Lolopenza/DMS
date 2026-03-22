from typing import Dict, Set, List, Any, Tuple, Optional
from core.discrete_math.automata.dfa import DFA
from core.discrete_math.automata.nfa import NFA

class AutomatonSimulator:
    def __init__(self, automaton, input_string):
        self.automaton = automaton
        self.input_string = input_string
        self.position = 0
        self.current_states = {automaton.start_state}
        self.finished = False
        self.accepted = False
        self.trace = []

    def step_forward(self):
        if self.finished:
            return self.accepted, self.current_states
        if self.position >= len(self.input_string):
            self.finished = True
            self.accepted = any(state in self.automaton.accept_states for state in self.current_states)
            return self.accepted, self.current_states
        symbol = self.input_string[self.position]
        next_states = set()
        for state in self.current_states:
            if symbol in self.automaton.transitions[state]:
                next_states.update(self.automaton.transitions[state][symbol])
        self.current_states = next_states
        self.position += 1
        self.trace.append((self.position, self.current_states))
        if self.position >= len(self.input_string):
            self.finished = True
            self.accepted = any(state in self.automaton.accept_states for state in self.current_states)
        return self.accepted, self.current_states

    def step_back(self):
        if self.position == 0:
            return self.accepted, self.current_states
        self.position -= 1
        self.current_states = self.trace[self.position - 1][1] if self.position > 0 else {self.automaton.start_state}
        self.finished = False
        self.accepted = False
        return self.accepted, self.current_states

    def reset(self):
        self.position = 0
        self.current_states = {self.automaton.start_state}
        self.finished = False
        self.accepted = False
        self.trace = []
        return self.accepted, self.current_states

    def get_state(self):
        return {
            'position': self.position,
            'current_states': list(self.current_states),
            'finished': self.finished,
            'accepted': self.accepted,
            'trace': self.trace
        }