class AutomatonSimulation {
    constructor(automaton, type) {
        this.automaton = automaton;
        this.type = type;
        this.inputString = '';
        this.state = null;
        this.currentStates = [];
        this.accepted = false;
    }

    async initialize(inputString) {
        this.inputString = inputString;
        await this._sendSimulationRequest('reset');
    }

    async stepForward() {
        return await this._sendSimulationRequest('forward');
    }

    async stepBack() {
        return await this._sendSimulationRequest('back');
    }

    async reset() {
        return await this._sendSimulationRequest('reset');
    }

    async _sendSimulationRequest(action) {
        try {
            const response = await fetch('/api/simulate_step', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: this.type,
                    automaton: this.automaton,
                    input_string: this.inputString,
                    action: action,
                    state: this.state
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Simulation request failed');
            }

            const data = await response.json();
            this.state = data.state;
            this.currentStates = data.current_states;
            this.accepted = data.accepted;
            return data;
        } catch (error) {
            console.error('Simulation error:', error);
            throw error;
        }
    }
}

export function initializeSimulation(automaton, type, inputString) {
    const simulator = new AutomatonSimulation(automaton, type);
    const stepResetBtn = document.getElementById('step-reset-button');
    const stepBackBtn = document.getElementById('step-back-button');
    const stepForwardBtn = document.getElementById('step-forward-button');
    const stepStatusDiv = document.getElementById('step-status');

    async function updateSimulationUI(data) {
        const { position, current_states, finished, accepted, trace } = data.state;
        
        let statusHTML = `
            <p>Position: ${position} / ${inputString.length}</p>
            <p>Current states: {${current_states.join(', ')}}</p>
            <p>Status: ${finished ? (accepted ? 'ACCEPTED' : 'REJECTED') : 'Processing...'}</p>
        `;
        stepStatusDiv.innerHTML = statusHTML;

        
        if (type === 'dfa') {
            visualizeDFA(automaton, current_states);
        } else {
            visualizeNFA(automaton, current_states);
        }

        
        stepBackBtn.disabled = position === 0;
        stepForwardBtn.disabled = finished;
    }

    
    simulator.initialize(inputString)
        .then(updateSimulationUI)
        .catch(error => {
            DMC.showError('Error initializing simulation: ' + error.message);
        });

    
    stepResetBtn.addEventListener('click', () => {
        simulator.reset()
            .then(updateSimulationUI)
            .catch(error => {
                DMC.showError('Error resetting simulation: ' + error.message);
            });
    });

    stepBackBtn.addEventListener('click', () => {
        simulator.stepBack()
            .then(updateSimulationUI)
            .catch(error => {
                DMC.showError('Error stepping back: ' + error.message);
            });
    });

    stepForwardBtn.addEventListener('click', () => {
        simulator.stepForward()
            .then(updateSimulationUI)
            .catch(error => {
                DMC.showError('Error stepping forward: ' + error.message);
            });
    });

    return simulator;
}