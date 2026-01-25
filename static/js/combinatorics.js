document.addEventListener('DOMContentLoaded', function() {
    const calculateBtn = document.getElementById('calculateBtn');
    const resultValue = document.getElementById('resultValue');
    const operationSelect = document.getElementById('operation');
    const rGroup = document.getElementById('rGroup');
    
    if (!operationSelect || !resultValue) {
        console.error("Required DOM elements not found");
        return;
    }
    
    operationSelect.addEventListener('change', function() {
        if (rGroup) {
            rGroup.style.display = operationSelect.value === 'factorial' ? 'none' : 'block';
        }
    });
    
    if (calculateBtn) {
        calculateBtn.addEventListener('click', async function() {
            const operation = operationSelect.value;
            const nElement = document.getElementById('n');
            const rElement = document.getElementById('r');
            
            if (!nElement) {
                DMC.showError("Input element 'n' not found");
                return;
            }
            
            const nValue = nElement.value.trim();
            if (!nValue) {
                DMC.showError('n is required.');
                return;
            }
            
            const n = parseInt(nValue, 10);
            
            if (isNaN(n) || n < 0) {
                DMC.showError("n must be a non-negative integer");
                return;
            }
            
            let r = null;
            if (operation !== 'factorial') {
                if (!rElement) {
                    DMC.showError("Input element 'r' not found");
                    return;
                }
                
                const rValue = rElement.value.trim();
                if (!rValue) {
                    DMC.showError('r is required.');
                    return;
                }
                
                r = parseInt(rValue, 10);
                
                if (isNaN(r) || r < 0 || r > n) {
                    DMC.showError("r must be a non-negative integer with r ≤ n");
                    return;
                }
            }
            
            const error = validateCombinatoricsInputs(n, r, operation);
            if (error) {
                DMC.showError(error);
                return;
            }
            
            try {
                const payload = { operation, n };
                if (operation !== 'factorial') payload.r = r;
                const response = await fetchWithLoader('/api/combinatorics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Server error');
                let formula = '';
                if (operation === 'factorial') {
                    formula = `${n}! = `;
                } else if (operation === 'permutation') {
                    formula = `P(${n}, ${r}) = `;
                } else if (operation === 'combination') {
                    formula = `C(${n}, ${r}) = `;
                }
                resultValue.innerHTML = `<strong>${formula}</strong>${data.result}`;
                document.getElementById('result').style.display = 'block'; // Make result section visible
                DMC.showSuccess(`Calculated ${operation} successfully`);
                
                recordCombinatoricsHistory(operation, { n, r }, data.result, formula);
            } catch (error) {
                DMC.showError("Calculation error: " + error.message);
            }
        });
    }
    
    function localFactorial(n) {
        if (n < 0) return null;
        if (n > 170) return Infinity;  // JavaScript limit
        if (n <= 1) return 1;
        
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }
    
    function localCombinations(n, r) {
        if (r > n) return 0;
        if (r < 0 || n < 0) return 0;
        if (r === 0 || r === n) return 1;
        
        // Use formula C(n,r) = C(n,n-r) to minimize calculations
        if (r > n / 2) {
            r = n - r;
        }
        
        // Calculate C(n,r) = n! / (r! * (n-r)!)
        let result = 1;
        for (let i = 1; i <= r; i++) {
            result *= (n - (r - i));
            result /= i;
        }
        return Math.round(result);
    }
    
    function localPermutations(n, r) {
        if (r > n) return 0;
        if (r < 0 || n < 0) return 0;
        
        let result = 1;
        for (let i = 0; i < r; i++) {
            result *= (n - i);
        }
        return result;
    }
    
    const advancedOperationSelect = document.getElementById('advancedOperation');
    const calculateAdvancedBtn = document.getElementById('calculateAdvancedBtn');
    const advancedResultValue = document.getElementById('advancedResultValue');
    const advancedResultContainer = document.getElementById('advancedResult');
    const advancedExplanation = document.getElementById('advancedExplanation');

    // Input sections for advanced operations
    const pigeonholeInputs = document.getElementById('pigeonholeInputs');
    const catalanInputs = document.getElementById('catalanInputs');
    const stirlingInputs = document.getElementById('stirlingInputs');
    const binomialInputs = document.getElementById('binomialInputs');

    if (advancedOperationSelect && calculateAdvancedBtn) {
        advancedOperationSelect.addEventListener('change', function() {
            const operation = this.value;
            
            // Hide all input sections first
            [pigeonholeInputs, catalanInputs, stirlingInputs, binomialInputs].forEach(div => {
                if (div) div.style.display = 'none';
            });
            
            // Show relevant input section
            switch (operation) {
                case 'pigeonhole':
                    if (pigeonholeInputs) pigeonholeInputs.style.display = 'block';
                    break;
                case 'catalan':
                    if (catalanInputs) catalanInputs.style.display = 'block';
                    break;
                case 'stirling':
                    if (stirlingInputs) stirlingInputs.style.display = 'block';
                    break;
                case 'binomial':
                    if (binomialInputs) binomialInputs.style.display = 'block';
                    break;
            }
            
            // Hide results when changing operation
            if (advancedResultContainer) advancedResultContainer.style.display = 'none';
        });

        calculateAdvancedBtn.addEventListener('click', async function() {
            const operation = advancedOperationSelect.value;
            let payload = { operation };
            try {
                switch (operation) {
                    case 'pigeonhole':
                        payload.pigeons = parseInt(document.getElementById('pigeons').value);
                        payload.holes = parseInt(document.getElementById('holes').value);
                        break;
                    case 'catalan':
                        payload.n = parseInt(document.getElementById('catalanN').value);
                        break;
                    case 'stirling':
                        payload.n = parseInt(document.getElementById('stirlingN').value);
                        payload.k = parseInt(document.getElementById('stirlingK').value);
                        break;
                    case 'binomial':
                        payload.n = parseInt(document.getElementById('binomialN').value);
                        payload.k = parseInt(document.getElementById('binomialK').value);
                        break;
                }
                const response = await fetchWithLoader('/api/combinatorics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Server error');
                if (advancedResultValue) advancedResultValue.textContent = data.result;
                if (advancedExplanation) advancedExplanation.innerHTML = '';
                if (advancedResultContainer) advancedResultContainer.style.display = 'block';
                DMC.showSuccess(`${operation} calculation completed successfully`);
                
                let formula = '';
                switch (operation) {
                    case 'pigeonhole':
                        formula = `Pigeonhole Principle: ${payload.pigeons} pigeons in ${payload.holes} holes`;
                        break;
                    case 'catalan':
                        formula = `Catalan number C(${payload.n})`;
                        break;
                    case 'stirling':
                        formula = `Stirling number S(${payload.n}, ${payload.k})`;
                        break;
                    case 'binomial':
                        formula = `Binomial coefficient C(${payload.n}, ${payload.k})`;
                        break;
                }
                recordCombinatoricsHistory(operation, payload, data.result, formula);
            } catch (error) {
                DMC.showError(error.message);
                if (advancedResultContainer) advancedResultContainer.style.display = 'none';
            }
        });
    }

    // Advanced counting functions
    function calculatePigeonholePrinciple(objects, boxes) {
        return Math.ceil(objects / boxes);
    }

    function calculateCatalanNumber(n) {
        if (n === 0) return 1;
        let result = 1;
        for (let i = 1; i <= n; i++) {
            result = result * (4 * i - 2) / (i + 1);
        }
        return Math.round(result);
    }

    function calculateStirlingNumber(n, k) {
        if (n === 0 && k === 0) return 1;
        if (n === 0 || k === 0) return 0;
        if (k === 1 || k === n) return 1;
        if (k > n) return 0;
        
        return k * calculateStirlingNumber(n - 1, k) + calculateStirlingNumber(n - 1, k - 1);
    }

    function calculateBinomialCoefficient(n, k) {
        if (k > n) return 0;
        if (k === 0 || k === n) return 1;
        k = Math.min(k, n - k);
        let result = 1;
        for (let i = 0; i < k; i++) {
            result = result * (n - i) / (i + 1);
        }
        return Math.round(result);
    }

    // Explanation functions
    function getPigeonholeExplanation(objects, boxes, result) {
        return `
            <p>The Pigeonhole Principle states that if n objects are placed into m boxes, 
            where n > m, then at least one box must contain at least ⌈n/m⌉ objects.</p>
            <p>In this case:</p>
            <ul>
                <li>Number of objects: ${objects}</li>
                <li>Number of boxes: ${boxes}</li>
                <li>Minimum objects in a box: ${result}</li>
            </ul>
        `;
    }

    function getCatalanExplanation(n, result) {
        return `
            <p>The ${n}th Catalan number represents the number of ways to:</p>
            <ul>
                <li>Form valid parentheses expressions with ${n} pairs</li>
                <li>Create binary trees with ${n} nodes</li>
                <li>Triangulate a convex polygon with ${n + 2} sides</li>
            </ul>
            <p>Result: ${result}</p>
        `;
    }

    function getStirlingExplanation(n, k, result) {
        return `
            <p>Stirling numbers of the second kind S(${n},${k}) represent the number of ways to partition 
            a set of ${n} elements into ${k} non-empty subsets.</p>
            <p>Result: ${result}</p>
        `;
    }

    function getBinomialExplanation(n, k, result) {
        return `
            <p>The binomial coefficient C(${n},${k}) represents:</p>
            <ul>
                <li>The number of ways to choose ${k} items from a set of ${n} items</li>
                <li>The coefficient of x^k in the expansion of (1 + x)^${n}</li>
            </ul>
            <p>Result: ${result}</p>
        `;
    }

    function validateCombinatoricsInputs(n, r, operation) {
        if (n < 0 || (r !== null && r < 0)) return 'Values must be non-negative.';
        if ((operation === 'permutation' || operation === 'combination') && r > n) return 'r cannot be greater than n.';
        return null;
    }

    document.getElementById('advancedOperation').setAttribute('title', 'Choose an advanced combinatorics operation. Hover for details.');
    document.getElementById('pigeons').setAttribute('title', 'Number of items to distribute (pigeons)');
    document.getElementById('holes').setAttribute('title', 'Number of containers (holes)');
    document.getElementById('catalanN').setAttribute('title', 'n for Catalan number (must be >= 0)');
    document.getElementById('stirlingN').setAttribute('title', 'n for Stirling number (must be >= 0)');
    document.getElementById('stirlingK').setAttribute('title', 'k for Stirling number (must be >= 0)');
    document.getElementById('binomialN').setAttribute('title', 'n for Binomial coefficient (must be >= 0)');
    document.getElementById('binomialK').setAttribute('title', 'k for Binomial coefficient (must be >= 0)');

    function renderMathJaxIfPresent(container) {
        if (window.MathJax && container && container.innerHTML.match(/\\\(|\\\[|\$|\^|\dfrac|\frac|\sum|\prod|\int|\sqrt|\leq|\geq|\neq|\approx|\infty|\forall|\exists/)) {
            MathJax.typesetPromise([container]);
        }
    }

    function recordCombinatoricsHistory(operation, inputs, answer, formula) {
        window.DMC_ExplainHistory = window.DMC_ExplainHistory || [];
        window.DMC_ExplainHistory.push({
            topic: 'combinatorics',
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

    if (localStorage.getItem('dmc_sendto_combinatorics')) {
        const val = localStorage.getItem('dmc_sendto_combinatorics');
        const setInput = document.getElementById('combinatoricsSetInput') || document.querySelector('input[name="setA"]');
        if (setInput) setInput.value = val;
        localStorage.removeItem('dmc_sendto_combinatorics');
    }

});
