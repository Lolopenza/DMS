document.addEventListener('DOMContentLoaded', function() {
    initializeProbabilityUI();
    setupProbabilityEventListeners();
    // --- Basic Probability ---
    const calcType = document.getElementById('calculation');
    const simpleInputs = document.getElementById('simpleInputs');
    const conditionalInputs = document.getElementById('conditionalInputs');
    const bayesInputs = document.getElementById('bayesInputs');
    const jointInputs = document.getElementById('jointInputs');
    const calcBtn = document.getElementById('calculateBtn');
    const resultDiv = document.getElementById('result');
    const resultValue = document.getElementById('resultValue');
    const stepByStepDiv = document.getElementById('stepByStep');
    const probError = document.getElementById('probabilityError');

    if (localStorage.getItem('dmc_sendto_probability')) {
        const val = localStorage.getItem('dmc_sendto_probability');
        const setInput = document.getElementById('probabilitySetInput') || document.querySelector('input[name="setA"]');
        if (setInput) setInput.value = val;
        localStorage.removeItem('dmc_sendto_probability');
    }

    function showSection(type) {
        simpleInputs.style.display = type === 'simple' ? 'block' : 'none';
        conditionalInputs.style.display = type === 'conditional' ? 'block' : 'none';
        bayesInputs.style.display = type === 'bayes' ? 'block' : 'none';
        jointInputs.style.display = type === 'joint' ? 'block' : 'none';
    }
    if (calcType) {
        calcType.addEventListener('change', function() {
            showSection(this.value);
        });
        showSection(calcType.value);
    }
    if (calcBtn) {
        calcBtn.onclick = async function() {
            probError.style.display = 'none';
            resultDiv.style.display = 'none';
            stepByStepDiv.innerHTML = '';
            try {
                let payload = {}, endpoint = '/api/probability', op = calcType.value;
                let data = null;
                if (op === 'simple') {
                    const favorable = parseInt(document.getElementById('favorable').value);
                    const total = parseInt(document.getElementById('total').value);
                    if (isNaN(favorable) || isNaN(total) || total <= 0 || favorable < 0 || favorable > total) throw new Error('Check input values.');
                    payload = { operation: 'simple', favorable, total };
                } else if (op === 'conditional') {
                    const joint = parseFloat(document.getElementById('jointProb').value);
                    const condition = parseFloat(document.getElementById('conditionProb').value);
                    if (isNaN(joint) || isNaN(condition) || condition <= 0 || joint < 0 || joint > condition) throw new Error('Check input values.');
                    payload = { operation: 'conditional', joint, condition };
                } else if (op === 'bayes') {
                    const prior = parseFloat(document.getElementById('priorProb').value);
                    const true_pos = parseFloat(document.getElementById('truePositiveProb').value);
                    const false_pos = parseFloat(document.getElementById('falsePositiveProb').value);
                    if ([prior, true_pos, false_pos].some(x => isNaN(x) || x < 0 || x > 1)) throw new Error('Check input values.');
                    payload = { operation: 'bayes', prior, true_pos, false_pos };
                } else if (op === 'joint') {
                    const probs = document.getElementById('jointProbs').value.split(',').map(x=>parseFloat(x.trim())).filter(x=>!isNaN(x));
                    if (!probs.length || probs.some(x=>x<0||x>1)) throw new Error('Enter valid probabilities.');
                    endpoint = '/api/probability/joint';
                    payload = { probs };
                }
                const resp = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                data = await resp.json();
                if (!resp.ok || data.error) throw new Error(data.error || 'Server error');
                resultValue.innerHTML = `<b>${data.result}</b>`;
                if (data.steps) stepByStepDiv.innerHTML = `<details open><summary>Step-by-step</summary><div>${data.steps}</div></details>`;
                resultDiv.style.display = 'block';
                if (window.MathJax) MathJax.typesetPromise([resultValue, stepByStepDiv]);
            } catch (e) {
                probError.textContent = e.message;
                probError.style.display = 'block';
            }
        };
    }

    // --- Discrete Distributions ---
    const distType = document.getElementById('distributionType');
    const distOp = document.getElementById('distributionOperation');
    const distBtn = document.getElementById('calculateDistBtn');
    const distResult = document.getElementById('distributionResult');
    const distProps = document.getElementById('distributionProperties');
    const distChart = document.getElementById('distributionChart');
    const distError = document.getElementById('distributionError');
    const simInputs = document.getElementById('simulationInputs');
    function showDistInputs(type) {
        ['binomial','poisson','geometric','hypergeometric','negativeBinomial','custom'].forEach(t=>{
            const el = document.getElementById(t+"Inputs");
            if (el) el.style.display = (type === t || (type==='negative_binomial'&&t==='negativeBinomial')) ? 'block' : 'none';
        });
    }
    if (distType) {
        distType.addEventListener('change', function() {
            showDistInputs(this.value);
        });
        showDistInputs(distType.value);
    }
    if (distOp) {
        distOp.addEventListener('change', function() {
            simInputs.style.display = this.value === 'simulate' ? 'block' : 'none';
        });
        simInputs.style.display = distOp.value === 'simulate' ? 'block' : 'none';
    }
    if (distBtn) {
        distBtn.onclick = async function() {
            distError.style.display = 'none';
            distResult.style.display = 'none';
            distProps.style.display = 'none';
            distChart.style.display = 'none';
            try {
                let type = distType.value, op = distOp.value, payload = {}, endpoint = '/api/probability', params = {}, k, trials;
                let data = null;
                let expectedValue = null;
                let variance = null;
                if (type === 'binomial') {
                    params.n = parseInt(document.getElementById('binomialN').value);
                    params.p = parseFloat(document.getElementById('binomialP').value);
                    k = parseInt(document.getElementById('binomialK').value);
                    if (isNaN(params.n) || params.n <= 0 || !Number.isInteger(params.n)) throw new Error("Number of trials (n) must be a positive integer.");
                    if (isNaN(params.p) || params.p < 0 || params.p > 1) throw new Error("Probability of success (p) must be between 0 and 1.");
                    if (isNaN(k) || k < 0 || k > params.n || !Number.isInteger(k)) throw new Error(`Number of successes (k) must be an integer between 0 and n (${params.n}).`);
                    payload = { operation: 'binomial_pmf', n: params.n, p: params.p, k };
                    endpoint = '/api/probability';
                    for (let k = 0; k <= params.n && k < MAX_CHART_POINTS; k++) {
                        const resp = await fetch('/api/probability', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ operation: 'binomial_pmf', n: params.n, p: params.p, k })
                        });
                        const d = await resp.json();
                        chartLabels.push(k.toString());
                        chartValues.push(d.result);
                    }
                    const resp = await fetch('/api/probability', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ operation: 'binomial_pmf', n: params.n, p: params.p, k })
                    });
                    data = await resp.json();
                    expectedValue = calculateBinomialMean(params.n, params.p);
                    variance = calculateBinomialVariance(params.n, params.p);
                } else if (type === 'poisson') {
                    params.lambda = parseFloat(document.getElementById('poissonLambda').value);
                    k = parseInt(document.getElementById('poissonK').value);
                    if (isNaN(params.lambda) || params.lambda <= 0) throw new Error("Average rate (λ) must be a positive number.");
                    if (isNaN(k) || k < 0 || !Number.isInteger(k)) throw new Error("Number of events (k) must be a non-negative integer.");
                    payload = { operation: 'poisson_pmf', lambda: params.lambda, k };
                    endpoint = '/api/probability';
                    let k = 0, cumulativeProb = 0;
                    while (k < MAX_CHART_POINTS && cumulativeProb < 0.9999) {
                        const resp = await fetch('/api/probability', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ operation: 'poisson_pmf', lambda: params.lambda, k })
                        });
                        const d = await resp.json();
                        chartLabels.push(k.toString());
                        chartValues.push(d.result);
                        cumulativeProb += d.result;
                        k++;
                    }
                    const resp = await fetch('/api/probability', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ operation: 'poisson_pmf', lambda: params.lambda, k })
                    });
                    data = await resp.json();
                    expectedValue = calculatePoissonMean(params.lambda);
                    variance = calculatePoissonVariance(params.lambda);
                } else if (type === 'geometric') {
                    params.p = parseFloat(document.getElementById('geometricP').value);
                    k = parseInt(document.getElementById('geometricK').value);
                    if (isNaN(params.p) || params.p <= 0 || params.p > 1) throw new Error("Probability of success (p) must be between 0 (exclusive) and 1.");
                    if (isNaN(k) || k <= 0 || !Number.isInteger(k)) throw new Error("Number of trials (k) must be a positive integer.");
                    payload = { operation: 'geometric_pmf', p: params.p, k };
                    endpoint = '/api/probability';
                    let k = 1, cumulativeProb = 0;
                    while (k <= MAX_CHART_POINTS && cumulativeProb < 0.9999) {
                        const resp = await fetch('/api/probability', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ operation: 'geometric_pmf', p: params.p, k })
                        });
                        const d = await resp.json();
                        chartLabels.push(k.toString());
                        chartValues.push(d.result);
                        cumulativeProb += d.result;
                        k++;
                    }
                    const resp = await fetch('/api/probability', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ operation: 'geometric_pmf', p: params.p, k })
                    });
                    data = await resp.json();
                    expectedValue = calculateGeometricMean(params.p);
                    variance = calculateGeometricVariance(params.p);
                } else if (type === 'hypergeometric') {
                    params.M = parseInt(document.getElementById('hyperM').value);
                    params.n = parseInt(document.getElementById('hyperN').value);
                    params.N = parseInt(document.getElementById('hyperDraws').value);
                    k = parseInt(document.getElementById('hyperK').value);
                    if (isNaN(params.M) || params.M <= 0 || !Number.isInteger(params.M)) throw new Error("Population size (M) must be a positive integer.");
                    if (isNaN(params.n) || params.n <= 0 || !Number.isInteger(params.n)) throw new Error("Sample size (n) must be a positive integer.");
                    if (isNaN(params.N) || params.N <= 0 || !Number.isInteger(params.N)) throw new Error("Number of draws (N) must be a positive integer.");
                    if (isNaN(k) || k < 0 || k > params.n || k > params.M || k > params.N) throw new Error(`Number of successes (k) must be an integer between 0 and n (${params.n}) or between 0 and M (${params.M}) or between 0 and N (${params.N}).`);
                    payload = { M: params.M, n: params.n, N: params.N, k };
                    endpoint = '/api/probability/hypergeometric';
                } else if (type === 'negative_binomial') {
                    params.n = parseInt(document.getElementById('negBinomN').value);
                    params.p = parseFloat(document.getElementById('negBinomP').value);
                    k = parseInt(document.getElementById('negBinomK').value);
                    if (isNaN(params.n) || params.n <= 0 || !Number.isInteger(params.n)) throw new Error("Number of trials (n) must be a positive integer.");
                    if (isNaN(params.p) || params.p < 0 || params.p > 1) throw new Error("Probability of success (p) must be between 0 and 1.");
                    if (isNaN(k) || k < 0 || k > params.n || !Number.isInteger(k)) throw new Error(`Number of successes (k) must be an integer between 0 and n (${params.n}).`);
                    payload = { n: params.n, p: params.p, k };
                    endpoint = '/api/probability/negative_binomial';
                } else if (type === 'custom') {
                    params.values = document.getElementById('customValues').value.split(',').map(x=>parseFloat(x.trim()));
                    params.probs = document.getElementById('customProbs').value.split(',').map(x=>parseFloat(x.trim()));
                    if (params.values.length !== params.probs.length || params.probs.some(x=>isNaN(x)||x<0||x>1) || Math.abs(params.probs.reduce((a,b)=>a+b,0)-1)>1e-6) throw new Error('Custom PMF: values/probs mismatch or invalid.');
                }
                if (op === 'pmf') {
                    if (type === 'binomial') { payload = { operation: 'binomial_pmf', n: params.n, p: params.p, k }; endpoint = '/api/probability'; }
                    else if (type === 'poisson') { payload = { operation: 'poisson_pmf', lambda: params.lambda, k }; endpoint = '/api/probability'; }
                    else if (type === 'geometric') { payload = { operation: 'geometric_pmf', p: params.p, k }; endpoint = '/api/probability'; }
                    else if (type === 'hypergeometric') { payload = { M: params.M, n: params.n, N: params.N, k }; endpoint = '/api/probability/hypergeometric'; }
                    else if (type === 'negative_binomial') { payload = { n: params.n, p: params.p, k }; endpoint = '/api/probability/negative_binomial'; }
                    else if (type === 'custom') { payload = { values: params.values, probs: params.probs }; endpoint = '/api/probability/custom_pmf'; }
                } else if (op === 'cdf') {
                    endpoint = '/api/probability/cdf';
                    payload = { distribution: type, params, k };
                } else if (op === 'simulate') {
                    endpoint = '/api/probability/simulate';
                    payload = { distribution: type, params, trials: parseInt(document.getElementById('simTrials').value) };
                }
                const resp = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                data = await resp.json();
                if (!resp.ok || data.error) throw new Error(data.error || 'Server error');
                if (op === 'simulate' && data.image) {
                    distChart.innerHTML = `<img src="data:image/png;base64,${data.image}" style="max-width:100%">`;
                    distChart.style.display = 'block';
                } else if (data.pmf) {
                    distResult.innerHTML = `<b>PMF:</b> ${JSON.stringify(data.pmf)}<br>Mean: ${data.mean}, Variance: ${data.variance}`;
                    distResult.style.display = 'block';
                } else if (data.result !== undefined) {
                    distResult.innerHTML = `<b>Result:</b> ${data.result}`;
                    distResult.style.display = 'block';
                }
                if (data.steps) {
                    distProps.innerHTML = `<details open><summary>Step-by-step</summary><div>${data.steps}</div></details>`;
                    distProps.style.display = 'block';
                }
                if (window.MathJax) MathJax.typesetPromise([distResult, distProps, distChart]);
            } catch (e) {
                distError.textContent = e.message;
                distError.style.display = 'block';
            }
        };
    }

    // --- Venn Diagram ---
    const vennBtn = document.getElementById('drawVennBtn');
    const vennDiagram = document.getElementById('vennDiagram');
    const vennError = document.getElementById('vennError');
    if (vennBtn) {
        vennBtn.onclick = async function() {
            vennError.style.display = 'none';
            vennDiagram.style.display = 'none';
            try {
                const sets = {};
                const a = document.getElementById('setA').value.split(',').map(x=>x.trim()).filter(x=>x.length);
                const b = document.getElementById('setB').value.split(',').map(x=>x.trim()).filter(x=>x.length);
                const c = document.getElementById('setC').value.split(',').map(x=>x.trim()).filter(x=>x.length);
                if (a.length) sets['A'] = a;
                if (b.length) sets['B'] = b;
                if (c.length) sets['C'] = c;
                if (Object.keys(sets).length < 2) throw new Error('Enter at least two sets.');
                const resp = await fetch('/api/probability/venn', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sets }) });
                const data = await resp.json();
                if (!resp.ok || data.error) throw new Error(data.error || 'Server error');
                vennDiagram.innerHTML = `<img src="data:image/png;base64,${data.image}" style="max-width:100%">`;
                vennDiagram.style.display = 'block';
            } catch (e) {
                vennError.textContent = e.message;
                vennError.style.display = 'block';
            }
        };
    }
});

