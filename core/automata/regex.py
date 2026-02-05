from typing import Set, Dict, Any, List
from core.automata.nfa import NFA
import re

class RegexNode:
    def __init__(self, type_: str, value: str = None, left=None, right=None):
        self.type = type_
        self.value = value
        self.left = left
        self.right = right

class RegexParser:
    def __init__(self, regex: str):
        self.regex = regex
        self.pos = 0
        self.state_counter = 0

    def _get_new_state(self) -> str:
        self.state_counter += 1
        return f"q{self.state_counter}"

    def parse(self) -> RegexNode:
        return self._parse_alternation()

    def _parse_alternation(self) -> RegexNode:
        left = self._parse_concatenation()
        while self.pos < len(self.regex) and self.regex[self.pos] == '|':
            self.pos += 1
            right = self._parse_concatenation()
            left = RegexNode('alternation', '|', left, right)
        return left

    def _parse_concatenation(self) -> RegexNode:
        left = self._parse_kleene()
        while (self.pos < len(self.regex) and 
               self.regex[self.pos] not in ')|'):
            right = self._parse_kleene()
            left = RegexNode('concatenation', None, left, right)
        return left

    def _parse_kleene(self) -> RegexNode:
        expr = self._parse_atom()
        while self.pos < len(self.regex) and self.regex[self.pos] == '*':
            self.pos += 1
            expr = RegexNode('kleene', '*', expr)
        return expr

    def _parse_atom(self) -> RegexNode:
        if self.pos >= len(self.regex):
            raise ValueError("Unexpected end of regex")
        
        char = self.regex[self.pos]
        self.pos += 1
        
        if char == '(':
            expr = self._parse_alternation()
            if self.pos >= len(self.regex) or self.regex[self.pos] != ')':
                raise ValueError("Missing closing parenthesis")
            self.pos += 1
            return expr
        elif char in ')|*':
            raise ValueError(f"Unexpected character: {char}")
        else:
            return RegexNode('symbol', char)

class RegexToNFA:
    def __init__(self, regex: str):
        self.regex = regex
        self.state_counter = 0

    def convert(self):
        parser = RegexParser(self.regex)
        ast = parser.parse()
        self.state_counter = 0
        nfa_dict = self._convert_node(ast)
        states = set(nfa_dict['states'])
        alphabet = set(nfa_dict['alphabet'])
        transitions = {}
        for state, trans in nfa_dict['transitions'].items():
            transitions[state] = {}
            for symbol, next_states in trans.items():
                transitions[state][symbol] = set(next_states)
        start_state = nfa_dict['start_state']
        accept_states = set(nfa_dict['accept_states'])
        return NFA(states, alphabet, transitions, start_state, accept_states)

    def _get_new_state(self) -> str:
        self.state_counter += 1
        return f"q{self.state_counter}"

    def _convert_node(self, node: RegexNode) -> Dict[str, Any]:
        if node.type == 'symbol':
            return self._convert_symbol(node.value)
        elif node.type == 'concatenation':
            return self._convert_concatenation(node.left, node.right)
        elif node.type == 'alternation':
            return self._convert_alternation(node.left, node.right)
        elif node.type == 'kleene':
            return self._convert_kleene(node.left)
        else:
            raise ValueError(f"Unknown node type: {node.type}")

    def _convert_symbol(self, symbol: str) -> Dict[str, Any]:
        start_state = self._get_new_state()
        accept_state = self._get_new_state()
        return {
            'states': {start_state, accept_state},
            'alphabet': {symbol},
            'transitions': {
                start_state: {symbol: {accept_state}, '': set()},
                accept_state: {symbol: set(), '': set()}
            },
            'start_state': start_state,
            'accept_states': {accept_state}
        }

    def _convert_concatenation(self, left: RegexNode, right: RegexNode) -> Dict[str, Any]:
        left_nfa = self._convert_node(left)
        right_nfa = self._convert_node(right)
        
        states = left_nfa['states'] | right_nfa['states']
        alphabet = left_nfa['alphabet'] | right_nfa['alphabet']
        transitions = {**left_nfa['transitions'], **right_nfa['transitions']}
        
        for left_accept in left_nfa['accept_states']:
            transitions[left_accept][''] = {right_nfa['start_state']}
        
        return {
            'states': states,
            'alphabet': alphabet,
            'transitions': transitions,
            'start_state': left_nfa['start_state'],
            'accept_states': right_nfa['accept_states']
        }

    def _convert_alternation(self, left: RegexNode, right: RegexNode) -> Dict[str, Any]:
        left_nfa = self._convert_node(left)
        right_nfa = self._convert_node(right)
        
        new_start = self._get_new_state()
        new_accept = self._get_new_state()
        
        states = {new_start, new_accept} | left_nfa['states'] | right_nfa['states']
        alphabet = left_nfa['alphabet'] | right_nfa['alphabet']
        
        transitions = {
            new_start: {'': {left_nfa['start_state'], right_nfa['start_state']}, **{a: set() for a in alphabet}},
            new_accept: {'': set(), **{a: set() for a in alphabet}},
            **left_nfa['transitions'],
            **right_nfa['transitions']
        }
        
        for accept in left_nfa['accept_states'] | right_nfa['accept_states']:
            transitions[accept][''] = {new_accept}
        
        return {
            'states': states,
            'alphabet': alphabet,
            'transitions': transitions,
            'start_state': new_start,
            'accept_states': {new_accept}
        }

    def _convert_kleene(self, node: RegexNode) -> Dict[str, Any]:
        inner_nfa = self._convert_node(node)
        
        new_start = self._get_new_state()
        new_accept = self._get_new_state()
        
        states = {new_start, new_accept} | inner_nfa['states']
        alphabet = inner_nfa['alphabet']
        
        transitions = {
            new_start: {'': {new_accept, inner_nfa['start_state']}, **{a: set() for a in alphabet}},
            new_accept: {'': set(), **{a: set() for a in alphabet}},
            **inner_nfa['transitions']
        }
        
        for accept in inner_nfa['accept_states']:
            transitions[accept][''] = {inner_nfa['start_state'], new_accept}
        
        return {
            'states': states,
            'alphabet': alphabet,
            'transitions': transitions,
            'start_state': new_start,
            'accept_states': {new_accept}
        }