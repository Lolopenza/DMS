from typing import List, Dict, Any, Set, Tuple
from core.discrete_math.automata.finite_automata import FiniteAutomaton

class DFA(FiniteAutomaton):
    def __init__(self, states, alphabet, transitions, start_state, accept_states):
        super().__init__(states, alphabet, transitions, start_state, accept_states)
        self._validate()

    def _validate(self):
        for key in self.transitions:
            if isinstance(key, tuple):
                state, symbol = key
            else:
                state, symbol = key.split(',')
            if state not in self.states:
                raise ValueError(f"State '{state}' in transition not in states")
            if symbol not in self.alphabet:
                raise ValueError(f"Symbol '{symbol}' in transition not in alphabet")
            if self.transitions[key] not in self.states:
                raise ValueError(f"Target state '{self.transitions[key]}' not in states")
        # Incomplete DFA is allowed — missing transitions implicitly lead to rejection

    def process_string(self, input_string: str) -> Tuple[bool, List[Any]]:
        current_state = self.start_state
        trace = [current_state]
        for symbol in input_string:
            if symbol not in self.alphabet:
                raise ValueError(f"Symbol '{symbol}' not in alphabet")
            key = (current_state, symbol)
            if key not in self.transitions:
                key = f"{current_state},{symbol}"
                if key not in self.transitions:
                    # No transition — incomplete DFA rejects the string
                    trace.append('∅')
                    return (False, trace)
            current_state = self.transitions[key]
            trace.append(current_state)
        return (current_state in self.accept_states, trace)

    def is_string_accepted(self, input_string: str) -> bool:
        accepted, _ = self.process_string(input_string)
        return accepted

    def to_dict(self) -> dict:
        transitions = {}
        for key, value in self.transitions.items():
            if isinstance(key, tuple):
                transitions[f"{key[0]},{key[1]}"] = value
            else:
                transitions[key] = value
        return {
            'id': self.id,
            'states': list(self.states),
            'alphabet': list(self.alphabet),
            'transitions': transitions,
            'start_state': self.start_state,
            'accept_states': list(self.accept_states)
        }

    @classmethod
    def from_dict(cls, data: dict) -> 'DFA':
        dfa = cls(
            set(data['states']),
            set(data['alphabet']),
            data['transitions'],
            data['start_state'],
            set(data['accept_states'])
        )
        dfa.id = data.get('id')
        return dfa

    def __str__(self) -> str:
        return (f"DFA(states={self.states}, alphabet={self.alphabet}, "
                f"start_state='{self.start_state}', accept_states={self.accept_states})")

    def minimize(self) -> 'DFA':
        states = list(self.states)
        alphabet = list(self.alphabet)
        transitions = self.transitions
        start_state = self.start_state
        accept_states = set(self.accept_states)
        non_accept_states = set(states) - accept_states
        partition = [accept_states, non_accept_states]
        state_to_group = {}
        for i, group in enumerate(partition):
            for state in group:
                state_to_group[state] = i
        changed = True
        while changed:
            changed = False
            new_partition = []
            for group in partition:
                blocks = {}
                for state in group:
                    signature = tuple(
                        state_to_group.get(transitions.get(f"{state},{symbol}", None), -1)
                        for symbol in alphabet
                    )
                    if signature not in blocks:
                        blocks[signature] = set()
                    blocks[signature].add(state)
                new_partition.extend(blocks.values())
            if len(new_partition) != len(partition):
                changed = True
            partition = new_partition
            state_to_group = {}
            for i, group in enumerate(partition):
                for state in group:
                    state_to_group[state] = i
        group_to_state = {i: f"Q{i}" for i in range(len(partition))}
        minimized_states = set(group_to_state.values())
        minimized_start_state = group_to_state[state_to_group[start_state]]
        minimized_accept_states = set()
        for i, group in enumerate(partition):
            if any(state in accept_states for state in group):
                minimized_accept_states.add(group_to_state[i])
        minimized_transitions = {}
        for i, group in enumerate(partition):
            rep = next(iter(group))
            for symbol in alphabet:
                target = transitions.get(f"{rep},{symbol}", None)
                if target is not None:
                    target_group = state_to_group[target]
                    minimized_transitions[f"{group_to_state[i]},{symbol}"] = group_to_state[target_group]
        return DFA(
            states=minimized_states,
            alphabet=set(alphabet),
            transitions=minimized_transitions,
            start_state=minimized_start_state,
            accept_states=minimized_accept_states
        )