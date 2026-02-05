import pytest
from automata.regex import RegexParser, RegexToNFA

def test_regex_parser_basic():
    parser = RegexParser('a')
    node = parser.parse()
    assert node.type == 'symbol'
    assert node.value == 'a'
    assert node.left is None
    assert node.right is None

def test_regex_parser_concatenation():
    parser = RegexParser('ab')
    node = parser.parse()
    assert node.type == 'concatenation'
    assert node.left.type == 'symbol'
    assert node.left.value == 'a'
    assert node.right.type == 'symbol'
    assert node.right.value == 'b'

def test_regex_parser_alternation():
    parser = RegexParser('a|b')
    node = parser.parse()
    assert node.type == 'alternation'
    assert node.value == '|'
    assert node.left.type == 'symbol'
    assert node.left.value == 'a'
    assert node.right.type == 'symbol'
    assert node.right.value == 'b'

def test_regex_parser_kleene():
    parser = RegexParser('a*')
    node = parser.parse()
    assert node.type == 'kleene'
    assert node.value == '*'
    assert node.left.type == 'symbol'
    assert node.left.value == 'a'

def test_regex_parser_complex():
    parser = RegexParser('(a|b)*c')
    node = parser.parse()
    assert node.type == 'concatenation'
    assert node.left.type == 'kleene'
    assert node.left.left.type == 'alternation'
    assert node.right.type == 'symbol'
    assert node.right.value == 'c'

def test_regex_parser_invalid():
    with pytest.raises(ValueError):
        RegexParser('').parse()
    with pytest.raises(ValueError):
        RegexParser('(a').parse()
    with pytest.raises(ValueError):
        RegexParser('a)').parse()
    with pytest.raises(ValueError):
        RegexParser('*a').parse()

def test_regex_to_nfa_basic():
    converter = RegexToNFA('a')
    nfa = converter.convert()
    assert len(nfa.states) == 2
    assert nfa.alphabet == {'a'}
    assert len(nfa.accept_states) == 1
    assert nfa.is_string_accepted('a')
    assert not nfa.is_string_accepted('b')
    assert not nfa.is_string_accepted('')

def test_regex_to_nfa_concatenation():
    converter = RegexToNFA('ab')
    nfa = converter.convert()
    assert nfa.is_string_accepted('ab')
    assert not nfa.is_string_accepted('a')
    assert not nfa.is_string_accepted('b')
    assert not nfa.is_string_accepted('ba')

def test_regex_to_nfa_alternation():
    converter = RegexToNFA('a|b')
    nfa = converter.convert()
    assert nfa.is_string_accepted('a')
    assert nfa.is_string_accepted('b')
    assert not nfa.is_string_accepted('ab')
    assert not nfa.is_string_accepted('')

def test_regex_to_nfa_kleene():
    converter = RegexToNFA('a*')
    nfa = converter.convert()
    assert nfa.is_string_accepted('')
    assert nfa.is_string_accepted('a')
    assert nfa.is_string_accepted('aa')
    assert nfa.is_string_accepted('aaa')
    assert not nfa.is_string_accepted('b')

def test_regex_to_nfa_complex():
    converter = RegexToNFA('(a|b)*c')
    nfa = converter.convert()
    assert nfa.is_string_accepted('c')
    assert nfa.is_string_accepted('ac')
    assert nfa.is_string_accepted('bc')
    assert nfa.is_string_accepted('abc')
    assert nfa.is_string_accepted('bac')
    assert nfa.is_string_accepted('aabc')
    assert not nfa.is_string_accepted('')
    assert not nfa.is_string_accepted('a')
    assert not nfa.is_string_accepted('ab')
    assert not nfa.is_string_accepted('ca') 