function initializeProbabilityUI() {
    const resultContainer = document.getElementById('probabilityResultContainer');
    if (resultContainer) {
        resultContainer.innerHTML = '';
        resultContainer.style.display = 'none';
    }

    const errorContainer = document.getElementById('probabilityErrorContainer');
    if (errorContainer) {
        errorContainer.innerHTML = '';
        errorContainer.style.display = 'none';
    }

    const someOtherElement = document.getElementById('someElementOnProbabilityPageToStyle');
    if (someOtherElement) {
        someOtherElement.style.color = 'blue';
    }
}

function setupProbabilityEventListeners() {
    const calculateButton = document.getElementById('calculateProbButton');
    if (calculateButton) {
        calculateButton.addEventListener('click', function() {
            handleProbabilityCalculation();
        });
    }
}

function handleProbabilityCalculation() {
    const eventAInputElement = document.getElementById('eventAInput');
    const sampleSpaceInputElement = document.getElementById('sampleSpaceInput');
    const resultContainer = document.getElementById('probabilityResultContainer'); // Assuming this is your 'result' element
    const errorContainer = document.getElementById('probabilityErrorContainer');

    if (errorContainer){
        errorContainer.innerHTML = '';
        errorContainer.style.display = 'none';
    }
    if (resultContainer){
        resultContainer.innerHTML = '';
        resultContainer.style.display = 'none';
    }

    if (!eventAInputElement || !sampleSpaceInputElement) {
        const msg = 'Input elements (eventAInput or sampleSpaceInput) not found. Please check HTML IDs.';
        if (DMC && DMC.showError) {
            DMC.showError(msg);
        } else if(errorContainer) {
            errorContainer.textContent = msg;
            errorContainer.style.display = 'block';
        }
        return;
    }

    const eventA = eventAInputElement.value;
    const sampleSpace = sampleSpaceInputElement.value;

    try {
        // ====================================================================
        // CRITICAL: Review ALL code within this 'try' block very carefully.
        // Look for:
        //   - Unmatched parentheses: ( )
        //   - Unmatched braces: { } (e.g., in if statements, loops, objects)
        //   - Unmatched brackets: [ ]
        //   - Unterminated strings: '...' or "..."
        //   - Unterminated template literals: `...`
        //   - Any other syntax errors.
        //
        // Example structure (your actual logic will be here):
        if (eventA.trim() === '' || sampleSpace.trim() === '') {
            throw new Error('Event A and Sample Space inputs cannot be empty.');
        }

        const eventASize = parseFloat(eventA);
        const sampleSpaceSize = parseFloat(sampleSpace);

        if (isNaN(eventASize) || isNaN(sampleSpaceSize)) {
            throw new Error('Inputs must be numeric.');
        }
        if (sampleSpaceSize <= 0) {
            throw new Error('Sample space size must be positive.');
        }
        if (eventASize < 0 || eventASize > sampleSpaceSize) {
            throw new Error('Event size must be between 0 and sample space size.');
        }

        const probability = eventASize / sampleSpaceSize;

        if (resultContainer) {
            resultContainer.innerHTML = `<p>P(A) = ${eventASize} / ${sampleSpaceSize} = ${probability.toFixed(4)}</p>`;
            resultContainer.style.display = 'block';
        } else if (DMC && DMC.showSuccess) { // Fallback if resultContainer is not the primary display
            DMC.showSuccess(`Probability P(A) = ${probability.toFixed(4)}`);
        }
        // Ensure all statements here are correctly terminated and all blocks are closed.
        // ====================================================================

    } catch (error) { // This is line 103 in your file, or the line just after the 'try' block's '}'
        if (DMC && DMC.showError) {
            DMC.showError(error.message);
        } else if (errorContainer) { // Fallback error display
            errorContainer.textContent = error.message;
            errorContainer.style.display = 'block';
        }
        // Hide results and visualizations on error, as per your snippet
        if (resultContainer) { // Assuming 'result' ID from your snippet is 'probabilityResultContainer'
            resultContainer.style.display = 'none';
        }
        const vizDiv = document.getElementById('probabilityVisualization');
        if (vizDiv) {
            vizDiv.style.display = 'none';
        }
    }
}

