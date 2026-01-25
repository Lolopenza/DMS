document.addEventListener('DOMContentLoaded', function() {
    
    // Fix: define editorSection to match automata.html
    const editorSection = document.getElementById('automata-editor-section');
    const dfaSection = document.getElementById('dfa-section');
    const nfaSection = document.getElementById('nfa-section');
    const modeRadios = document.getElementsByName('automata-mode');
    let currentMode = 'dfa';
    function renderEditor(mode) {
        currentMode = mode;
        let html = '';
        if (mode === 'dfa') {
            html = `
                <h2 class="h5">Deterministic Finite Automaton (DFA)</h2>
                <div class="mb-2"><label>States <input type="text" class="form-control" id="dfa-states" placeholder="q0,q1,q2"></label></div>
                <div class="mb-2"><label>Alphabet <input type="text" class="form-control" id="dfa-alphabet" placeholder="0,1"></label></div>
                <div class="mb-2"><label>Start State <input type="text" class="form-control" id="dfa-start-state" placeholder="q0"></label></div>
                <div class="mb-2"><label>Accept States <input type="text" class="form-control" id="dfa-accept-states" placeholder="q2"></label></div>
                <div class="mb-2"><label>Transitions <textarea class="form-control" id="dfa-transitions" rows="3" placeholder="q0,0,q1"></textarea></label></div>
                <div class="mb-2"><label>Test String <input type="text" class="form-control" id="dfa-test-string" placeholder="e.g. 0101"></label></div>
                <button class="btn btn-primary" id="dfa-process-btn">Process</button>
            `;
        } else if (mode === 'nfa' || mode === 'enfa') {
            html = `
                <h2 class="h5">${mode === 'nfa' ? 'Non-deterministic Finite Automaton (NFA)' : 'ε-NFA (Epsilon-NFA)'}</h2>
                <div class="mb-2"><label>States <input type="text" class="form-control" id="nfa-states" placeholder="q0,q1,q2"></label></div>
                <div class="mb-2"><label>Alphabet <input type="text" class="form-control" id="nfa-alphabet" placeholder="0,1"></label></div>
                <div class="mb-2"><label>Start State <input type="text" class="form-control" id="nfa-start-state" placeholder="q0"></label></div>
                <div class="mb-2"><label>Accept States <input type="text" class="form-control" id="nfa-accept-states" placeholder="q2"></label></div>
                <div class="mb-2"><label>Transitions <textarea class="form-control" id="nfa-transitions" rows="3" placeholder="q0,0,q1;q2\nq1,ε,q2"></textarea></label></div>
                <div class="mb-2"><label>Test String <input type="text" class="form-control" id="nfa-test-string" placeholder="e.g. 0101"></label></div>
                <button class="btn btn-primary" id="nfa-process-btn">Process</button>
                <button class="btn btn-outline-info ms-2" id="nfa-to-dfa-btn">Convert to DFA</button>
            `;
        } else if (mode === 'pda') {
            html = `
                <h2 class="h5">Pushdown Automaton (PDA)</h2>
                <div class="mb-2"><label>States <input type="text" class="form-control" id="pda-states" placeholder="q0,q1,q2"></label></div>
                <div class="mb-2"><label>Input Alphabet <input type="text" class="form-control" id="pda-input-alphabet" placeholder="0,1"></label></div>
                <div class="mb-2"><label>Stack Alphabet <input type="text" class="form-control" id="pda-stack-alphabet" placeholder="Z,X"></label></div>
                <div class="mb-2"><label>Start State <input type="text" class="form-control" id="pda-start-state" placeholder="q0"></label></div>
                <div class="mb-2"><label>Accept States <input type="text" class="form-control" id="pda-accept-states" placeholder="q2"></label></div>
                <div class="mb-2"><label>Start Stack Symbol <input type="text" class="form-control" id="pda-start-stack" placeholder="Z"></label></div>
                <div class="mb-2"><label>Transitions <textarea class="form-control" id="pda-transitions" rows="3" placeholder="q0,0,Z->q1,XZ"></textarea></label></div>
                <div class="mb-2"><label>Test String <input type="text" class="form-control" id="pda-test-string" placeholder="e.g. 0101"></label></div>
                <button class="btn btn-primary" id="pda-process-btn">Process</button>
            `;
        } else if (mode === 'tm') {
            html = `
                <h2 class="h5">Turing Machine (TM)</h2>
                <div class="mb-2"><label>States <input type="text" class="form-control" id="tm-states" placeholder="q0,q1,q2"></label></div>
                <div class="mb-2"><label>Tape Alphabet <input type="text" class="form-control" id="tm-tape-alphabet" placeholder="0,1,B"></label></div>
                <div class="mb-2"><label>Blank Symbol <input type="text" class="form-control" id="tm-blank-symbol" placeholder="B"></label></div>
                <div class="mb-2"><label>Start State <input type="text" class="form-control" id="tm-start-state" placeholder="q0"></label></div>
                <div class="mb-2"><label>Accept States <input type="text" class="form-control" id="tm-accept-states" placeholder="q2"></label></div>
                <div class="mb-2"><label>Reject States <input type="text" class="form-control" id="tm-reject-states" placeholder="qr"></label></div>
                <div class="mb-2"><label>Transitions <textarea class="form-control" id="tm-transitions" rows="3" placeholder="q0,0->q1,1,R"></textarea></label></div>
                <div class="mb-2"><label>Test String <input type="text" class="form-control" id="tm-test-string" placeholder="e.g. 0101"></label></div>
                <button class="btn btn-primary" id="tm-process-btn">Process</button>
            `;
        } else if (mode === 'regex') {
            html = `
                <h2 class="h5">Regular Expression</h2>
                <div class="mb-2"><label>Regex <input type="text" class="form-control" id="regex-input" placeholder="(a|b)*c"></label></div>
                <button class="btn btn-outline-info" id="regex-to-nfa-btn">Regex to NFA</button>
                <button class="btn btn-outline-info ms-2" id="regex-to-dfa-btn">Regex to DFA</button>
            `;
        }
        editorSection.innerHTML = html;
    }
    modeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            renderEditor(this.value);
        });
    });
    renderEditor('dfa');
    
    document.querySelectorAll('.example-dfa-button').forEach(button => {
        button.addEventListener('click', function() {
            const exampleId = this.dataset.example;
            loadExampleDFA(exampleId);
        });
    });
    
    document.querySelectorAll('.example-nfa-button').forEach(button => {
        button.addEventListener('click', function() {
            const exampleId = this.dataset.example;
            loadExampleNFA(exampleId);
        });
    });
    
    const processButton = document.getElementById('process-automata-button');
    if (processButton) {
        processButton.addEventListener('click', async function() {
            const mode = document.querySelector('input[name="automata-mode"]:checked').value;
            clearResults();
            if (mode === 'dfa') {
                try {
                    const dfaData = validateDFAInput();
                    if (!dfaData) return;
                    const testString = document.getElementById('automata-test-string').value;
                    if (!testString) {
                        DMC.showError("Please enter a test string");
                        return;
                    }
                    const payload = {
                        states: dfaData.states,
                        alphabet: dfaData.alphabet,
                        start_state: dfaData.start_state,
                        accept_states: dfaData.accept_states,
                        transitions: dfaData.transitions,
                        input_string: testString
                    };
                    const response = await fetch('/api/dfa_process', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const data = await response.json();
                    if (!response.ok) {
                        DMC.showError(data.error || 'DFA processing failed');
                        return;
                    }
                    displayDFAResults(data, dfaData);
                    DMC.showSuccess("String processed successfully");
                    let formula = `DFA: ${dfaData.start_state} --${dfaData.alphabet[0]}--> ${data.final_state}`;
                    recordAutomataHistory('DFA processing', { states: dfaData.states, alphabet: dfaData.alphabet, start_state: dfaData.start_state, accept_states: dfaData.accept_states, transitions: dfaData.transitions, input_string: testString }, data, formula);
                } catch (error) {
                    DMC.showError("Error processing DFA: " + error.message);
                }
            } else {
                try {
                    const nfaData = validateNFAInput();
                    if (!nfaData) return;
                    const testString = document.getElementById('automata-test-string').value;
                    if (testString === undefined) {
                        DMC.showError("Please enter a test string");
                        return;
                    }
                    const transitions = {};
                    for (const [state, trans] of Object.entries(nfaData.transitions)) {
                        transitions[state] = {};
                        for (const [symbol, nextStates] of Object.entries(trans)) {
                            transitions[state][symbol] = Array.from(nextStates);
                        }
                    }
                    const payload = {
                        states: nfaData.states,
                        alphabet: nfaData.alphabet,
                        start_state: nfaData.start_state,
                        accept_states: nfaData.accept_states,
                        transitions: transitions,
                        input_string: testString
                    };
                    const response = await fetch('/api/nfa_process', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const data = await response.json();
                    if (!response.ok) {
                        DMC.showError(data.error || 'NFA processing failed');
                        return;
                    }
                    displayNFAResults(data, nfaData, testString);
                    DMC.showSuccess("String processed successfully");
                    let formula = `NFA: ${nfaData.start_state} --${testString.split('').join(' --')}--> ${data.final_states.join(' --')} (${data.accepted ? 'ACCEPTED' : 'REJECTED'})`;
                    recordAutomataHistory('NFA processing', { states: nfaData.states, alphabet: nfaData.alphabet, start_state: nfaData.start_state, accept_states: nfaData.accept_states, transitions: transitions, input_string: testString }, data, formula);
                } catch (error) {
                    DMC.showError("Error processing NFA: " + error.message);
                }
            }
        });
    }

    function clearResults() {
        document.getElementById('automata-output').innerHTML = '';
        document.getElementById('automata-visualization').innerHTML = '';
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
        for (const state of acceptStates) { if (!states.includes(state)) { DMC.showError(`Accept state '${state}' is not in the set of states`); return null; } }
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
        return { states, alphabet, start_state: startState, accept_states: acceptStates, transitions };
    }
    function processDFAString(inputString, dfa) {
        let currentState = dfa.start_state;
        const trace = [currentState];
        for (let i = 0; i < inputString.length; i++) {
            const symbol = inputString[i];
            if (!dfa.alphabet.includes(symbol)) { throw new Error(`Symbol '${symbol}' not in the alphabet`); }
            const transitionKey = `${currentState},${symbol}`;
            if (!(transitionKey in dfa.transitions)) { throw new Error(`No transition defined for state '${currentState}' with symbol '${symbol}'`); }
            currentState = dfa.transitions[transitionKey];
            trace.push(currentState);
        }
        return { accepted: dfa.accept_states.includes(currentState), trace, final_state: currentState };
    }
    function displayDFAResults(result, dfa) {
        let outputHTML = '';
        outputHTML += `<p class="${result.accepted ? 'accept' : 'reject'}">`;
        outputHTML += `String is <strong>${result.accepted ? 'ACCEPTED' : 'REJECTED'}</strong>`;
        outputHTML += '</p>';
        outputHTML += '<p><strong>Execution trace:</strong></p>';
        outputHTML += '<div class="trace">';
        outputHTML += result.trace.join(' → ');
        outputHTML += '</div>';
        document.getElementById('automata-output').innerHTML = outputHTML;
        visualizeDFA(dfa, result.trace);
        let formula = `DFA: ${dfa.start_state} --${dfa.alphabet[0]}--> ${result.final_state}`;
        recordAutomataHistory('DFA processing', { states: dfa.states, alphabet: dfa.alphabet, start_state: dfa.start_state, accept_states: dfa.accept_states, transitions: dfa.transitions, input_string: result.trace.join('') }, result, formula);
    }
    function visualizeDFA(dfa, trace = []) {
        const visContainer = document.getElementById('automata-visualization');
        visContainer.innerHTML = '';
        const width = 800;
        const height = 400;
        const svg = d3.select(visContainer)
            .append('svg')
            .attr('id', 'automata-svg')
            .attr('width', width)
            .attr('height', height);
        const nodeRadius = 30;
        const nodes = dfa.states.map((state, i) => ({
            id: state,
            x: 100 + (i * 150),
            y: height / 2,
            isStart: state === dfa.start_state,
            isAccept: dfa.accept_states.includes(state),
            isCurrent: trace.length > 0 && state === trace[trace.length - 1]
        }));
        for (const key in dfa.transitions) {
            const [fromState, symbol] = key.split(',');
            const toState = dfa.transitions[key];
            const fromNode = nodes.find(n => n.id === fromState);
            const toNode = nodes.find(n => n.id === toState);
            if (fromNode && toNode) {
                svg.append('path')
                    .attr('d', `M${fromNode.x},${fromNode.y} L${toNode.x},${toNode.y}`)
                    .attr('class', 'automata-edge')
                    .attr('stroke', '#666')
                    .attr('stroke-width', 2)
                    .attr('fill', 'none');
                const midX = (fromNode.x + toNode.x) / 2;
                const midY = (fromNode.y + toNode.y) / 2;
                svg.append('text')
                    .attr('class', 'automata-label')
                    .attr('x', midX)
                    .attr('y', midY - 10)
                    .attr('text-anchor', 'middle')
                    .attr('fill', '#666')
                    .text(symbol);
            }
        }
        const nodeGroup = svg.selectAll('.node')
            .data(nodes)
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', d => `translate(${d.x},${d.y})`);
        nodeGroup.append('circle')
            .attr('r', nodeRadius)
            .attr('class', d => [
                'automata-state',
                d.isStart ? 'start-state' : '',
                d.isAccept ? 'accept-state' : '',
                d.isCurrent ? 'current-state state-transitioning' : ''
            ].join(' '))
            .attr('fill', d => d.isCurrent ? '#0dcaf0' : d.isAccept ? '#198754' : d.isStart ? '#0d6efd' : '#fff')
            .attr('stroke', d => {
                if (d.isStart && d.isAccept) return '#198754';
                if (d.isStart) return '#0d6efd';
                if (d.isAccept) return '#198754';
                return '#666';
            })
            .attr('stroke-width', 3)
            .transition().duration(300).attr('r', nodeRadius + 2).transition().duration(300).attr('r', nodeRadius);
        nodeGroup.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '.3em')
            .attr('fill', '#000')
            .text(d => d.id);
        const startNode = nodes.find(n => n.isStart);
        if (startNode) {
            svg.append('path')
                .attr('d', `M${startNode.x - nodeRadius - 20},${startNode.y} L${startNode.x - nodeRadius},${startNode.y}`)
                .attr('stroke', '#0d6efd')
                .attr('stroke-width', 3);
        }
        
        setTimeout(() => {
            if (window.svgPanZoom) {
                window.svgPanZoom('#automata-svg', {
                    zoomEnabled: true,
                    controlIconsEnabled: true,
                    fit: true,
                    center: true,
                    minZoom: 0.5,
                    maxZoom: 10
                });
            }
        }, 100);
        let formula = `DFA: ${dfa.start_state} --${dfa.alphabet[0]}--> ${trace.join(' --')} (${trace.length > 0 ? (dfa.accept_states.includes(trace[trace.length - 1]) ? 'ACCEPTED' : 'REJECTED') : 'REJECTED'})`;
        recordAutomataHistory('DFA visualization', { states: dfa.states, alphabet: dfa.alphabet, start_state: dfa.start_state, accept_states: dfa.accept_states, transitions: dfa.transitions, trace: trace.join('') }, { trace: trace.join('') }, formula);
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
        for (const state of acceptStates) { if (!states.includes(state)) { DMC.showError(`Accept state '${state}' is not in the set of states`); return null; } }
        const transitions = {};
        for (const line of transitionsInput) {
            if (!line.trim()) continue;
            const parts = line.split(',');
            if (parts.length !== 3) { DMC.showError("Invalid transition format. Use 'state,symbol,next_states'"); return null; }
            const [state, symbol, nextStatesStr] = parts.map(p => p.trim());
            if (!states.includes(state)) { DMC.showError(`State '${state}' in transition is not in the set of states`); return null; }
            if (symbol && !alphabet.includes(symbol)) { DMC.showError(`Symbol '${symbol}' in transition is not in the alphabet (or empty for epsilon)`); return null; }
            const nextStates = nextStatesStr.split(';').map(s => s.trim()).filter(s => s);
            for (const ns of nextStates) {
                if (!states.includes(ns)) { DMC.showError(`Next state '${ns}' in transition is not in the set of states`); return null; }
            }
            if (!transitions[state]) transitions[state] = {};
            if (!transitions[state][symbol]) transitions[state][symbol] = new Set();
            nextStates.forEach(ns => transitions[state][symbol].add(ns));
        }
        return { states, alphabet, start_state: startState, accept_states: acceptStates, transitions };
    }
    function displayNFAResults(result, nfaData, inputString) {
        let outputHTML = '';
        outputHTML += `<p class="${result.accepted ? 'accept' : 'reject'}">`;
        outputHTML += `String is <strong>${result.accepted ? 'ACCEPTED' : 'REJECTED'}</strong>`;
        outputHTML += '</p>';
        outputHTML += `<p><strong>Final reachable states after processing:</strong> {${result.final_states.join(', ')}}</p>`;
        document.getElementById('automata-output').innerHTML = outputHTML;
        visualizeNFA(nfaData, result.final_states, inputString);
        let formula = `NFA: ${nfaData.start_state} --${inputString.split('').join(' --')}--> ${result.final_states.join(' --')} (${result.accepted ? 'ACCEPTED' : 'REJECTED'})`;
        recordAutomataHistory('NFA processing', { states: nfaData.states, alphabet: nfaData.alphabet, start_state: nfaData.start_state, accept_states: nfaData.accept_states, transitions: nfaData.transitions, input_string: inputString }, result, formula);
    }
    function visualizeNFA(nfa, currentStates = [], inputString = '') {
        const visContainer = document.getElementById('automata-visualization');
        visContainer.innerHTML = '';
        const width = 800;
        const height = 400;
        const nodeRadius = 30;
        const states = nfa.states;
        const nodes = states.map((state, i) => ({
            id: state,
            x: 100 + (i * 150),
            y: height / 2,
            isStart: state === nfa.start_state,
            isAccept: nfa.accept_states.includes(state),
            isCurrent: currentStates.includes(state)
        }));
        const svg = d3.select(visContainer)
            .append('svg')
            .attr('id', 'automata-svg')
            .attr('width', width)
            .attr('height', height);
        for (const [fromState, trans] of Object.entries(nfa.transitions)) {
            for (const [symbol, nextStates] of Object.entries(trans)) {
                for (const toState of nextStates) {
                    const fromNode = nodes.find(n => n.id === fromState);
                    const toNode = nodes.find(n => n.id === toState);
                    if (fromNode && toNode) {
                        svg.append('path')
                            .attr('d', `M${fromNode.x},${fromNode.y} L${toNode.x},${toNode.y}`)
                            .attr('class', 'automata-edge')
                            .attr('stroke', symbol === '' ? '#ffc107' : '#666')
                            .attr('stroke-width', 2)
                            .attr('fill', 'none')
                            .attr('stroke-dasharray', symbol === '' ? '6,3' : '');
                        const midX = (fromNode.x + toNode.x) / 2;
                        const midY = (fromNode.y + toNode.y) / 2;
                        svg.append('text')
                            .attr('class', 'automata-label')
                            .attr('x', midX)
                            .attr('y', midY - 10)
                            .attr('text-anchor', 'middle')
                            .attr('fill', symbol === '' ? '#ffc107' : '#666')
                            .text(symbol === '' ? 'ε' : symbol);
                    }
                }
            }
        }
        const nodeGroup = svg.selectAll('.node')
            .data(nodes)
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', d => `translate(${d.x},${d.y})`);
        nodeGroup.append('circle')
            .attr('r', nodeRadius)
            .attr('class', d => [
                'automata-state',
                d.isStart ? 'start-state' : '',
                d.isAccept ? 'accept-state' : '',
                d.isCurrent ? 'current-state state-transitioning' : ''
            ].join(' '))
            .attr('fill', d => d.isCurrent ? '#0dcaf0' : d.isAccept ? '#198754' : d.isStart ? '#0d6efd' : '#fff')
            .attr('stroke', d => {
                if (d.isStart && d.isAccept) return '#198754';
                if (d.isStart) return '#0d6efd';
                if (d.isAccept) return '#198754';
                return '#666';
            })
            .attr('stroke-width', 3)
            .transition().duration(300).attr('r', nodeRadius + 2).transition().duration(300).attr('r', nodeRadius);
        nodeGroup.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '.3em')
            .attr('fill', '#000')
            .text(d => d.id);
        const startNode = nodes.find(n => n.isStart);
        if (startNode) {
            svg.append('path')
                .attr('d', `M${startNode.x - nodeRadius - 20},${startNode.y} L${startNode.x - nodeRadius},${startNode.y}`)
                .attr('stroke', '#0d6efd')
                .attr('stroke-width', 3);
        }
        
        setTimeout(() => {
            if (window.svgPanZoom) {
                window.svgPanZoom('#automata-svg', {
                    zoomEnabled: true,
                    controlIconsEnabled: true,
                    fit: true,
                    center: true,
                    minZoom: 0.5,
                    maxZoom: 10
                });
            }
        }, 100);
        let formula = `NFA: ${nfa.start_state} --${inputString.split('').join(' --')}--> ${currentStates.join(' --')} (${currentStates.some(s => nfa.accept_states.includes(s)) ? 'ACCEPTED' : 'REJECTED'})`;
        recordAutomataHistory('NFA visualization', { states: nfa.states, alphabet: nfa.alphabet, start_state: nfa.start_state, accept_states: nfa.accept_states, transitions: nfa.transitions, current_states: currentStates.join(','), input_string: inputString }, { final_states: currentStates.join(','), accepted: currentStates.some(s => nfa.accept_states.includes(s)) }, formula);
    }
    
    function loadExampleNFA(exampleId) {
        const examples = {
            'contains-11': {
                states: 'q0,q1,q2',
                alphabet: '0,1',
                startState: 'q0',
                acceptStates: 'q2',
                transitions: 'q0,0,q0\nq0,1,q0;q1\nq1,1,q2\nq1,0,\nq2,0,q2\nq2,1,q2'
            },
            'a-star-b-star': {
                states: 'q_start,q_a,q_b',
                alphabet: 'a,b',
                startState: 'q_start',
                acceptStates: 'q_start;q_a;q_b',
                transitions: 'q_start,,q_a\nq_a,a,q_a\nq_a,,q_b\nq_b,b,q_b'
            }
        };
        const example = examples[exampleId];
        if (!example) {
            DMC.showError("Unknown example NFA");
            return;
        }
        document.getElementById('nfa-states').value = example.states;
        document.getElementById('nfa-alphabet').value = example.alphabet;
        document.getElementById('nfa-start-state').value = example.startState;
        document.getElementById('nfa-accept-states').value = example.acceptStates;
        document.getElementById('nfa-transitions').value = example.transitions;
        DMC.showSuccess("Example NFA loaded");
        let formula = `NFA: ${example.start_state} --${example.alphabet[0]}--> ${example.accept_states[0]}`;
        recordAutomataHistory('Example NFA loaded', { states: example.states, alphabet: example.alphabet, start_state: example.startState, accept_states: example.acceptStates, transitions: example.transitions }, null, formula);
    }

    function loadExampleDFA(exampleId) {
        const examples = {
            'ending-01': {
                states: 'q0,q1,q2',
                alphabet: '0,1',
                startState: 'q0',
                acceptStates: 'q2',
                transitions: 'q0,0,q0\nq0,1,q1\nq1,0,q2\nq1,1,q0\nq2,0,q2\nq2,1,q1'
            },
            'even-zeros': {
                states: 'q0,q1',
                alphabet: '0,1',
                startState: 'q0',
                acceptStates: 'q0',
                transitions: 'q0,0,q1\nq0,1,q0\nq1,0,q0\nq1,1,q1'
            }
        };
        const example = examples[exampleId];
        if (!example) {
            DMC.showError("Unknown example DFA");
            return;
        }
        document.getElementById('dfa-states').value = example.states;
        document.getElementById('dfa-alphabet').value = example.alphabet;
        document.getElementById('dfa-start-state').value = example.startState;
        document.getElementById('dfa-accept-states').value = example.acceptStates;
        document.getElementById('dfa-transitions').value = example.transitions;
        DMC.showSuccess("Example DFA loaded");
        let formula = `DFA: ${example.start_state} --${example.alphabet[0]}--> ${example.accept_states[0]}`;
        recordAutomataHistory('Example DFA loaded', { states: example.states, alphabet: example.alphabet, start_state: example.startState, accept_states: example.acceptStates, transitions: example.transitions }, null, formula);
    }
    
    const convertRegexButton = document.getElementById('convert-regex-button');
    if (convertRegexButton) {
        convertRegexButton.addEventListener('click', async function() {
            const regexInput = document.getElementById('regex-input').value.trim();
            const outputDiv = document.getElementById('regex-conversion-output');
            outputDiv.innerHTML = '';
            if (!regexInput) {
                DMC.showError('Please enter a regular expression.');
                return;
            }
            try {
                const response = await fetch('/api/regex_to_nfa', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ regex: regexInput })
                });
                const data = await response.json();
                if (!response.ok) {
                    DMC.showError(data.error || 'Regex to NFA conversion failed');
                    return;
                }
                
                document.querySelector('input[name="automata-mode"][value="nfa"]').checked = true;
                dfaSection.style.display = 'none';
                nfaSection.style.display = '';
                document.getElementById('nfa-states').value = data.states.join(',');
                document.getElementById('nfa-alphabet').value = data.alphabet.join(',');
                document.getElementById('nfa-start-state').value = data.start_state;
                document.getElementById('nfa-accept-states').value = data.accept_states.join(',');
                
                let transitionsText = '';
                for (const [state, trans] of Object.entries(data.transitions)) {
                    for (const [symbol, nextStates] of Object.entries(trans)) {
                        transitionsText += `${state},${symbol},${nextStates.join(';')}` + '\n';
                    }
                }
                document.getElementById('nfa-transitions').value = transitionsText.trim();
                outputDiv.innerHTML = '<span style="color:green">NFA generated and fields populated below. You can now test strings or visualize the automaton.</span>';
                DMC.showSuccess('NFA generated from regex!');
                let formula = `NFA: ${data.start_state} --${data.alphabet[0]}--> ${data.accept_states[0]}`;
                recordAutomataHistory('Regex to NFA conversion', { regex: regexInput }, data, formula);
            } catch (error) {
                DMC.showError('Error converting regex: ' + error.message);
            }
        });
    }
    
    let stepState = {
        mode: 'dfa',
        automaton: null,
        input: '',
        position: 0,
        currentStates: [],
        trace: [],
        finished: false
    };
    
    const stepResetBtn = document.getElementById('step-reset-button');
    const stepBackBtn = document.getElementById('step-back-button');
    const stepForwardBtn = document.getElementById('step-forward-button');
    const stepStatusDiv = document.getElementById('step-status');

    function updateStepStatus() {
        if (!stepState.automaton || stepState.input === '') {
            stepStatusDiv.innerHTML = '';
            return;
        }
        let status = `<strong>Step:</strong> ${stepState.position + 1} / ${stepState.input.length}<br>`;
        status += `<strong>Current symbol:</strong> `;
        if (stepState.position < stepState.input.length) {
            status += `<span style='color:blue'>${stepState.input[stepState.position]}</span>`;
        } else {
            status += '<span style="color:gray">(end)</span>';
        }
        status += '<br>';
        if (stepState.mode === 'dfa') {
            status += `<strong>Current state:</strong> <span style='color:green'>${stepState.currentStates[0]}</span><br>`;
            status += `<strong>Trace:</strong> ${stepState.trace.join(' → ')}`;
        } else {
            status += `<strong>Current states:</strong> <span style='color:green'>{${stepState.currentStates.join(', ')}}</span><br>`;
            status += `<strong>Trace:</strong> ${stepState.trace.map((s, i) => `[${i}]: {${s.join(', ')}}`).join(' | ')}`;
        }
        if (stepState.finished) {
            status += `<br><strong>Result:</strong> <span style='color:${stepState.accepted ? 'green' : 'red'}'>${stepState.accepted ? 'ACCEPTED' : 'REJECTED'}</span>`;
        }
        stepStatusDiv.innerHTML = status;
    }

    function setupStepByStep() {
        stepState.mode = document.querySelector('input[name="automata-mode"]:checked').value;
        stepState.input = document.getElementById('automata-test-string').value.trim();
        stepState.position = 0;
        stepState.finished = false;
        stepState.accepted = false;
        stepState.trace = [];
        if (stepState.mode === 'dfa') {
            const dfa = validateDFAInput();
            if (!dfa || !stepState.input) return false;
            stepState.automaton = dfa;
            stepState.currentStates = [dfa.start_state];
            stepState.trace = [dfa.start_state];
            visualizeDFA(dfa, [dfa.start_state]);
        } else {
            const nfa = validateNFAInput();
            if (!nfa || !stepState.input) return false;
            stepState.automaton = nfa;
            
            let current = epsilonClosureNFA([nfa.start_state], nfa.transitions);
            stepState.currentStates = Array.from(current);
            stepState.trace = [Array.from(current)];
            visualizeNFA(nfa, Array.from(current));
        }
        updateStepStatus();
        return true;
    }

    if (stepResetBtn) {
        stepResetBtn.addEventListener('click', function() {
            setupStepByStep();
        });
    }
    if (stepBackBtn) {
        stepBackBtn.addEventListener('click', function() {
            if (stepState.position > 0) {
                stepState.position--;
                stepState.finished = false;
                if (stepState.mode === 'dfa') {
                    stepState.currentStates = [stepState.trace[stepState.position]];
                    visualizeDFA(stepState.automaton, [stepState.trace[stepState.position]]);
                } else {
                    stepState.currentStates = stepState.trace[stepState.position];
                    visualizeNFA(stepState.automaton, stepState.currentStates);
                }
                updateStepStatus();
            }
        });
    }
    if (stepForwardBtn) {
        stepForwardBtn.addEventListener('click', function() {
            if (!stepState.automaton || stepState.finished) return;
            if (stepState.position >= stepState.input.length) return;
            const symbol = stepState.input[stepState.position];
            if (stepState.mode === 'dfa') {
                const dfa = stepState.automaton;
                const current = stepState.currentStates[0];
                const key = `${current},${symbol}`;
                if (!(key in dfa.transitions)) {
                    stepState.finished = true;
                    stepState.accepted = false;
                    updateStepStatus();
                    return;
                }
                const next = dfa.transitions[key];
                stepState.currentStates = [next];
                stepState.trace.push(next);
                stepState.position++;
                visualizeDFA(dfa, [next]);
                if (stepState.position === stepState.input.length) {
                    stepState.finished = true;
                    stepState.accepted = dfa.accept_states.includes(next);
                }
            } else {
                const nfa = stepState.automaton;
                let currentSet = new Set(stepState.currentStates);
                let nextSet = new Set();
                for (const state of currentSet) {
                    if (nfa.transitions[state] && nfa.transitions[state][symbol]) {
                        for (const ns of nfa.transitions[state][symbol]) {
                            nextSet.add(ns);
                        }
                    }
                }
                // Epsilon closure after move
                nextSet = epsilonClosureNFA(Array.from(nextSet), nfa.transitions);
                stepState.currentStates = Array.from(nextSet);
                stepState.trace.push(Array.from(nextSet));
                stepState.position++;
                visualizeNFA(nfa, Array.from(nextSet));
                if (stepState.position === stepState.input.length) {
                    stepState.finished = true;
                    stepState.accepted = stepState.currentStates.some(s => nfa.accept_states.includes(s));
                }
            }
            updateStepStatus();
        });
    }
    
    function epsilonClosureNFA(states, transitions) {
        const closure = new Set(states);
        const stack = [...states];
        while (stack.length > 0) {
            const state = stack.pop();
            if (transitions[state] && transitions[state]['']) {
                for (const ns of transitions[state]['']) {
                    if (!closure.has(ns)) {
                        closure.add(ns);
                        stack.push(ns);
                    }
                }
            }
        }
        return closure;
    }
    
    const exportBtn = document.getElementById('export-automata-json');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            const mode = document.querySelector('input[name="automata-mode"]:checked').value;
            let data = null;
            if (mode === 'dfa') {
                data = validateDFAInput();
            } else {
                data = validateNFAInput();
            }
            if (!data) {
                DMC.showError('Invalid automaton definition.');
                return;
            }
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = mode.toUpperCase() + '_automaton.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            let formula = `Automaton: ${mode.toUpperCase()}`;
            recordAutomataHistory('Automaton export', { mode: mode, data: JSON.stringify(data) }, null, formula);
        });
    }
    
    const importInput = document.getElementById('import-automata-json');
    if (importInput) {
        importInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(evt) {
                try {
                    const data = JSON.parse(evt.target.result);
                    if (data.states && data.alphabet && data.start_state && data.accept_states && data.transitions) {
                        // Guess DFA or NFA by transitions structure
                        const isDFA = Object.values(data.transitions).every(v => typeof v === 'string' || typeof v === 'object' && !Array.isArray(v));
                        if (isDFA) {
                            document.querySelector('input[name="automata-mode"][value="dfa"]').checked = true;
                            dfaSection.style.display = '';
                            nfaSection.style.display = 'none';
                            document.getElementById('dfa-states').value = data.states.join(',');
                            document.getElementById('dfa-alphabet').value = data.alphabet.join(',');
                            document.getElementById('dfa-start-state').value = data.start_state;
                            document.getElementById('dfa-accept-states').value = data.accept_states.join(',');
                            let transitionsText = '';
                            for (const key in data.transitions) {
                                const [state, symbol] = key.split(',');
                                transitionsText += `${state},${symbol},${data.transitions[key]}\n`;
                            }
                            document.getElementById('dfa-transitions').value = transitionsText.trim();
                        } else {
                            document.querySelector('input[name="automata-mode"][value="nfa"]').checked = true;
                            dfaSection.style.display = 'none';
                            nfaSection.style.display = '';
                            document.getElementById('nfa-states').value = data.states.join(',');
                            document.getElementById('nfa-alphabet').value = data.alphabet.join(',');
                            document.getElementById('nfa-start-state').value = data.start_state;
                            document.getElementById('nfa-accept-states').value = data.accept_states.join(',');
                            let transitionsText = '';
                            for (const state in data.transitions) {
                                for (const symbol in data.transitions[state]) {
                                    transitionsText += `${state},${symbol},${Array.from(data.transitions[state][symbol]).join(';')}\n`;
                                }
                            }
                            document.getElementById('nfa-transitions').value = transitionsText.trim();
                        }
                        DMC.showSuccess('Automaton imported!');
                        let formula = `Automaton: ${mode.toUpperCase()}`;
                        recordAutomataHistory('Automaton import', { data: JSON.stringify(data) }, null, formula);
                    } else {
                        DMC.showError('Invalid automaton JSON format.');
                    }
                } catch (err) {
                    DMC.showError('Error parsing JSON: ' + err.message);
                }
            };
            reader.readAsText(file);
        });
    }
    
    const minimizeButton = document.getElementById('minimize-dfa-button');
    if (minimizeButton) {
        minimizeButton.addEventListener('click', async function() {
            const dfaData = validateDFAInput();
            if (!dfaData) return;
            const payload = {
                states: dfaData.states,
                alphabet: dfaData.alphabet,
                start_state: dfaData.start_state,
                accept_states: dfaData.accept_states,
                transitions: dfaData.transitions
            };
            const response = await fetch('/api/dfa_minimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!response.ok) {
                DMC.showError(data.error || 'DFA minimization failed');
                return;
            }
            document.getElementById('automata-output').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
            visualizeDFA(data);
            DMC.showSuccess("DFA minimized");
            let formula = `Automaton: ${mode.toUpperCase()}`;
            recordAutomataHistory('DFA minimization', { states: dfaData.states, alphabet: dfaData.alphabet, start_state: dfaData.start_state, accept_states: dfaData.accept_states, transitions: dfaData.transitions }, data, formula);
        });
    }
    
    window.convertNfaToDfa = async function(nfaData) {
        const transitions = {};
        for (const [state, trans] of Object.entries(nfaData.transitions)) {
            transitions[state] = {};
            for (const [symbol, nextStates] of Object.entries(trans)) {
                transitions[state][symbol] = Array.from(nextStates);
            }
        }
        const payload = {
            states: nfaData.states,
            alphabet: nfaData.alphabet,
            start_state: nfaData.start_state,
            accept_states: nfaData.accept_states,
            transitions: transitions
        };
        const response = await fetch('/api/nfa_to_dfa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) {
            DMC.showError(data.error || 'NFA to DFA conversion failed');
            return;
        }
        document.getElementById('automata-output').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
        visualizeDFA(data);
        DMC.showSuccess("NFA converted to DFA");
        let formula = `Automaton: ${mode.toUpperCase()}`;
        recordAutomataHistory('NFA to DFA conversion', { states: nfaData.states, alphabet: nfaData.alphabet, start_state: nfaData.start_state, accept_states: nfaData.accept_states, transitions: transitions }, data, formula);
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
    
    ['dfa-states','dfa-alphabet','dfa-start-state','dfa-accept-states','dfa-transitions','nfa-states','nfa-alphabet','nfa-start-state','nfa-accept-states','nfa-transitions'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', function() {
                let data = null;
                if (id.startsWith('dfa')) data = validateDFAInput();
                else data = validateNFAInput();
                updateAutomatonSummary(data);
            });
        }
    });
    
    const minimizeDfaUiButton = document.getElementById('minimize-dfa-ui-button');
    if (minimizeDfaUiButton) {
        minimizeDfaUiButton.addEventListener('click', async function() {
            const dfaData = validateDFAInput();
            if (!dfaData) return;
            const payload = {
                states: dfaData.states,
                alphabet: dfaData.alphabet,
                start_state: dfaData.start_state,
                accept_states: dfaData.accept_states,
                transitions: dfaData.transitions
            };
            const response = await fetch('/api/dfa_minimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!response.ok) {
                DMC.showError(data.error || 'DFA minimization failed');
                return;
            }
            updateAutomatonSummary(data);
            document.getElementById('automata-output').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
            visualizeDFA(data);
            DMC.showSuccess('DFA minimized');
            let formula = `Automaton: ${mode.toUpperCase()}`;
            recordAutomataHistory('DFA minimization', { states: dfaData.states, alphabet: dfaData.alphabet, start_state: dfaData.start_state, accept_states: dfaData.accept_states, transitions: dfaData.transitions }, data, formula);
        });
    }
    
    const nfaToDfaUiButton = document.getElementById('nfa-to-dfa-ui-button');
    if (nfaToDfaUiButton) {
        nfaToDfaUiButton.addEventListener('click', async function() {
            const nfaData = validateNFAInput();
            if (!nfaData) return;
            const transitions = {};
            for (const [state, trans] of Object.entries(nfaData.transitions)) {
                transitions[state] = {};
                for (const [symbol, nextStates] of Object.entries(trans)) {
                    transitions[state][symbol] = Array.from(nextStates);
                }
            }
            const payload = {
                states: nfaData.states,
                alphabet: nfaData.alphabet,
                start_state: nfaData.start_state,
                accept_states: nfaData.accept_states,
                transitions: transitions
            };
            const response = await fetch('/api/nfa_to_dfa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!response.ok) {
                DMC.showError(data.error || 'NFA to DFA conversion failed');
                return;
            }
            updateAutomatonSummary(data);
            document.getElementById('automata-output').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
            visualizeDFA(data);
            DMC.showSuccess('NFA converted to DFA');
            let formula = `Automaton: ${mode.toUpperCase()}`;
            recordAutomataHistory('NFA to DFA conversion', { states: nfaData.states, alphabet: nfaData.alphabet, start_state: nfaData.start_state, accept_states: nfaData.accept_states, transitions: transitions }, data, formula);
        });
    }

    function recordAutomataHistory(operation, inputs, answer, formula) {
        window.DMC_ExplainHistory = window.DMC_ExplainHistory || [];
        window.DMC_ExplainHistory.push({
            topic: 'automata',
            operation: operation,
            inputs: inputs,
            answer: answer,
            formula: formula,
            timestamp: Date.now()
        });
        if (window.DMC_ExplainHistory.length > 10) window.DMC_ExplainHistory.shift();
        window.DMC_ExplainContext.operation = operation;
        window.DMC_ExplainContext.inputs = inputs;
        window.DMC_ExplainContext.formula = formula;
    }

    // --- Batch Test ---
    document.getElementById('runBatchTestBtn').onclick = async function() {
        const strings = document.getElementById('batchTestStrings').value.split('\n').map(s => s.trim()).filter(s => s.length);
        let automaton = null, type = null;
        if (currentMode === 'dfa') {
            automaton = collectDfaData();
            type = 'dfa';
        } else if (currentMode === 'nfa' || currentMode === 'enfa') {
            automaton = collectNfaData();
            type = 'nfa';
        } else {
            alert('Batch test only supported for DFA/NFA');
            return;
        }
        if (!automaton) { alert('Invalid automaton definition.'); return; }
        try {
            const resp = await fetch('/api/automata/batch_test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, automaton, strings })
            });
            const data = await resp.json();
            if (!data.result) throw new Error(data.error || 'No result');
            let html = '<table class="table table-bordered table-sm"><thead><tr><th>String</th><th>Accepted?</th></tr></thead><tbody>';
            for (const r of data.result) html += `<tr><td>${r.string}</td><td>${r.accepted ? '✔️' : '❌'}</td></tr>`;
            html += '</tbody></table>';
            document.getElementById('automata-batch-test-result').innerHTML = html;
        } catch (e) {
            document.getElementById('automata-batch-test-result').innerHTML = `<span class='text-danger'>Batch test failed: ${e.message}</span>`;
        }
    };
    // --- Import/Export ---
    document.getElementById('exportAutomatonBtn').onclick = function() {
        let automaton = null;
        if (currentMode === 'dfa') automaton = collectDfaData();
        else if (currentMode === 'nfa' || currentMode === 'enfa') automaton = collectNfaData();
        else { alert('Export only supported for DFA/NFA'); return; }
        if (!automaton) { alert('Invalid automaton definition.'); return; }
        const blob = new Blob([JSON.stringify(automaton, null, 2)], {type:'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentMode}_automaton.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(()=>URL.revokeObjectURL(url), 100);
    };
    document.getElementById('importAutomatonBtn').onclick = function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(ev) {
                try {
                    const data = JSON.parse(ev.target.result);
                    if (currentMode === 'dfa') populateDfaFields(data);
                    else if (currentMode === 'nfa' || currentMode === 'enfa') populateNfaFields(data);
                    else alert('Import only supported for DFA/NFA');
                } catch {
                    alert('Invalid automaton file.');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };
    // --- Graphical Editor ---
    document.getElementById('graphicalEditorBtn').onclick = function() {
        const panel = document.getElementById('automata-graphical-editor-panel');
        panel.style.display = 'block';
        if (currentMode === 'dfa' || currentMode === 'nfa' || currentMode === 'enfa') {
            renderGraphicalEditor(panel, currentMode);
        } else if (currentMode === 'pda' || currentMode === 'tm') {
            panel.innerHTML = `<div class='alert alert-info'>Graphical editing for PDA/TM coming soon!</div>`;
        }
    };
    function renderGraphicalEditor(panel, mode) {
        panel.innerHTML = `<div id='auto-graph-editor-toolbar' class='mb-2'></div><svg id='auto-graph-editor-canvas' width='600' height='350' style='background:#f8fafc;border-radius:10px;box-shadow:0 2px 8px #e0e7ef;'></svg><div id='auto-graph-editor-errors' class='mt-2'></div>`;
        const svg = d3.select('#auto-graph-editor-canvas');
        let states = [], transitions = [], startState = null, acceptStates = new Set();
        // --- Initial load from form fields ---
        if (mode === 'dfa') {
            const d = collectDfaData();
            states = (d.states||[]).map((label,i)=>({id:i,label}));
            transitions = Object.entries(d.transitions||{}).map(([k,v])=>{
                const [from,sym] = k.split(',');
                return {from:states.find(s=>s.label===from)?.id,to:states.find(s=>s.label===v)?.id,sym};
            }).filter(e=>e.from!=null&&e.to!=null);
            startState = states.find(s=>s.label===d.start_state)?.id;
            acceptStates = new Set((d.accept_states||[]).map(l=>states.find(s=>s.label===l)?.id).filter(x=>x!=null));
        } else if (mode === 'nfa' || mode === 'enfa') {
            const d = collectNfaData();
            states = (d.states||[]).map((label,i)=>({id:i,label}));
            for (const from in d.transitions||{}) for (const sym in d.transitions[from]) for (const to of d.transitions[from][sym]) {
                transitions.push({from:states.find(s=>s.label===from)?.id,to:states.find(s=>s.label===to)?.id,sym});
            }
            startState = states.find(s=>s.label===d.start_state)?.id;
            acceptStates = new Set((d.accept_states||[]).map(l=>states.find(s=>s.label===l)?.id).filter(x=>x!=null));
        }
        // --- D3 rendering ---
        let dragLine = null, dragFrom = null;
        function redraw() {
            svg.selectAll('*').remove();
            // Draw transitions
            svg.selectAll('path.transition').data(transitions).enter().append('path')
                .attr('class','transition')
                .attr('stroke','#888').attr('stroke-width',2).attr('fill','none')
                .attr('marker-end','url(#arrow)')
                        redraw();
                        syncToForm();
                    }
                });
            svg.selectAll('text.trlabel').data(transitions).enter().append('text')
                .attr('class','trlabel')
                .attr('x',d=>{
                .on('click',function(e,d){
                    if (confirm('Delete this transition?')) {
                        transitions = transitions.filter(t=>t!==d);
                        redraw();
                        syncToForm();
                    }
                });
            // Draw transition labels
            svg.selectAll('text.trlabel').data(transitions).enter().append('text')
                .attr('class','trlabel')
                .attr('x',d=>{
                    const a=states[d.from],b=states[d.to];
                    return (a.x+b.x)/2;
                })
                .attr('y',d=>{
                    const a=states[d.from],b=states[d.to];
                    return (a.y+b.y)/2-8;
                })
                .attr('text-anchor','middle')
                .attr('fill','#333')
                .text(d=>d.sym);
            // Draw states
            svg.selectAll('circle.state').data(states).enter().append('circle')
                .attr('class','state')
                .attr('cx',d=>d.x).attr('cy',d=>d.y).attr('r',28)
                .attr('fill',d=>acceptStates.has(d.id)?'#d1fae5':'#e0e7ff')
                .attr('stroke',d=>d.id===startState?'#6366f1':'#888').attr('stroke-width',d=>d.id===startState?4:2)
                .on('click',function(e,d){
                    if (e.shiftKey) { // Toggle accept
                        if (acceptStates.has(d.id)) acceptStates.delete(d.id); else acceptStates.add(d.id);
                    } else if (e.ctrlKey) { // Set start
                        startState = d.id;
                    } else { // Edit label
                        const label = prompt('Edit state label:',d.label);
                        if (label) d.label=label;
                    }
                    redraw();
                    syncToForm();
                })
                .call(d3.drag()
                    .on('start',function(e,d){d.fx=d.x;d.fy=d.y;})
                    .on('drag',function(e,d){d.x=e.x;d.y=e.y;redraw();})
                    .on('end',function(e,d){d.fx=null;d.fy=null;syncToForm();})
                );
            // Draw state labels
            svg.selectAll('text.stlabel').data(states).enter().append('text')
                .attr('class','stlabel')
                .attr('x',d=>d.x).attr('y',d=>d.y+6)
                .attr('text-anchor','middle').attr('font-size',18).attr('font-weight','bold')
                .attr('fill','#333').text(d=>d.label);
            // Draw drag line
            if (dragLine) svg.append('line').attr('x1',dragLine[0]).attr('y1',dragLine[1]).attr('x2',dragLine[2]).attr('y2',dragLine[3]).attr('stroke','#6366f1').attr('stroke-width',3).attr('stroke-dasharray','4,2');
            // Arrow marker
            svg.append('defs').append('marker').attr('id','arrow').attr('viewBox','0 -5 10 10').attr('refX',24).attr('refY',0).attr('markerWidth',8).attr('markerHeight',8).attr('orient','auto')
                .append('path').attr('d','M0,-5L10,0L0,5').attr('fill','#888');
        }
        function layoutStates() {
            const cx=300,cy=170,r=110,n=states.length;
            for (let i=0;i<n;++i) {
                states[i].x=cx+r*Math.cos(2*Math.PI*i/n-Math.PI/2);
                states[i].y=cy+r*Math.sin(2*Math.PI*i/n-Math.PI/2);
            }
        }
        layoutStates();
        redraw();
        // --- Toolbar ---
        const toolbar = document.getElementById('auto-graph-editor-toolbar');
        toolbar.innerHTML = `<button class='btn btn-outline-primary btn-sm' id='addStateBtn'>Add State</button> <button class='btn btn-outline-danger btn-sm' id='delStateBtn'>Delete State</button> <button class='btn btn-outline-info btn-sm' id='addTransBtn'>Add Transition</button>`;
        document.getElementById('addStateBtn').onclick = function() {
            const label = prompt('State label?','q'+states.length);
            if (!label) return;
            states.push({id:states.length,label});
            layoutStates();
            redraw();
            syncToForm();
        };
        document.getElementById('delStateBtn').onclick = function() {
            const idx = prompt('State index to delete (0-based)?');
            const i = parseInt(idx,10);
            if (isNaN(i)||i<0||i>=states.length) return;
            states.splice(i,1);
            transitions = transitions.filter(t=>t.from!==i&&t.to!==i);
            acceptStates.delete(i);
            if (startState===i) startState=null;
            layoutStates();
            redraw();
            syncToForm();
        };
        document.getElementById('addTransBtn').onclick = function() {
            dragFrom = null;
            svg.on('mousedown',function(e){
                const [mx,my]=d3.pointer(e);
                for (const s of states) {
                    if (Math.hypot(mx-s.x,my-s.y)<28) { dragFrom=s; dragLine=[s.x,s.y,mx,my]; break; }
                }
            });
            svg.on('mousemove',function(e){
                if (!dragFrom) return;
                const [mx,my]=d3.pointer(e);
                dragLine=[dragFrom.x,dragFrom.y,mx,my];
                redraw();
            });
            svg.on('mouseup',function(e){
                if (!dragFrom) return;
                const [mx,my]=d3.pointer(e);
                for (const s of states) {
                    if (Math.hypot(mx-s.x,my-s.y)<28) {
                        const sym = prompt('Transition symbol?');
                        if (sym) transitions.push({from:dragFrom.id,to:s.id,sym});
                        break;
                    }
                }
                dragFrom=null;dragLine=null;
                svg.on('mousedown',null).on('mousemove',null).on('mouseup',null);
                redraw();
                syncToForm();
            });
        };
        // --- Sync to form fields ---
        function syncToForm() {
            // Update text fields based on states/transitions
            if (mode==='dfa') {
                document.getElementById('dfa-states').value = states.map(s=>s.label).join(',');
                document.getElementById('dfa-alphabet').value = Array.from(new Set(transitions.map(t=>t.sym))).join(',');
                document.getElementById('dfa-start-state').value = states.find(s=>s.id===startState)?.label||'';
                document.getElementById('dfa-accept-states').value = Array.from(acceptStates).map(i=>states[i]?.label).filter(Boolean).join(',');
                const obj={};
                for (const t of transitions) obj[`${states[t.from]?.label},${t.sym}`]=states[t.to]?.label;
                document.getElementById('dfa-transitions').value = Object.entries(obj).map(([k,v])=>`${k},${v}`).join('\n');
            } else if (mode==='nfa'||mode==='enfa') {
                document.getElementById('nfa-states').value = states.map(s=>s.label).join(',');
                document.getElementById('nfa-alphabet').value = Array.from(new Set(transitions.map(t=>t.sym))).join(',');
                document.getElementById('nfa-start-state').value = states.find(s=>s.id===startState)?.label||'';
                document.getElementById('nfa-accept-states').value = Array.from(acceptStates).map(i=>states[i]?.label).filter(Boolean).join(',');
                // NFA transitions: {state: {symbol: [nexts]}}
                const obj={};
                for (const t of transitions) {
                    const from=states[t.from]?.label,to=states[t.to]?.label,sym=t.sym;
                    if (!from||!to) continue;
                    if (!obj[from]) obj[from]={};
                    if (!obj[from][sym]) obj[from][sym]=[];
                    obj[from][sym].push(to);
                }
                let out=[];
                for (const from in obj) for (const sym in obj[from]) out.push(`${from},${sym},${obj[from][sym].join(';')}`);
                document.getElementById('nfa-transitions').value = out.join('\n');
            }
        }
    }

    // --- PDA Graphical Editor ---
    function renderPdaGraphicalEditor(panel) {
        panel.innerHTML = `<div id='pda-graph-editor-toolbar' class='mb-2'></div><svg id='pda-graph-editor-canvas' width='700' height='400' style='background:#f8fafc;border-radius:10px;box-shadow:0 2px 8px #e0e7ef;'></svg><div id='pda-graph-editor-sidebar' class='mt-2'></div><div id='pda-graph-editor-errors' class='mt-2'></div>`;
        const svg = d3.select('#pda-graph-editor-canvas');
        let states = [], transitions = [], startState = null, acceptStates = new Set(), stackAlphabet = new Set(['Z']);
        let undoStack = [], redoStack = [];
        // --- Helper functions ---
        function pushUndo() { undoStack.push(JSON.stringify({states, transitions, startState, acceptStates: Array.from(acceptStates), stackAlphabet: Array.from(stackAlphabet)})); redoStack = []; }
        function popUndo() { if (!undoStack.length) return; redoStack.push(JSON.stringify({states, transitions, startState, acceptStates: Array.from(acceptStates), stackAlphabet: Array.from(stackAlphabet)})); const prev = JSON.parse(undoStack.pop()); states = prev.states; transitions = prev.transitions; startState = prev.startState; acceptStates = new Set(prev.acceptStates); stackAlphabet = new Set(prev.stackAlphabet); redraw(); updateSidebar(); checkErrors(); }
        function popRedo() { if (!redoStack.length) return; undoStack.push(JSON.stringify({states, transitions, startState, acceptStates: Array.from(acceptStates), stackAlphabet: Array.from(stackAlphabet)})); const next = JSON.parse(redoStack.pop()); states = next.states; transitions = next.transitions; startState = next.startState; acceptStates = new Set(next.acceptStates); stackAlphabet = new Set(next.stackAlphabet); redraw(); updateSidebar(); checkErrors(); }
        // --- D3 rendering ---
        let dragLine = null, dragFrom = null;
        function redraw() {
            svg.selectAll('*').remove();
            // Draw transitions
            svg.selectAll('path.transition').data(transitions).enter().append('path')
                .attr('class','transition')
                .attr('stroke','#888').attr('stroke-width',2).attr('fill','none')
                .attr('marker-end','url(#arrow)')
                .attr('d',d=>{
                    const a=states[d.from],b=states[d.to];
                    if (!a||!b) return '';
                    const dx=b.x-a.x,dy=b.y-a.y,len=Math.sqrt(dx*dx+dy*dy)||1;
                    const offx=dx/len*30,offy=dy/len*30;
                    return `M${a.x+offx},${a.y+offy} L${b.x-offx},${b.y-offy}`;
                })
                .attr('stroke',d=>d.error?'#f00':'#888')
                .on('click',function(e,d){
                    if (confirm('Delete this transition?')) { pushUndo(); transitions = transitions.filter(t=>t!==d); redraw(); updateSidebar(); checkErrors(); }
                });
            // Draw transition labels
            svg.selectAll('text.trlabel').data(transitions).enter().append('text')
                .attr('class','trlabel')
                .attr('x',d=>{
                    const a=states[d.from],b=states[d.to];
                    return (a.x+b.x)/2;
                })
                .attr('y',d=>{
                    const a=states[d.from],b=states[d.to];
                    return (a.y+b.y)/2-8;
                })
                .attr('text-anchor','middle')
                .attr('fill',d=>d.error?'#f00':'#333')
                .text(d=>`${d.input||'ε'},${d.pop||'ε'}→${d.push||'ε'}`)
                .on('click',function(e,d){
                    const input = prompt('Input symbol:',d.input||'');
                    const pop = prompt('Stack pop symbol:',d.pop||'');
                    const push = prompt('Stack push symbol:',d.push||'');
                    if (input!==null) d.input=input;
                    if (pop!==null) d.pop=pop;
                    if (push!==null) d.push=push;
                    if (pop) stackAlphabet.add(pop);
                    if (push) for (const s of push) stackAlphabet.add(s);
                    pushUndo(); redraw(); updateSidebar(); checkErrors();
                });
            // Draw states
            svg.selectAll('circle.state').data(states).enter().append('circle')
                .attr('class','state')
                .attr('cx',d=>d.x).attr('cy',d=>d.y).attr('r',28)
                .attr('fill',d=>acceptStates.has(d.id)?'#d1fae5':'#e0e7ff')
                .attr('stroke',d=>d.id===startState?'#6366f1':'#888').attr('stroke-width',d=>d.id===startState?4:2)
                .on('click',function(e,d){
                    if (e.shiftKey) { if (acceptStates.has(d.id)) acceptStates.delete(d.id); else acceptStates.add(d.id); }
                    else if (e.ctrlKey) { startState = d.id; }
                    else { const label = prompt('Edit state label:',d.label); if (label) d.label=label; }
                    pushUndo(); redraw(); updateSidebar(); checkErrors();
                })
                .call(d3.drag()
                    .on('start',function(e,d){d.fx=d.x;d.fy=d.y;})
                    .on('drag',function(e,d){d.x=e.x;d.y=e.y;redraw();})
                    .on('end',function(e,d){d.fx=null;d.fy=null;pushUndo(); updateSidebar(); checkErrors(); })
                );
            // Draw state labels
            svg.selectAll('text.stlabel').data(states).enter().append('text')
                .attr('class','stlabel')
                .attr('x',d=>d.x).attr('y',d=>d.y+6)
                .attr('text-anchor','middle').attr('font-size',18).attr('font-weight','bold')
                .attr('fill','#333').text(d=>d.label);
            // Draw drag line
            if (dragLine) svg.append('line').attr('x1',dragLine[0]).attr('y1',dragLine[1]).attr('x2',dragLine[2]).attr('y2',dragLine[3]).attr('stroke','#6366f1').attr('stroke-width',3).attr('stroke-dasharray','4,2');
            // Arrow marker
            svg.append('defs').append('marker').attr('id','arrow').attr('viewBox','0 -5 10 10').attr('refX',24).attr('refY',0).attr('markerWidth',8).attr('markerHeight',8).attr('orient','auto')
                .append('path').attr('d','M0,-5L10,0L0,5').attr('fill','#888');
        }
        function layoutStates() {
            const cx=350,cy=180,r=140,n=states.length;
            for (let i=0;i<n;++i) {
                states[i].x=cx+r*Math.cos(2*Math.PI*i/n-Math.PI/2);
                states[i].y=cy+r*Math.sin(2*Math.PI*i/n-Math.PI/2);
            }
        }
        layoutStates();
        redraw();
        // --- Toolbar ---
        const toolbar = document.getElementById('pda-graph-editor-toolbar');
        toolbar.innerHTML = `<button class='btn btn-outline-primary btn-sm' id='addStateBtn'>Add State</button> <button class='btn btn-outline-danger btn-sm' id='delStateBtn'>Delete State</button> <button class='btn btn-outline-info btn-sm' id='addTransBtn'>Add Transition</button> <button class='btn btn-outline-secondary btn-sm' id='undoBtn'>Undo</button> <button class='btn btn-outline-secondary btn-sm' id='redoBtn'>Redo</button>`;
        document.getElementById('addStateBtn').onclick = function() { const label = prompt('State label?','q'+states.length); if (!label) return; pushUndo(); states.push({id:states.length,label}); layoutStates(); redraw(); updateSidebar(); checkErrors(); };
        document.getElementById('delStateBtn').onclick = function() { const idx = prompt('State index to delete (0-based)?'); const i = parseInt(idx,10); if (isNaN(i)||i<0||i>=states.length) return; pushUndo(); states.splice(i,1); transitions = transitions.filter(t=>t.from!==i&&t.to!==i); acceptStates.delete(i); if (startState===i) startState=null; layoutStates(); redraw(); updateSidebar(); checkErrors(); };
        document.getElementById('addTransBtn').onclick = function() { dragFrom = null; svg.on('mousedown',function(e){ const [mx,my]=d3.pointer(e); for (const s of states) { if (Math.hypot(mx-s.x,my-s.y)<28) { dragFrom=s; dragLine=[s.x,s.y,mx,my]; break; } } }); svg.on('mousemove',function(e){ if (!dragFrom) return; const [mx,my]=d3.pointer(e); dragLine=[dragFrom.x,dragFrom.y,mx,my]; redraw(); }); svg.on('mouseup',function(e){ if (!dragFrom) return; const [mx,my]=d3.pointer(e); for (const s of states) { if (Math.hypot(mx-s.x,my-s.y)<28) { const input = prompt('Input symbol?'); const pop = prompt('Stack pop symbol?'); const push = prompt('Stack push symbol?'); if (input!==null&&pop!==null&&push!==null) { pushUndo(); transitions.push({from:dragFrom.id,to:s.id,input,pop,push}); if (pop) stackAlphabet.add(pop); if (push) for (const c of push) stackAlphabet.add(c); } break; } } dragFrom=null;dragLine=null; svg.on('mousedown',null).on('mousemove',null).on('mouseup',null); redraw(); updateSidebar(); checkErrors(); }); };
        document.getElementById('undoBtn').onclick = popUndo;
        document.getElementById('redoBtn').onclick = popRedo;
        layoutStates(); redraw(); updateSidebar(); checkErrors();
        // --- Sidebar ---
        function updateSidebar() {
            const sidebar = document.getElementById('pda-graph-editor-sidebar');
            sidebar.innerHTML = `<b>Stack Alphabet:</b> ${Array.from(stackAlphabet).join(', ')}<br><b>Transitions:</b><ul>` + transitions.map(t=>`<li>${states[t.from]?.label} -- [${t.input||'ε'},${t.pop||'ε'}→${t.push||'ε'}] --> ${states[t.to]?.label}</li>`).join('') + '</ul>';
        }
        // --- Error checks ---
        function checkErrors() {
            let errors = [];
            // Unreachable states
            const reachable = new Set();
            if (startState != null) { const stack = [startState]; while (stack.length) { const s = stack.pop(); if (reachable.has(s)) continue; reachable.add(s); for (const t of transitions) if (t.from === s) stack.push(t.to); } }
            for (const s of states) if (!reachable.has(s.id)) errors.push(`State '${s.label}' is unreachable.`);
            // No start state
            if (startState == null) errors.push('No start state set.');
            // No accept state
            if (!acceptStates.size) errors.push('No accept state set.');
            // Invalid stack symbols
            for (const t of transitions) {
                if (t.pop && !stackAlphabet.has(t.pop)) errors.push(`Transition uses undefined stack pop symbol '${t.pop}'.`);
                if (t.push) for (const c of t.push) if (!stackAlphabet.has(c)) errors.push(`Transition uses undefined stack push symbol '${c}'.`);
            }
            // Duplicate transitions
            const seen = new Set();
            for (const t of transitions) { const key = `${t.from},${t.input},${t.pop}`; if (seen.has(key)) errors.push(`Duplicate transition from '${states[t.from]?.label}' on [${t.input},${t.pop}].`); else seen.add(key); }
            // Show errors
            const panel = document.getElementById('pda-graph-editor-errors');
            panel.innerHTML = errors.length ? `<div class='alert alert-danger'>${errors.map(e=>`<div>${e}</div>`).join('')}</div>` : '';
            for (const t of transitions) t.error = false;
            for (const e of errors) for (const t of transitions) if (e.includes(states[t.from]?.label) && e.includes(states[t.to]?.label)) t.error = true;
        }
    }

    // --- TM Graphical Editor ---
    function renderTmGraphicalEditor(panel) {
        panel.innerHTML = `<div id='tm-graph-editor-toolbar' class='mb-2'></div><svg id='tm-graph-editor-canvas' width='700' height='400' style='background:#f8fafc;border-radius:10px;box-shadow:0 2px 8px #e0e7ef;'></svg><div id='tm-graph-editor-sidebar' class='mt-2'></div><div id='tm-graph-editor-errors' class='mt-2'></div>`;
        const svg = d3.select('#tm-graph-editor-canvas');
        let states = [], transitions = [], startState = null, acceptStates = new Set(), rejectStates = new Set(), tapeAlphabet = new Set(['B']);
        let undoStack = [], redoStack = [];
        function pushUndo() { undoStack.push(JSON.stringify({states, transitions, startState, acceptStates: Array.from(acceptStates), rejectStates: Array.from(rejectStates), tapeAlphabet: Array.from(tapeAlphabet)})); redoStack = []; }
        function popUndo() { if (!undoStack.length) return; redoStack.push(JSON.stringify({states, transitions, startState, acceptStates: Array.from(acceptStates), rejectStates: Array.from(rejectStates), tapeAlphabet: Array.from(tapeAlphabet)})); const prev = JSON.parse(undoStack.pop()); states = prev.states; transitions = prev.transitions; startState = prev.startState; acceptStates = new Set(prev.acceptStates); rejectStates = new Set(prev.rejectStates); tapeAlphabet = new Set(prev.tapeAlphabet); redraw(); updateSidebar(); checkErrors(); }
        function popRedo() { if (!redoStack.length) return; undoStack.push(JSON.stringify({states, transitions, startState, acceptStates: Array.from(acceptStates), rejectStates: Array.from(rejectStates), tapeAlphabet: Array.from(tapeAlphabet)})); const next = JSON.parse(redoStack.pop()); states = next.states; transitions = next.transitions; startState = next.startState; acceptStates = new Set(next.acceptStates); rejectStates = new Set(next.rejectStates); tapeAlphabet = new Set(next.tapeAlphabet); redraw(); updateSidebar(); checkErrors(); }
        let dragLine = null, dragFrom = null;
        function redraw() {
            svg.selectAll('*').remove();
            svg.selectAll('path.transition').data(transitions).enter().append('path')
                .attr('class','transition')
                .attr('stroke','#888').attr('stroke-width',2).attr('fill','none')
                .attr('marker-end','url(#arrow)')
                .attr('d',d=>{
                    const a=states[d.from],b=states[d.to];
                    if (!a||!b) return '';
                    const dx=b.x-a.x,dy=b.y-a.y,len=Math.sqrt(dx*dx+dy*dy)||1;
                    const offx=dx/len*30,offy=dy/len*30;
                    return `M${a.x+offx},${a.y+offy} L${b.x-offx},${b.y-offy}`;
                })
                .attr('stroke',d=>d.error?'#f00':'#888')
                .on('click',function(e,d){
                    if (confirm('Delete this transition?')) { pushUndo(); transitions = transitions.filter(t=>t!==d); redraw(); updateSidebar(); checkErrors(); }
                });
            svg.selectAll('text.trlabel').data(transitions).enter().append('text')
                .attr('class','trlabel')
                .attr('x',d=>{
                    const a=states[d.from],b=states[d.to];
                    return (a.x+b.x)/2;
                })
                .attr('y',d=>{
                    const a=states[d.from],b=states[d.to];
                    return (a.y+b.y)/2-8;
                })
                .attr('text-anchor','middle')
                .attr('fill',d=>d.error?'#f00':'#333')
                .text(d=>`${d.read||'B'}/${d.write||'B'},${d.move||'R'}`)
                .on('click',function(e,d){
                    const read = prompt('Read symbol:',d.read||'');
                    const write = prompt('Write symbol:',d.write||'');
                    const move = prompt('Move (L/R):',d.move||'R');
                    if (read!==null) d.read=read;
                    if (write!==null) d.write=write;
                    if (move!==null) d.move=move;
                    if (read) tapeAlphabet.add(read);
                    if (write) tapeAlphabet.add(write);
                    pushUndo(); redraw(); updateSidebar(); checkErrors();
                });
            svg.selectAll('circle.state').data(states).enter().append('circle')
                .attr('class','state')
                .attr('cx',d=>d.x).attr('cy',d=>d.y).attr('r',28)
                .attr('fill',d=>acceptStates.has(d.id)?'#d1fae5':rejectStates.has(d.id)?'#fee2e2':'#e0e7ff')
                .attr('stroke',d=>d.id===startState?'#6366f1':'#888').attr('stroke-width',d=>d.id===startState?4:2)
                .on('click',function(e,d){
                    if (e.shiftKey) { if (acceptStates.has(d.id)) acceptStates.delete(d.id); else acceptStates.add(d.id); }
                    else if (e.altKey) { if (rejectStates.has(d.id)) rejectStates.delete(d.id); else rejectStates.add(d.id); }
                    else if (e.ctrlKey) { startState = d.id; }
                    else { const label = prompt('Edit state label:',d.label); if (label) d.label=label; }
                    pushUndo(); redraw(); updateSidebar(); checkErrors();
                })
                .call(d3.drag()
                    .on('start',function(e,d){d.fx=d.x;d.fy=d.y;})
                    .on('drag',function(e,d){d.x=e.x;d.y=e.y;redraw();})
                    .on('end',function(e,d){d.fx=null;d.fy=null;pushUndo(); updateSidebar(); checkErrors(); })
                );
            svg.selectAll('text.stlabel').data(states).enter().append('text')
                .attr('class','stlabel')
                .attr('x',d=>d.x).attr('y',d=>d.y+6)
                .attr('text-anchor','middle').attr('font-size',18).attr('font-weight','bold')
                .attr('fill','#333').text(d=>d.label);
            if (dragLine) svg.append('line').attr('x1',dragLine[0]).attr('y1',dragLine[1]).attr('x2',dragLine[2]).attr('y2',dragLine[3]).attr('stroke','#6366f1').attr('stroke-width',3).attr('stroke-dasharray','4,2');
            svg.append('defs').append('marker').attr('id','arrow').attr('viewBox','0 -5 10 10').attr('refX',24).attr('refY',0).attr('markerWidth',8).attr('markerHeight',8).attr('orient','auto')
                .append('path').attr('d','M0,-5L10,0L0,5').attr('fill','#888');
        }
        function layoutStates() {
            const cx=350,cy=180,r=140,n=states.length;
            for (let i=0;i<n;++i) {
                states[i].x=cx+r*Math.cos(2*Math.PI*i/n-Math.PI/2);
                states[i].y=cy+r*Math.sin(2*Math.PI*i/n-Math.PI/2);
            }
        }
        layoutStates();
        redraw();
        // --- Toolbar ---
        const toolbar = document.getElementById('tm-graph-editor-toolbar');
        toolbar.innerHTML = `<button class='btn btn-outline-primary btn-sm' id='addStateBtn'>Add State</button> <button class='btn btn-outline-danger btn-sm' id='delStateBtn'>Delete State</button> <button class='btn btn-outline-info btn-sm' id='addTransBtn'>Add Transition</button> <button class='btn btn-outline-secondary btn-sm' id='undoBtn'>Undo</button> <button class='btn btn-outline-secondary btn-sm' id='redoBtn'>Redo</button>`;
        document.getElementById('addStateBtn').onclick = function() { const label = prompt('State label?','q'+states.length); if (!label) return; pushUndo(); states.push({id:states.length,label}); layoutStates(); redraw(); updateSidebar(); checkErrors(); };
        document.getElementById('delStateBtn').onclick = function() { const idx = prompt('State index to delete (0-based)?'); const i = parseInt(idx,10); if (isNaN(i)||i<0||i>=states.length) return; pushUndo(); states.splice(i,1); transitions = transitions.filter(t=>t.from!==i&&t.to!==i); acceptStates.delete(i); rejectStates.delete(i); if (startState===i) startState=null; layoutStates(); redraw(); updateSidebar(); checkErrors(); };
        document.getElementById('addTransBtn').onclick = function() { dragFrom = null; svg.on('mousedown',function(e){ const [mx,my]=d3.pointer(e); for (const s of states) { if (Math.hypot(mx-s.x,my-s.y)<28) { dragFrom=s; dragLine=[s.x,s.y,mx,my]; break; } } }); svg.on('mousemove',function(e){ if (!dragFrom) return; const [mx,my]=d3.pointer(e); dragLine=[dragFrom.x,dragFrom.y,mx,my]; redraw(); }); svg.on('mouseup',function(e){ if (!dragFrom) return; const [mx,my]=d3.pointer(e); for (const s of states) { if (Math.hypot(mx-s.x,my-s.y)<28) { const read = prompt('Read symbol?'); const write = prompt('Write symbol?'); const move = prompt('Move (L/R)?','R'); if (read!==null&&write!==null&&move!==null) { pushUndo(); transitions.push({from:dragFrom.id,to:s.id,read,write,move}); if (read) tapeAlphabet.add(read); if (write) tapeAlphabet.add(write); } break; } } dragFrom=null;dragLine=null; svg.on('mousedown',null).on('mousemove',null).on('mouseup',null); redraw(); updateSidebar(); checkErrors(); }); };
        document.getElementById('undoBtn').onclick = popUndo;
        document.getElementById('redoBtn').onclick = popRedo;
        layoutStates(); redraw(); updateSidebar(); checkErrors();
        function updateSidebar() {
            const sidebar = document.getElementById('tm-graph-editor-sidebar');
            sidebar.innerHTML = `<b>Tape Alphabet:</b> ${Array.from(tapeAlphabet).join(', ')}<br><b>Transitions:</b><ul>` + transitions.map(t=>`<li>${states[t.from]?.label} -- [${t.read||'B'}/${t.write||'B'},${t.move||'R'}] --> ${states[t.to]?.label}</li>`).join('') + '</ul>';
        }
        function checkErrors() {
            let errors = [];
            const reachable = new Set();
            if (startState != null) { const stack = [startState]; while (stack.length) { const s = stack.pop(); if (reachable.has(s)) continue; reachable.add(s); for (const t of transitions) if (t.from === s) stack.push(t.to); } }
            for (const s of states) if (!reachable.has(s.id)) errors.push(`State '${s.label}' is unreachable.`);
            if (startState == null) errors.push('No start state set.');
            if (!acceptStates.size) errors.push('No accept state set.');
            if (!rejectStates.size) errors.push('No reject state set.');
            for (const t of transitions) {
                if (t.read && !tapeAlphabet.has(t.read)) errors.push(`Transition uses undefined read symbol '${t.read}'.`);
                if (t.write && !tapeAlphabet.has(t.write)) errors.push(`Transition uses undefined write symbol '${t.write}'.`);
                if (t.move && !['L','R'].includes(t.move)) errors.push(`Transition uses illegal move '${t.move}'.`);
            }
            const seen = new Set();
            for (const t of transitions) { const key = `${t.from},${t.read}`; if (seen.has(key)) errors.push(`Duplicate transition from '${states[t.from]?.label}' on [${t.read}].`); else seen.add(key); }
            const panel = document.getElementById('tm-graph-editor-errors');
            panel.innerHTML = errors.length ? `<div class='alert alert-danger'>${errors.map(e=>`<div>${e}</div>`).join('')}</div>` : '';
            for (const t of transitions) t.error = false;
            for (const e of errors) for (const t of transitions) if (e.includes(states[t.from]?.label) && e.includes(states[t.to]?.label)) t.error = true;
        }
    }

    // Add ARIA roles and aria-live to dynamic containers
    if (editorSection) editorSection.setAttribute('role','region');
    const errorPanel = document.getElementById('automata-error-panel');
    if (errorPanel) { errorPanel.setAttribute('role','alert'); errorPanel.setAttribute('aria-live','assertive'); }
    const resultPanel = document.getElementById('automata-output');
    if (resultPanel) { resultPanel.setAttribute('role','status'); resultPanel.setAttribute('aria-live','polite'); }
    const visPanel = document.getElementById('automata-visualization');
    if (visPanel) visPanel.setAttribute('role','region');
    const sidebar = document.getElementById('automata-sidebar');
    if (sidebar) sidebar.setAttribute('role','complementary');
    // Add tooltips and ARIA labels to all major buttons
    ['importAutomatonBtn','exportAutomatonBtn','minimizeDfaBtn','equivalenceBtn','operationsBtn','graphicalEditorBtn','runBatchTestBtn','regexToNfaBtn','regexToDfaBtn','step-reset-button','step-back-button','step-forward-button','fabAutomata'].forEach(id=>{
        const btn=document.getElementById(id);if(btn){btn.setAttribute('tabindex','0');if(!btn.title)btn.title=btn.getAttribute('aria-label')||btn.textContent;}});
    // Make FAB accessible
    const fab=document.getElementById('fabAutomata');
    if(fab){fab.setAttribute('role','button');fab.setAttribute('tabindex','0');fab.setAttribute('aria-label','Quick Actions');fab.onkeydown=function(e){if(e.key==='Enter'||e.key===' '){fab.click();}};}
    // Sidebar collapse/expand accessibility
    const toggleBtn=document.getElementById('toggleSidebarBtn');
    if(toggleBtn){toggleBtn.setAttribute('tabindex','0');toggleBtn.setAttribute('role','button');toggleBtn.setAttribute('aria-label','Collapse sidebar');toggleBtn.onkeydown=function(e){if(e.key==='Enter'||e.key===' '){toggleBtn.click();}};}
    // Visually distinct error/result panels
    function showError(msg){const p=document.getElementById('automata-error-panel');if(p){p.classList.remove('visually-hidden');p.classList.add('alert','alert-danger');p.innerHTML=msg;setTimeout(()=>p.classList.add('visually-hidden'),5000);}}
    function showResult(msg){const p=document.getElementById('automata-batch-test-result');if(p){p.classList.remove('visually-hidden');p.classList.add('alert','alert-success');p.innerHTML=msg;setTimeout(()=>p.classList.add('visually-hidden'),5000);}}
    // Ensure all controls are keyboard accessible
    Array.from(document.querySelectorAll('button,input,textarea,select')).forEach(el=>{if(!el.hasAttribute('tabindex'))el.setAttribute('tabindex','0');});
});
