import { visualizeDFA, visualizeNFA } from './visualization.js';

export function initializeAutomata() {
    const dfaSection = document.getElementById('dfa-section');
    const nfaSection = document.getElementById('nfa-section');
    const regexSection = document.getElementById('regex-section');
    const processButton = document.getElementById('process-automata-button');
    const testStringInput = document.getElementById('automata-test-string');
    const outputDiv = document.getElementById('automata-output');
    const nfaToDfaButton = document.getElementById('nfa-to-dfa-button');
    const convertRegexButton = document.getElementById('convert-regex-button');

    document.querySelectorAll('input[name="automata-mode"]').forEach(radio => {
        radio.addEventListener('change', function() {
            dfaSection.style.display = this.value === 'dfa' ? '' : 'none';
            nfaSection.style.display = this.value === 'nfa' ? '' : 'none';
            regexSection.style.display = this.value === 'regex' ? '' : 'none';
            outputDiv.innerHTML = '';
        });
    });

    processButton.addEventListener('click', async function() {
        const mode = document.querySelector('input[name="automata-mode"]:checked').value;
        const inputString = testStringInput.value.trim();
        try {
            if (mode === 'dfa') {
                const dfa = validateDFAInput();
                if (!dfa) return;
                const response = await fetch('/api/automata', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ operation: 'dfa_process', dfa, input_string: inputString })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Server error');
                outputDiv.innerHTML = '<pre>' + JSON.stringify(data.result, null, 2) + '</pre>';
                visualizeDFA(dfa);
                DMC.showSuccess('DFA processed');
            } else if (mode === 'nfa') {
                const nfa = validateNFAInput();
                if (!nfa) return;
                const response = await fetch('/api/automata', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ operation: 'nfa_process', nfa, input_string: inputString })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Server error');
                outputDiv.innerHTML = '<pre>' + JSON.stringify(data.result, null, 2) + '</pre>';
                visualizeNFA(nfa);
                DMC.showSuccess('NFA processed');
            }
        } catch (error) {
            DMC.showError(error.message);
        }
    });

    if (nfaToDfaButton) {
        nfaToDfaButton.addEventListener('click', async function() {
            const nfa = validateNFAInput();
            if (!nfa) return;
            try {
                const response = await fetch('/api/automata', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ operation: 'nfa_to_dfa', nfa })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Server error');
                outputDiv.innerHTML = '<pre>' + JSON.stringify(data.result, null, 2) + '</pre>';
                visualizeDFA(data.result);
                DMC.showSuccess('NFA converted to DFA');
            } catch (error) {
                DMC.showError(error.message);
            }
        });
    }

    if (convertRegexButton) {
        convertRegexButton.addEventListener('click', async function() {
            const regexInput = document.getElementById('regex-input').value.trim();
            if (!regexInput) {
                DMC.showError('Please enter a regular expression');
                return;
            }
            try {
                const response = await fetch('/api/automata', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ operation: 'regex_to_nfa', regex: regexInput })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Server error');
                outputDiv.innerHTML = '<pre>' + JSON.stringify(data.result, null, 2) + '</pre>';
                visualizeNFA(data.result);
                DMC.showSuccess('NFA generated from regex');
            } catch (error) {
                DMC.showError(error.message);
            }
        });
    }
}

function validateDFAInput() {
    const states = document.getElementById('dfa-states').value.split(',').map(s => s.trim()).filter(s => s);
    const alphabet = document.getElementById('dfa-alphabet').value.split(',').map(a => a.trim()).filter(a => a);
    const startState = document.getElementById('dfa-start-state').value.trim();
    const acceptStates = document.getElementById('dfa-accept-states').value.split(',').map(s => s.trim()).filter(s => s);
    const transitionsInput = document.getElementById('dfa-transitions').value.split('\n');
    if (states.length === 0) { DMC.showError("Please enter at least one state"); return null; }
    if (alphabet.length === 0) { DMC.showError("Please enter at least one symbol in the alphabet"); return null; }
    if (!startState) { DMC.showError("Please specify a start state"); return null; }
    if (!states.includes(startState)) { DMC.showError("Start state must be one of the states"); return null; }
    if (acceptStates.length === 0) { DMC.showError("Please specify at least one accept state"); return null; }
    for (const state of acceptStates) {
        if (!states.includes(state)) { DMC.showError(`Accept state '${state}' is not in the set of states`); return null; }
    }
    const transitions = {};
    for (const line of transitionsInput) {
        if (!line.trim()) continue;
        const parts = line.split(',').map(p => p.trim());
        if (parts.length !== 3) { DMC.showError("Invalid transition format. Use 'state,symbol,next_state'"); return null; }
        const [state, symbol, nextState] = parts;
        if (!states.includes(state)) { DMC.showError(`State '${state}' in transition is not in the set of states`); return null; }
        if (!alphabet.includes(symbol)) { DMC.showError(`Symbol '${symbol}' in transition is not in the alphabet`); return null; }
        if (!states.includes(nextState)) { DMC.showError(`Next state '${nextState}' in transition is not in the set of states`); return null; }
        transitions[`${state},${symbol}`] = nextState;
    }
    return {
        states,
        alphabet,
        transitions,
        start_state: startState,
        accept_states: acceptStates
    };
}

function validateNFAInput() {
    const states = document.getElementById('nfa-states').value.split(',').map(s => s.trim()).filter(s => s);
    const alphabet = document.getElementById('nfa-alphabet').value.split(',').map(a => a.trim()).filter(a => a);
    const startState = document.getElementById('nfa-start-state').value.trim();
    const acceptStates = document.getElementById('nfa-accept-states').value.split(',').map(s => s.trim()).filter(s => s);
    const transitionsInput = document.getElementById('nfa-transitions').value.split('\n');
    if (states.length === 0) { DMC.showError("Please enter at least one state"); return null; }
    if (alphabet.length === 0) { DMC.showError("Please enter at least one symbol in the alphabet"); return null; }
    if (!startState) { DMC.showError("Please specify a start state"); return null; }
    if (!states.includes(startState)) { DMC.showError("Start state must be one of the states"); return null; }
    if (acceptStates.length === 0) { DMC.showError("Please specify at least one accept state"); return null; }
    for (const state of acceptStates) {
        if (!states.includes(state)) { DMC.showError(`Accept state '${state}' is not in the set of states`); return null; }
    }
    const transitions = {};
    for (const line of transitionsInput) {
        if (!line.trim()) continue;
        const parts = line.split(',').map(p => p.trim());
        if (parts.length !== 3) { DMC.showError("Invalid transition format. Use 'state,symbol,next_states'"); return null; }
        const [state, symbol, nextStatesStr] = parts;
        if (!states.includes(state)) { DMC.showError(`State '${state}' in transition is not in the set of states`); return null; }
        if (symbol && !alphabet.includes(symbol)) { DMC.showError(`Symbol '${symbol}' in transition is not in the alphabet (or empty for epsilon)`); return null; }
        const nextStates = nextStatesStr.split(';').map(s => s.trim()).filter(s => s);
        for (const ns of nextStates) {
            if (!states.includes(ns)) { DMC.showError(`Next state '${ns}' in transition is not in the set of states`); return null; }
        }
        if (!transitions[state]) transitions[state] = {};
        if (!transitions[state][symbol]) transitions[state][symbol] = [];
        transitions[state][symbol] = [...new Set([...transitions[state][symbol], ...nextStates])];
    }
    return {
        states,
        alphabet,
        transitions,
        start_state: startState,
        accept_states: acceptStates
    };
}