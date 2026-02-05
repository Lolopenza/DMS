from typing import Set, Dict, List, Tuple, Any

class PDA:
    def __init__(self, states, input_alphabet, stack_alphabet, transitions, start_state, accept_states, start_stack):
        self.states = set(states)
        self.input_alphabet = set(input_alphabet)
        self.stack_alphabet = set(stack_alphabet)
        self.transitions = transitions
        self.start_state = start_state
        self.accept_states = set(accept_states)
        self.start_stack = start_stack
        if self.start_state not in self.states:
            raise ValueError(f"Start state '{self.start_state}' not in states")
        if self.start_stack not in self.stack_alphabet:
            raise ValueError(f"Start stack symbol '{self.start_stack}' not in stack alphabet")
        for s in self.accept_states:
            if s not in self.states:
                raise ValueError(f"Accept state '{s}' not in states")

    def process_string(self, input_string: str) -> Tuple[bool, List[Any]]:
        stack = [self.start_stack]
        trace = [(self.start_state, 0, list(stack))]
        configs = [(self.start_state, 0, list(stack))]
        while configs:
            state, pos, stack = configs.pop()
            if pos == len(input_string) and state in self.accept_states:
                return True, trace
            symbol = input_string[pos] if pos < len(input_string) else ''
            key = (state, symbol, stack[-1] if stack else '')
            found = False
            for tkey, tlist in self.transitions.items():
                t_state, t_input, t_pop = tkey.split(',')
                if t_state == state and (t_input == symbol or t_input == '') and (t_pop == (stack[-1] if stack else '') or t_pop == ''):
                    for t in tlist:
                        t_to, t_push = t.split(',')
                        new_stack = list(stack)
                        if t_pop != '' and new_stack:
                            new_stack.pop()
                        if t_push != '':
                            for c in reversed(t_push):
                                new_stack.append(c)
                        next_pos = pos + (1 if t_input != '' else 0)
                        configs.append((t_to, next_pos, new_stack))
                        trace.append((t_to, next_pos, list(new_stack)))
                        found = True
            if not found and pos == len(input_string) and state in self.accept_states:
                return True, trace
        return False, trace

    def to_dict(self):
        return {
            'states': list(self.states),
            'input_alphabet': list(self.input_alphabet),
            'stack_alphabet': list(self.stack_alphabet),
            'transitions': self.transitions,
            'start_state': self.start_state,
            'accept_states': list(self.accept_states),
            'start_stack': self.start_stack
        }