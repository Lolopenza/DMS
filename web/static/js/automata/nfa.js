import { showError, showSuccess, updateAutomatonSummary, clearResults, displayResults } from './utils.js';
import { visualizeNFA } from './visualization.js';
import { initializeSimulation } from './simulation.js';

export function setupNfaUI() {
    const processButton = document.getElementById('process-automata-button');
    const nfaToDfaButton = document.getElementById('nfa-to-dfa-button');
    const testStringInput = document.getElementById('automata-test-string');


    processButton.addEventListener('click', async function() {
        const nfa = validateNFAInput();
        if (!nfa) return;

        const inputString = testStringInput.value.trim();
        try {
            const response = await fetch('/api/nfa_process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...nfa,
                    input_string: inputString
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'NFA processing failed');
            }

            const result = await response.json();
            displayResults(result, nfa, 'nfa');
            initializeSimulation(nfa, 'nfa', inputString);
            showSuccess('String processed successfully');
        } catch (error) {
            showError('Error processing NFA: ' + error.message);
        }
    });


    if (nfaToDfaButton) {
        nfaToDfaButton.addEventListener('click', async function() {
            const nfa = validateNFAInput();
            if (!nfa) return;

            try {
                const response = await fetch('/api/nfa_to_dfa', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(nfa)
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'NFA to DFA conversion failed');
                }

                const dfa = await response.json();
                document.querySelector('input[name="automata-mode"][value="dfa"]').checked = true;
                document.getElementById('dfa-section').style.display = '';
                document.getElementById('nfa-section').style.display = 'none';
                document.getElementById('regex-section').style.display = 'none';

                document.getElementById('dfa-states').value = dfa.states.join(',');
                document.getElementById('dfa-alphabet').value = dfa.alphabet.join(',');
                document.getElementById('dfa-start-state').value = dfa.start_state;
                document.getElementById('dfa-accept-states').value = dfa.accept_states.join(',');

                let transitionsText = '';
                for (const [key, value] of Object.entries(dfa.transitions)) {
                    const [state, symbol] = key.split(',');
                    transitionsText += `${state},${symbol},${value}\\n`;
                }
                document.getElementById('dfa-transitions').value = transitionsText.trim();

                updateAutomatonSummary(dfa);
                showSuccess('NFA converted to DFA');
            } catch (error) {
                showError('Error converting NFA to DFA: ' + error.message);
            }
        });
    }


    ['nfa-states', 'nfa-alphabet', 'nfa-start-state', 'nfa-accept-states', 'nfa-transitions'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', function() {
                const nfa = validateNFAInput();
                updateAutomatonSummary(nfa);
            });
        }
    });
}

function validateNFAInput() {
    const states = document.getElementById('nfa-states').value.split(',').map(s => s.trim()).filter(s => s);
    const alphabet = document.getElementById('nfa-alphabet').value.split(',').map(a => a.trim()).filter(a => a);
    const startState = document.getElementById('nfa-start-state').value.trim();
    const acceptStates = document.getElementById('nfa-accept-states').value.split(',').map(s => s.trim()).filter(s => s);
    const transitionsInput = document.getElementById('nfa-transitions').value.split('\\n');

    if (states.length === 0) { showError("Please enter at least one state"); return null; }
    if (alphabet.length === 0) { showError("Please enter at least one symbol in the alphabet"); return null; }
    if (!startState) { showError("Please specify a start state"); return null; }
    if (!states.includes(startState)) { showError("Start state must be one of the states"); return null; }
    if (acceptStates.length === 0) { showError("Please specify at least one accept state"); return null; }
    for (const state of acceptStates) {
        if (!states.includes(state)) { showError(`Accept state '${state}' is not in the set of states`); return null; }
    }

    const transitions = {};
    for (const line of transitionsInput) {
        if (!line.trim()) continue;
        const parts = line.split(',').map(p => p.trim());
        if (parts.length !== 3) { showError("Invalid transition format. Use 'state,symbol,next_states'"); return null; }
        const [state, symbol, nextStatesStr] = parts;
        if (!states.includes(state)) { showError(`State '${state}' in transition is not in the set of states`); return null; }
        if (symbol && !alphabet.includes(symbol)) { showError(`Symbol '${symbol}' in transition is not in the alphabet (or empty for epsilon)`); return null; }
        const nextStates = nextStatesStr.split(';').map(s => s.trim()).filter(s => s);
        for (const ns of nextStates) {
            if (!states.includes(ns)) { showError(`Next state '${ns}' in transition is not in the set of states`); return null; }
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