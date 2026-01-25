import { showError, showSuccess, updateAutomatonSummary, clearResults, displayResults } from './utils.js';
import { visualizeDFA } from './visualization.js';
import { initializeSimulation } from './simulation.js';

export function setupDfaUI() {
    const processButton = document.getElementById('process-automata-button');
    const minimizeButton = document.getElementById('minimize-dfa-button');
    const testStringInput = document.getElementById('automata-test-string');


    processButton.addEventListener('click', async function() {
        const dfa = validateDFAInput();
        if (!dfa) return;

        const inputString = testStringInput.value.trim();
        try {
            const response = await fetch('/api/dfa_process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...dfa,
                    input_string: inputString
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'DFA processing failed');
            }

            const result = await response.json();
            displayResults(result, dfa, 'dfa');
            initializeSimulation(dfa, 'dfa', inputString);
            showSuccess('String processed successfully');
        } catch (error) {
            showError('Error processing DFA: ' + error.message);
        }
    });


    if (minimizeButton) {
        minimizeButton.addEventListener('click', async function() {
            const dfa = validateDFAInput();
            if (!dfa) return;

            try {
                const response = await fetch('/api/dfa_minimize', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dfa)
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'DFA minimization failed');
                }

                const minimizedDfa = await response.json();
                document.getElementById('dfa-states').value = minimizedDfa.states.join(',');
                document.getElementById('dfa-alphabet').value = minimizedDfa.alphabet.join(',');
                document.getElementById('dfa-start-state').value = minimizedDfa.start_state;
                document.getElementById('dfa-accept-states').value = minimizedDfa.accept_states.join(',');

                let transitionsText = '';
                for (const [key, value] of Object.entries(minimizedDfa.transitions)) {
                    const [state, symbol] = key.split(',');
                    transitionsText += `${state},${symbol},${value}\\n`;
                }
                document.getElementById('dfa-transitions').value = transitionsText.trim();

                updateAutomatonSummary(minimizedDfa);
                visualizeDFA(minimizedDfa);
                showSuccess('DFA minimized successfully');
            } catch (error) {
                showError('Error minimizing DFA: ' + error.message);
            }
        });
    }


    ['dfa-states', 'dfa-alphabet', 'dfa-start-state', 'dfa-accept-states', 'dfa-transitions'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', function() {
                const dfa = validateDFAInput();
                updateAutomatonSummary(dfa);
            });
        }
    });
}

function validateDFAInput() {
    const states = document.getElementById('dfa-states').value.split(',').map(s => s.trim()).filter(s => s);
    const alphabet = document.getElementById('dfa-alphabet').value.split(',').map(a => a.trim()).filter(a => a);
    const startState = document.getElementById('dfa-start-state').value.trim();
    const acceptStates = document.getElementById('dfa-accept-states').value.split(',').map(s => s.trim()).filter(s => s);
    const transitionsInput = document.getElementById('dfa-transitions').value.split('\\n');

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
        if (parts.length !== 3) { showError("Invalid transition format. Use 'state,symbol,next_state'"); return null; }
        const [state, symbol, nextState] = parts;
        if (!states.includes(state)) { showError(`State '${state}' in transition is not in the set of states`); return null; }
        if (!alphabet.includes(symbol)) { showError(`Symbol '${symbol}' in transition is not in the alphabet`); return null; }
        if (!states.includes(nextState)) { showError(`Next state '${nextState}' in transition is not in the set of states`); return null; }
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