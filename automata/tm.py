from typing import Set, Dict, List, Tuple, Any

class TuringMachine:
    def __init__(self, states, tape_alphabet, blank_symbol, transitions, start_state, accept_states, reject_states):
        self.states = set(states)
        self.tape_alphabet = set(tape_alphabet)
        self.blank_symbol = blank_symbol
        self.transitions = transitions
        self.start_state = start_state
        self.accept_states = set(accept_states)
        self.reject_states = set(reject_states)
        if self.start_state not in self.states:
            raise ValueError(f"Start state '{self.start_state}' not in states")
        if self.blank_symbol not in self.tape_alphabet:
            raise ValueError(f"Blank symbol '{self.blank_symbol}' not in tape alphabet")
        for s in self.accept_states:
            if s not in self.states:
                raise ValueError(f"Accept state '{s}' not in states")
        for s in self.reject_states:
            if s not in self.states:
                raise ValueError(f"Reject state '{s}' not in states")

    def process_string(self, input_string: str) -> Tuple[bool, List[Any]]:
        tape = list(input_string) if input_string else [self.blank_symbol]
        head = 0
        state = self.start_state
        trace = [(state, head, list(tape))]
        steps = 0
        max_steps = 10000
        while steps < max_steps:
            if state in self.accept_states:
                return True, trace
            if state in self.reject_states:
                return False, trace
            symbol = tape[head] if 0 <= head < len(tape) else self.blank_symbol
            key = f"{state},{symbol}"
            if key not in self.transitions:
                return False, trace
            next_state, write_symbol, move = self.transitions[key].split(',')
            if 0 <= head < len(tape):
                tape[head] = write_symbol
            else:
                if head < 0:
                    tape = [write_symbol] + tape
                    head = 0
                else:
                    tape.append(write_symbol)
            if move == 'R':
                head += 1
                if head >= len(tape):
                    tape.append(self.blank_symbol)
            elif move == 'L':
                head -= 1
                if head < 0:
                    tape = [self.blank_symbol] + tape
                    head = 0
            state = next_state
            trace.append((state, head, list(tape)))
            steps += 1
        return False, trace

    def to_dict(self):
        return {
            'states': list(self.states),
            'tape_alphabet': list(self.tape_alphabet),
            'blank_symbol': self.blank_symbol,
            'transitions': self.transitions,
            'start_state': self.start_state,
            'accept_states': list(self.accept_states),
            'reject_states': list(self.reject_states)
        }