from typing import Set, Dict, Any, Tuple, List
from core.discrete_math.automata.finite_automata import FiniteAutomaton
from core.discrete_math.automata.dfa import DFA

class NFA(FiniteAutomaton):
    def __init__(self, states, alphabet, transitions, start_state, accept_states):
        super().__init__(states, alphabet, transitions, start_state, accept_states)
        self._validate()

    def _validate(self):
        for state, state_transitions in self.transitions.items():
            if state not in self.states:
                raise ValueError(f"State '{state}' in transition keys not in states")
            for symbol, next_states in state_transitions.items():
                if symbol != '' and symbol not in self.alphabet:
                    raise ValueError(f"Symbol '{symbol}' in transition not in alphabet")
                if not isinstance(next_states, set):
                    raise TypeError(f"Transition result for ({state}, {symbol}) must be a set")
                for next_state in next_states:
                    if next_state not in self.states:
                        raise ValueError(f"Next state '{next_state}' in transition not in states")
        for state in self.states:
            if state not in self.transitions:
                self.transitions[state] = {}
            for symbol in self.alphabet:
                if symbol not in self.transitions[state]:
                    self.transitions[state][symbol] = set()
            if '' not in self.transitions[state]:
                self.transitions[state][''] = set()

    def _epsilon_closure(self, states: Set[Any]) -> Set[Any]:
        closure = set(states)
        stack = list(states)
        while stack:
            current_state = stack.pop()
            epsilon_neighbors = self.transitions.get(current_state, {}).get('', set())
            for neighbor in epsilon_neighbors:
                if neighbor not in closure:
                    closure.add(neighbor)
                    stack.append(neighbor)
        return frozenset(closure)

    def process_string(self, input_string: str) -> Tuple[bool, Set[Any]]:
        current_states_closure = self._epsilon_closure({self.start_state})
        for symbol in input_string:
            if symbol not in self.alphabet:
                raise ValueError(f"Symbol '{symbol}' not in alphabet")
            next_states_direct = set()
            for state in current_states_closure:
                next_states_direct.update(self.transitions.get(state, {}).get(symbol, set()))
            current_states_closure = self._epsilon_closure(next_states_direct)
            if not current_states_closure:
                break
        accepted = any(state in self.accept_states for state in current_states_closure)
        return accepted, current_states_closure

    def is_string_accepted(self, input_string: str) -> bool:
        accepted, _ = self.process_string(input_string)
        return accepted

    @staticmethod
    def _dfa_state_name(nfa_states_frozenset) -> str:
        """Generate a comma-free name for a DFA state from a set of NFA states."""
        return '{' + '|'.join(sorted(str(s) for s in nfa_states_frozenset)) + '}'

    def to_dfa(self) -> DFA:
        dfa_states = set()
        dfa_transitions = {}
        dfa_start_state_tuple = self._epsilon_closure({self.start_state})
        dfa_start_state = self._dfa_state_name(dfa_start_state_tuple)
        dfa_accept_states = set()
        unprocessed_dfa_states = [dfa_start_state_tuple]
        processed_dfa_states = {dfa_start_state_tuple}
        dfa_state_map = {dfa_start_state_tuple: dfa_start_state}
        while unprocessed_dfa_states:
            current_nfa_states_set = unprocessed_dfa_states.pop(0)
            current_dfa_state_name = dfa_state_map[current_nfa_states_set]
            dfa_states.add(current_dfa_state_name)
            if any(nfa_state in self.accept_states for nfa_state in current_nfa_states_set):
                dfa_accept_states.add(current_dfa_state_name)
            for symbol in self.alphabet:
                next_nfa_states_direct = set()
                for nfa_state in current_nfa_states_set:
                    next_nfa_states_direct.update(self.transitions.get(nfa_state, {}).get(symbol, set()))
                next_nfa_states_closure = self._epsilon_closure(next_nfa_states_direct)
                if not next_nfa_states_closure:
                    continue
                if next_nfa_states_closure not in dfa_state_map:
                    new_dfa_state_name = self._dfa_state_name(next_nfa_states_closure)
                    dfa_state_map[next_nfa_states_closure] = new_dfa_state_name
                target_dfa_state_name = dfa_state_map[next_nfa_states_closure]
                dfa_transitions[f"{current_dfa_state_name},{symbol}"] = target_dfa_state_name
                if next_nfa_states_closure not in processed_dfa_states:
                    unprocessed_dfa_states.append(next_nfa_states_closure)
                    processed_dfa_states.add(next_nfa_states_closure)
        if not dfa_states:
            dfa_states.add(dfa_start_state)
            if any(s in self.accept_states for s in dfa_start_state_tuple):
                dfa_accept_states.add(dfa_start_state)

        # Add dead state to make DFA complete (total) if any transitions are missing
        dead_state = '{dead}'
        needs_dead = False
        for state in list(dfa_states):
            for symbol in self.alphabet:
                if f'{state},{symbol}' not in dfa_transitions:
                    dfa_transitions[f'{state},{symbol}'] = dead_state
                    needs_dead = True
        if needs_dead:
            dfa_states.add(dead_state)
            for symbol in self.alphabet:
                dfa_transitions[f'{dead_state},{symbol}'] = dead_state

        return DFA(
            states=dfa_states,
            alphabet=self.alphabet,
            transitions=dfa_transitions,
            start_state=dfa_start_state,
            accept_states=dfa_accept_states
        )

    def to_dict(self) -> dict:
        serializable_transitions = {}
        for state, transitions in self.transitions.items():
            serializable_transitions[state] = {sym: list(nxt) for sym, nxt in transitions.items()}
        return {
            'id': self.id,
            'states': list(self.states),
            'alphabet': list(self.alphabet),
            'transitions': serializable_transitions,
            'start_state': self.start_state,
            'accept_states': list(self.accept_states)
        }

    @classmethod
    def from_dict(cls, data: dict) -> 'NFA':
        deserialized_transitions = {}
        for state, transitions in data['transitions'].items():
            deserialized_transitions[state] = {sym: set(nxt) for sym, nxt in transitions.items()}
        nfa = cls(
            states=set(data['states']),
            alphabet=set(data['alphabet']),
            transitions=deserialized_transitions,
            start_state=data['start_state'],
            accept_states=set(data['accept_states'])
        )
        nfa.id = data.get('id')
        return nfa

    def __str__(self) -> str:
        return (f"NFA(states={self.states}, alphabet={self.alphabet}, "
                f"start_state='{self.start_state}', accept_states={self.accept_states})")