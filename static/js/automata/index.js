import { setupDfaUI } from './dfa.js';
import { setupNfaUI } from './nfa.js';
import { setupRegexUI } from './regex.js';
import { clearResults } from './utils.js';

document.addEventListener('DOMContentLoaded', function() {
    setupDfaUI();
    setupNfaUI();
    setupRegexUI();

    document.querySelectorAll('input[name="automata-mode"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const dfaSection = document.getElementById('dfa-section');
            const nfaSection = document.getElementById('nfa-section');
            const regexSection = document.getElementById('regex-section');

            dfaSection.style.display = this.value === 'dfa' ? '' : 'none';
            nfaSection.style.display = this.value === 'nfa' ? '' : 'none';
            regexSection.style.display = this.value === 'regex' ? '' : 'none';

            clearResults();
        });
    });
});