function showError(message) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast align-items-center text-white bg-danger border-0';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    document.getElementById('toast-container').appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();

    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

function showSuccess(message) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast align-items-center text-white bg-success border-0';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    document.getElementById('toast-container').appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();

    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

function updateAutomatonSummary(data) {
    if (!data) {
        document.getElementById('automaton-summary').innerHTML = '';
        return;
    }

    let html = '';
    html += `<strong>States:</strong> {${data.states ? data.states.join(', ') : ''}}<br>`;
    html += `<strong>Alphabet:</strong> {${data.alphabet ? data.alphabet.join(', ') : ''}}<br>`;
    html += `<strong>Start State:</strong> ${data.start_state || ''}<br>`;
    html += `<strong>Accept States:</strong> {${data.accept_states ? data.accept_states.join(', ') : ''}}<br>`;

    if (data.transitions) {
        if (Array.isArray(data.transitions)) {
            html += `<strong>Transitions:</strong> ${data.transitions.length}`;
        } else if (typeof data.transitions === 'object') {
            let count = 0;
            for (const k in data.transitions) {
                if (typeof data.transitions[k] === 'object') {
                    count += Object.keys(data.transitions[k]).length;
                } else {
                    count++;
                }
            }
            html += `<strong>Transitions:</strong> ${count}`;
        }
    }

    document.getElementById('automaton-summary').innerHTML = html;
}

export function clearResults(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '';
        container.style.display = 'none';
    }
}

export function displayMessage(containerId, message, type = 'info') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `<div class="message ${type}">${message}</div>`;
        container.style.display = 'block';
    }
}

function displayResults(result, automaton, type) {
    let outputHTML = '';
    outputHTML += `<p class="${result.accepted ? 'accept' : 'reject'}">`;
    outputHTML += `String is <strong>${result.accepted ? 'ACCEPTED' : 'REJECTED'}</strong>`;
    outputHTML += '</p>';

    if (type === 'dfa') {
        outputHTML += '<p><strong>Execution trace:</strong></p>';
        outputHTML += '<div class="trace">';
        outputHTML += result.trace.join(' → ');
        outputHTML += '</div>';
    } else {
        outputHTML += `<p><strong>Final reachable states:</strong> {${result.final_states.join(', ')}}</p>`;
    }

    document.getElementById('automata-output').innerHTML = outputHTML;
}

function epsilonClosureNFA(states, transitions) {
    const closure = new Set(states);
    const stack = [...states];

    while (stack.length > 0) {
        const state = stack.pop();
        if (transitions[state] && transitions[state]['']) {
            for (const nextState of transitions[state]['']) {
                if (!closure.has(nextState)) {
                    closure.add(nextState);
                    stack.push(nextState);
                }
            }
        }
    }

    return closure;
}