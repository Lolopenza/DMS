import { showError, showSuccess, updateAutomatonSummary } from './utils.js';
import { visualizeNFA } from './visualization.js';

export function setupRegexUI() {
    const convertButton = document.getElementById('convert-regex-button');
    const regexInput = document.getElementById('regex-input');

    if (convertButton) {
        convertButton.addEventListener('click', async function() {
            const regex = regexInput.value.trim();
            if (!regex) {
                showError('Please enter a regular expression');
                return;
            }

            try {
                const response = await fetch('/api/regex_to_nfa', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ regex })
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Regex to NFA conversion failed');
                }

                const nfa = await response.json();
                document.querySelector('input[name="automata-mode"][value="nfa"]').checked = true;
                document.getElementById('dfa-section').style.display = 'none';
                document.getElementById('nfa-section').style.display = '';
                document.getElementById('regex-section').style.display = 'none';

                document.getElementById('nfa-states').value = nfa.states.join(',');
                document.getElementById('nfa-alphabet').value = nfa.alphabet.join(',');
                document.getElementById('nfa-start-state').value = nfa.start_state;
                document.getElementById('nfa-accept-states').value = nfa.accept_states.join(',');

                let transitionsText = '';
                for (const [state, trans] of Object.entries(nfa.transitions)) {
                    for (const [symbol, nextStates] of Object.entries(trans)) {
                        if (nextStates.length > 0) {
                            transitionsText += `${state},${symbol},${nextStates.join(';')}\n`;
                        }
                    }
                }
                document.getElementById('nfa-transitions').value = transitionsText.trim();

                updateAutomatonSummary(nfa);
                visualizeNFA(nfa);
                showSuccess('NFA generated from regex');
            } catch (error) {
                showError('Error converting regex to NFA: ' + error.message);
            }
        });
    }
}