//                if (!response.ok) throw new Error(data.error || 'Server error');
//                 resultValue.innerHTML = `<strong>${formula}</strong>${data.result}`;
//                 document.getElementById('result').style.display = 'block';
//                 DMC.showSuccess(`${calculation} probability calculated successfully`);
//             } catch (error) {
//                 DMC.showError(error.message);
//                 document.getElementById('result').style.display = 'none';
//                 const vizDiv = document.getElementById('probabilityVisualization');
//                 if (vizDiv) vizDiv.style.display = 'none';
//             }
//         });
//     }
    
    // Local calculation functions (kept)
    function calculateSimpleProbability(favorable, total) {
        if (total <= 0) throw new Error("Total must be positive");
        if (favorable < 0) throw new Error("Favorable must be non-negative");
        if (favorable > total) throw new Error("Favorable cannot exceed total");
        return favorable / total;
    }
    
    function calculateConditionalProbability(jointProb, conditionProb) {
        if (conditionProb <= 0) throw new Error("Condition probability must be positive");
        if (jointProb < 0) throw new Error("Joint probability must be non-negative");
        if (jointProb > conditionProb) throw new Error("Joint probability cannot exceed condition probability");
        return jointProb / conditionProb;
    }
    
    function calculateBayesProbability(priorProb, truePosProb, falsePosProb) {
        const numerator = truePosProb * priorProb;
        const denominator = (truePosProb * priorProb) + (falsePosProb * (1 - priorProb));
        if (denominator === 0) throw new Error("Denominator cannot be zero");
        return numerator / denominator;
    }

    // --- Discrete Random Variables Logic ---

    const calculateDistBtn = document.getElementById('calculateDistBtn');
    const distributionTypeSelect = document.getElementById('distributionType');
    const binomialInputsDiv = document.getElementById('binomialInputs');
    const poissonInputsDiv = document.getElementById('poissonInputs');
    const geometricInputsDiv = document.getElementById('geometricInputs');
    const distributionResultDiv = document.getElementById('distributionResult');
    const distributionPropertiesDiv = document.getElementById('distributionProperties');
    const distributionChartDiv = document.getElementById('distributionChart');

    if (!calculateDistBtn || !distributionTypeSelect || !binomialInputsDiv || !geometricInputsDiv || !distributionResultDiv || !distributionPropertiesDiv || !distributionChartDiv) {
        console.warn("DOM elements for discrete probability section are missing. Skipping event listeners for this section.");
    } else {
        distributionTypeSelect.addEventListener('change', function() {
            const type = this.value;
            binomialInputsDiv.style.display = type === 'binomial' ? 'block' : 'none';
            poissonInputsDiv.style.display = type === 'poisson' ? 'block' : 'none';
            geometricInputsDiv.style.display = type === 'geometric' ? 'block' : 'none';
            if (distributionResultDiv) distributionResultDiv.style.display = 'none';
            if (distributionPropertiesDiv) distributionPropertiesDiv.style.display = 'none';
            if (distributionChartDiv) distributionChartDiv.style.display = 'none';
        });
        if (distributionTypeSelect.value === 'binomial' || distributionTypeSelect.value === 'poisson' || distributionTypeSelect.value === 'geometric') {
            distributionTypeSelect.dispatchEvent(new Event('change'));
        } else {
            binomialInputsDiv.style.display = 'none';
            poissonInputsDiv.style.display = 'none';
            geometricInputsDiv.style.display = 'none';
        }
        calculateDistBtn.addEventListener('click', async function() {
            const distError = document.getElementById('distributionError');
            const distResult = document.getElementById('distributionResult');
            const distProps = document.getElementById('distributionProperties');
            const distChart = document.getElementById('distributionChart');
            distError.style.display = 'none';
            distResult.style.display = 'none';
            distProps.style.display = 'none';
            distChart.style.display = 'none';
            try {
                let payload = {};
                let chartLabels = [];
                let chartValues = [];
                let chartTitle = '';
                let kValue = null;
                let MAX_CHART_POINTS = 30;
                let data = null;
                let expectedValue = null;
                let variance = null;
                if (type === 'binomial') {
                    const n = parseInt(document.getElementById('binomialN').value);
                    const p = parseFloat(document.getElementById('binomialP').value);
                    kValue = parseInt(document.getElementById('binomialK').value);
                    if (isNaN(n) || n <= 0 || !Number.isInteger(n)) throw new Error("Number of trials (n) must be a positive integer.");
                    if (isNaN(p) || p < 0 || p > 1) throw new Error("Probability of success (p) must be between 0 and 1.");
                    if (isNaN(kValue) || kValue < 0 || kValue > n || !Number.isInteger(kValue)) throw new Error(`Number of successes (k) must be an integer between 0 and n (${n}).`);
                    payload = { operation: 'binomial_pmf', n, p, k: kValue };
                    chartTitle = `Binomial Distribution (n=${n}, p=${p.toFixed(2)}) PMF`;
                    for (let k = 0; k <= n && k < MAX_CHART_POINTS; k++) {
                        const resp = await fetch('/api/probability', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ operation: 'binomial_pmf', n, p, k })
                        });
                        const d = await resp.json();
                        chartLabels.push(k.toString());
                        chartValues.push(d.result);
                    }
                    const resp = await fetch('/api/probability', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ operation: 'binomial_pmf', n, p, k: kValue })
                    });
                    data = await resp.json();
                    expectedValue = calculateBinomialMean(n, p);
                    variance = calculateBinomialVariance(n, p);
                } else if (type === 'poisson') {
                    const lambda = parseFloat(document.getElementById('poissonLambda').value);
                    kValue = parseInt(document.getElementById('poissonK').value);
                    if (isNaN(lambda) || lambda <= 0) throw new Error("Average rate (λ) must be a positive number.");
                    if (isNaN(kValue) || kValue < 0 || !Number.isInteger(kValue)) throw new Error("Number of events (k) must be a non-negative integer.");
                    payload = { operation: 'poisson_pmf', lambda, k: kValue };
                    chartTitle = `Poisson Distribution (λ=${lambda.toFixed(2)}) PMF`;
                    let k = 0, cumulativeProb = 0;
                    while (k < MAX_CHART_POINTS && cumulativeProb < 0.9999) {
                        const resp = await fetch('/api/probability', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ operation: 'poisson_pmf', lambda, k })
                        });
                        const d = await resp.json();
                        chartLabels.push(k.toString());
                        chartValues.push(d.result);
                        cumulativeProb += d.result;
                        k++;
                    }
                    const resp = await fetch('/api/probability', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ operation: 'poisson_pmf', lambda, k: kValue })
                    });
                    data = await resp.json();
                    expectedValue = calculatePoissonMean(lambda);
                    variance = calculatePoissonVariance(lambda);
                } else if (type === 'geometric') {
                    const p = parseFloat(document.getElementById('geometricP').value);
                    kValue = parseInt(document.getElementById('geometricK').value);
                    if (isNaN(p) || p <= 0 || p > 1) throw new Error("Probability of success (p) must be between 0 (exclusive) and 1.");
                    if (isNaN(kValue) || kValue <= 0 || !Number.isInteger(kValue)) throw new Error("Number of trials (k) must be a positive integer.");
                    payload = { operation: 'geometric_pmf', p, k: kValue };
                    chartTitle = `Geometric Distribution (p=${p.toFixed(2)}) PMF`;
                    let k = 1, cumulativeProb = 0;
                    while (k <= MAX_CHART_POINTS && cumulativeProb < 0.9999) {
                        const resp = await fetch('/api/probability', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ operation: 'geometric_pmf', p, k })
                        });
                        const d = await resp.json();
                        chartLabels.push(k.toString());
                        chartValues.push(d.result);
                        cumulativeProb += d.result;
                        k++;
                    }
                    const resp = await fetch('/api/probability', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ operation: 'geometric_pmf', p, k: kValue })
                    });
                    data = await resp.json();
                    expectedValue = calculateGeometricMean(p);
                    variance = calculateGeometricVariance(p);
                } else if (type === 'hypergeometric') {
                    const M = parseInt(document.getElementById('hyperM').value);
                    const n = parseInt(document.getElementById('hyperN').value);
                    const N = parseInt(document.getElementById('hyperDraws').value);
                    k = parseInt(document.getElementById('hyperK').value);
                    if (isNaN(M) || M <= 0 || !Number.isInteger(M)) throw new Error("Population size (M) must be a positive integer.");
                    if (isNaN(n) || n <= 0 || !Number.isInteger(n)) throw new Error("Sample size (n) must be a positive integer.");
                    if (isNaN(N) || N <= 0 || !Number.isInteger(N)) throw new Error("Number of draws (N) must be a positive integer.");
                    if (isNaN(k) || k < 0 || k > n || k > M || k > N) throw new Error(`Number of successes (k) must be an integer between 0 and n (${n}) or between 0 and M (${M}) or between 0 and N (${N}).`);
                    payload = { M, n, N, k };
                    endpoint = '/api/probability/hypergeometric';
                } else if (type === 'negative_binomial') {
                    const n = parseInt(document.getElementById('negBinomN').value);
                    const p = parseFloat(document.getElementById('negBinomP').value);
                    k = parseInt(document.getElementById('negBinomK').value);
                    if (isNaN(n) || n <= 0 || !Number.isInteger(n)) throw new Error("Number of trials (n) must be a positive integer.");
                    if (isNaN(p) || p < 0 || p > 1) throw new Error("Probability of success (p) must be between 0 and 1.");
                    if (isNaN(k) || k < 0 || k > n || !Number.isInteger(k)) throw new Error(`Number of successes (k) must be an integer between 0 and n (${n}).`);
                    payload = { n, p, k };
                    endpoint = '/api/probability/negative_binomial';
                } else if (type === 'custom') {
                    const values = document.getElementById('customValues').value.split(',').map(x=>parseFloat(x.trim()));
                    const probs = document.getElementById('customProbs').value.split(',').map(x=>parseFloat(x.trim()));
                    if (values.length !== probs.length || probs.some(x=>isNaN(x)||x<0||x>1) || Math.abs(probs.reduce((a,b)=>a+b,0)-1)>1e-6) throw new Error('Custom PMF: values/probs mismatch or invalid.');
                }
                if (op === 'pmf') {
                    if (type === 'binomial') { payload = { operation: 'binomial_pmf', n, p, k }; endpoint = '/api/probability'; }
                    else if (type === 'poisson') { payload = { operation: 'poisson_pmf', lambda: lambda, k }; endpoint = '/api/probability'; }
                    else if (type === 'geometric') { payload = { operation: 'geometric_pmf', p, k }; endpoint = '/api/probability'; }
                    else if (type === 'hypergeometric') { payload = { M, n, N, k }; endpoint = '/api/probability/hypergeometric'; }
                    else if (type === 'negative_binomial') { payload = { n, p, k }; endpoint = '/api/probability/negative_binomial'; }
                    else if (type === 'custom') { payload = { values, probs }; endpoint = '/api/probability/custom_pmf'; }
                } else if (op === 'cdf') {
                    endpoint = '/api/probability/cdf';
                    payload = { distribution: type, params, k };
                } else if (op === 'simulate') {
                    endpoint = '/api/probability/simulate';
                    payload = { distribution: type, params, trials: parseInt(document.getElementById('simTrials').value) };
                }
                const resp = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                data = await resp.json();
                if (!resp.ok || data.error) throw new Error(data.error || 'Server error');
                if (op === 'simulate' && data.image) {
                    distChart.innerHTML = `<img src="data:image/png;base64,${data.image}" style="max-width:100%">`;
                    distChart.style.display = 'block';
                } else if (data.pmf) {
                    distResult.innerHTML = `<b>PMF:</b> ${JSON.stringify(data.pmf)}<br>Mean: ${data.mean}, Variance: ${data.variance}`;
                    distResult.style.display = 'block';
                } else if (data.result !== undefined) {
                    distResult.innerHTML = `<b>Result:</b> ${data.result}`;
                    distResult.style.display = 'block';
                }
                if (data.steps) {
                    distProps.innerHTML = `<details open><summary>Step-by-step</summary><div>${data.steps}</div></details>`;
                    distProps.style.display = 'block';
                }
                if (window.MathJax) MathJax.typesetPromise([distResult, distProps, distChart]);
            } catch (e) {
                distError.textContent = e.message;
                distError.style.display = 'block';
            }
        });
    }

// --- Helper Functions for Discrete Distributions ---

// Factorial function (consider moving to helper.js if used elsewhere)
function factorial(num) {
    if (num < 0) return NaN; // Factorial is not defined for negative numbers
    if (num === 0) return 1;
    // Basic implementation (consider using helper.js version if available)
    let result = 1;
    for (let i = 2; i <= num; i++) {
        result *= i;
    }
    return result;
}

// Combinations function (nCk) (consider moving to helper.js)
function combinations(n, k) {
    if (k < 0 || k > n) {
        return 0;
    }
    if (k === 0 || k === n) {
        return 1;
    }
    // Optimization: C(n, k) == C(n, n-k)
    if (k > n / 2) {
        k = n - k;
    }
    // Calculate C(n, k) = n! / (k! * (n-k)!) efficiently
    // Basic implementation (consider using helper.js version if available)
    let res = 1;
    for (let i = 1; i <= k; ++i) {
        // Avoid large intermediate factorials if possible
        res = res * (n - i + 1) / i; 
    }
    // Rounding might be needed for larger numbers due to floating point issues
    return Math.round(res); 
}


// --- Binomial Distribution ---
function calculateBinomialPMF(n, p, k) {
    if (k < 0 || k > n) return 0; // PMF is 0 outside the valid range
    const Cnk = combinations(n, k);
    // Check for potential NaN/Infinity if p=0 or p=1 and exponents are 0
    const p_k = (p === 0 && k === 0) ? 1 : Math.pow(p, k);
    const q_nk = (p === 1 && n - k === 0) ? 1 : Math.pow(1 - p, n - k);
    return Cnk * p_k * q_nk;
}

function calculateBinomialMean(n, p) {
    return n * p;
}

function calculateBinomialVariance(n, p) {
    return n * p * (1 - p);
}

// --- Poisson Distribution ---
function calculatePoissonPMF(lambda, k) {
     if (k < 0 || !Number.isInteger(k)) return 0; // PMF is 0 for non-negative integers k
     // Use log gamma for potentially large factorials if needed, or handle large lambda carefully
     // Basic implementation:
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

function calculatePoissonMean(lambda) {
    return lambda;
}

function calculatePoissonVariance(lambda) {
    return lambda; // Mean and Variance are both lambda for Poisson
}

// --- Geometric Distribution ---
// Calculates P(X=k), probability of first success on the k-th trial
function calculateGeometricPMF(p, k) {
     if (k <= 0 || !Number.isInteger(k)) return 0; // Geometric distribution starts at k=1 (integer)
    return Math.pow(1 - p, k - 1) * p;
}

function calculateGeometricMean(p) {
    if (p <= 0) return Infinity; // Or NaN, depending on definition
    return 1 / p;
}

function calculateGeometricVariance(p) {
     if (p <= 0 || p > 1) return NaN; // Or Infinity
    return (1 - p) / Math.pow(p, 2);
}

// Note: Visualization for basic probability (simple) is handled within its own block earlier.

// Visualization functions
function visualizeSimpleProbability(container, favorable, total) {
    const width = 400;
    const height = 300;
    const margin = 40;
    
    // Create SVG
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    
    // Create pie chart
    const pie = d3.pie()
        .value(d => d.value)
        .sort(null);
    
    const data = [
        { label: 'Favorable', value: favorable },
        { label: 'Unfavorable', value: total - favorable }
    ];
    
    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(Math.min(width, height) / 2 - margin);
    
    const g = svg.append('g')
        .attr('transform', `translate(${width/2},${height/2})`);
    
    const path = g.selectAll('path')
        .data(pie(data))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', (d, i) => d3.schemeCategory10[i])
        .attr('stroke', 'white')
        .style('stroke-width', '2px');
    
    // Add labels
    g.selectAll('text')
        .data(pie(data))
        .enter()
        .append('text')
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .attr('dy', '.35em')
        .style('text-anchor', 'middle')
        .text(d => `${d.data.label}: ${d.data.value}`);
}

function visualizeConditionalProbability(container, jointProb, conditionProb, result) {
    const width = 400;
    const height = 300;
    const margin = 40;
    
    // Create SVG
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    
    // Create Venn diagram
    const circleA = svg.append('circle')
        .attr('cx', width/2 - 50)
        .attr('cy', height/2)
        .attr('r', 80)
        .attr('fill', 'rgba(255,0,0,0.3)')
        .attr('stroke', 'red');
    
    const circleB = svg.append('circle')
        .attr('cx', width/2 + 50)
        .attr('cy', height/2)
        .attr('r', 80)
        .attr('fill', 'rgba(0,0,255,0.3)')
        .attr('stroke', 'blue');
    
    // Add labels
    svg.append('text')
        .attr('x', width/2 - 50)
        .attr('y', height/2 - 100)
        .text('A')
        .style('text-anchor', 'middle');
    
    svg.append('text')
        .attr('x', width/2 + 50)
        .attr('y', height/2 - 100)
        .text('B')
        .style('text-anchor', 'middle');
    
    // Add probability values
    svg.append('text')
        .attr('x', width/2)
        .attr('y', height/2 + 120)
        .text(`P(A|B) = ${result.toFixed(4)}`)
        .style('text-anchor', 'middle');
}

function visualizeBayesTheorem(container, priorProb, truePositiveProb, falsePositiveProb, result) {
    const width = 400;
    const height = 300;
    const margin = 40;
    
    // Create SVG
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    
    // Create tree diagram
    const treeData = {
        name: 'Root',
        children: [
            {
                name: 'A',
                value: priorProb,
                children: [
                    { name: 'B|A', value: truePositiveProb },
                    { name: '¬B|A', value: 1 - truePositiveProb }
                ]
            },
            {
                name: '¬A',
                value: 1 - priorProb,
                children: [
                    { name: 'B|¬A', value: falsePositiveProb },
                    { name: '¬B|¬A', value: 1 - falsePositiveProb }
                ]
            }
        ]
    };
    
    const tree = d3.tree()
        .size([width - 2 * margin, height - 2 * margin]);
    
    const root = d3.hierarchy(treeData);
    tree(root);
    
    const g = svg.append('g')
        .attr('transform', `translate(${margin},${margin})`);
    
    // Add links
    g.selectAll('.link')
        .data(root.links())
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('d', d3.linkVertical()
            .x(d => d.x)
            .y(d => d.y))
        .attr('fill', 'none')
        .attr('stroke', '#ccc');
    
    // Add nodes
    const node = g.selectAll('.node')
        .data(root.descendants())
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.x},${d.y})`);
    
    node.append('circle')
        .attr('r', 5)
        .attr('fill', '#999');
    
    node.append('text')
        .attr('dy', '.31em')
        .attr('x', d => d.children ? -6 : 6)
        .attr('text-anchor', d => d.children ? 'end' : 'start')
        .text(d => `${d.data.name}: ${d.data.value.toFixed(2)}`);
    
    // Add result
    svg.append('text')
        .attr('x', width/2)
        .attr('y', height - margin)
        .text(`P(A|B) = ${result.toFixed(4)}`)
        .style('text-anchor', 'middle');
}

function validateProbabilityInputs(type, values) {
    if (type === 'simple') {
        if (values.favorable < 0 || values.total < 1) return 'Favorable must be >= 0 and total >= 1.';
    }
    if (type === 'conditional') {
        if (values.joint < 0 || values.joint > 1 || values.condition < 0.01 || values.condition > 1) return 'Probabilities must be between 0 and 1.';
    }
    if (type === 'bayes') {
        if (values.prior < 0 || values.prior > 1 || values.true_pos < 0 || values.true_pos > 1 || values.false_pos < 0 || values.false_pos > 1) return 'Probabilities must be between 0 and 1.';
    }
    return null;
}

document.getElementById('priorProb').setAttribute('title','Prior probability P(A), must be between 0 and 1.');
document.getElementById('truePositiveProb').setAttribute('title','P(B|A), must be between 0 and 1.');
document.getElementById('falsePositiveProb').setAttribute('title','P(B|¬A), must be between 0 and 1.');

function renderMathJaxIfPresent(container) {
    if (window.MathJax && container && container.innerHTML.match(/\\\(|\\\[|\$|\^|\dfrac|\frac|\sum|\prod|\int|\sqrt|\leq|\geq|\neq|\approx|\infty|\forall|\exists/)) {
        MathJax.typesetPromise([container]);
    }
}

function recordProbabilityHistory(operation, inputs, answer, formula) {
    window.DMC_ExplainHistory = window.DMC_ExplainHistory || [];
    window.DMC_ExplainHistory.push({
        topic: 'probability',
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
