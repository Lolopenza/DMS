document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('dmc_sendto_logic')) {
        const val = localStorage.getItem('dmc_sendto_logic');
        const setInput = document.getElementById('logicSetInput') || document.querySelector('input[name="setA"]');
        if (setInput) setInput.value = val;
        localStorage.removeItem('dmc_sendto_logic');
    }
    setupTruthTableGenerator();
    setupEquivalenceChecker();
    setupCustomToggle();
});

function setupTruthTableGenerator() {
    const generateBtn = document.getElementById('generateBtn');
    if (!generateBtn) return;
    generateBtn.addEventListener('click', async function() {
        const variablesValue = document.getElementById('variables').value.trim();
        if (!variablesValue) {
            DMC.showError('Variables are required.');
            return;
        }
        let variables = variablesValue.split(',').map(v => v.trim());
        variables = sanitizeVariables(variables);
        if (variables.length === 0) {
            DMC.showError('Please enter single-letter variable names (e.g., P,Q,R).');
            return;
        }
        const expressionType = document.getElementById('expressionType').value;
        let expression;
        if (expressionType === 'custom') {
            const customExpressionValue = document.getElementById('customExpression').value.trim();
            if (!customExpressionValue) {
                DMC.showError('Custom expression is required.');
                return;
            }
            expression = customExpressionValue; // Keep original for history
        } else {
            expression = getExpressionFromType(expressionType, variables); // Keep original for history
        }

        const backendExpression = convertFormulaToBackendSyntax(expression);

        if (!formulaUsesOnlyVariables(backendExpression, variables)) {
            DMC.showError('Formula uses variables not listed in the Variables field. Please check your input.');
            return;
        }
        try {
            const payload = { operation: 'truth_table', variables, formula: backendExpression };
            const response = await fetch('/api/logic', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Server error');
            displayTruthTable(data.result, variables);
            document.getElementById('result').style.display = 'block';
            // Use the original user-facing expression for history
            recordLogicHistory('truth_table', {variables: variables, expression: expression}, data.result, expression);
        } catch (error) {
            DMC.showError(error.message);
            document.getElementById('result').style.display = 'none';
        }
    });
    function getExpressionFromType(type, variables) {
        const [p, q] = variables;
        switch(type) {
            case 'and': return `${p} ∧ ${q}`;
            case 'or': return `${p} ∨ ${q}`;
            case 'implies': return `${p} → ${q}`;
            case 'iff': return `${p} ↔ ${q}`;
            case 'xor': return `${p} ⊕ ${q}`;
            case 'nand': return `¬(${p} ∧ ${q})`;
            case 'nor': return `¬(${p} ∨ ${q})`;
            default: return '';
        }
    }
    function displayTruthTable(table, variables) {
        let html = '<table class="truth-table">';
        html += '<tr>';
        variables.forEach(v => { html += `<th>${v}</th>`; });
        html += '<th>Result</th></tr>';
        const numRows = table[variables[0]].length;
        for (let i = 0; i < numRows; i++) {
            html += '<tr>';
            variables.forEach(v => { html += `<td>${table[v][i] ? 'T' : 'F'}</td>`; });
            html += `<td>${table['Result'][i] ? 'T' : 'F'}</td></tr>`;
        }
        html += '</table>';
        document.getElementById('tableResult').innerHTML = html;
        renderMathJaxIfPresent(document.getElementById('tableResult'));
    }
}

function setupEquivalenceChecker() {
    const checkEquivalenceBtn = document.getElementById('checkEquivalenceBtn');
    if (!checkEquivalenceBtn) return;
    checkEquivalenceBtn.addEventListener('click', async function() {
        const expr1_original = document.getElementById('expression1').value.trim();
        const expr2_original = document.getElementById('expression2').value.trim();
        const variablesValue = document.getElementById('variablesEq').value.trim();
        
        if (!expr1_original || !expr2_original) {
            DMC.showError("Please enter both expressions");
            return;
        }
        if (!variablesValue) {
            DMC.showError('Variables are required for equivalence check.');
            return;
        }
        let variables = variablesValue.split(',').map(v => v.trim());
        variables = sanitizeVariables(variables);

        if (variables.length === 0) {
            DMC.showError("Please enter valid, single-letter variable names for equivalence check.");
            return;
        }

        const expr1_backend = convertFormulaToBackendSyntax(expr1_original);
        const expr2_backend = convertFormulaToBackendSyntax(expr2_original);

        if (!formulaUsesOnlyVariables(expr1_backend, variables) || !formulaUsesOnlyVariables(expr2_backend, variables)) {
            DMC.showError('One or both formulas use variables not listed in the Variables field. Please check your input.');
            return;
        }

        DMC.showLoading();
        try {
            const payload = { 
                operation: 'equivalence', 
                variables, 
                formula1: expr1_backend, 
                formula2: expr2_backend 
            };
            const response = await fetch('/api/logic', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Server error');
            displayEquivalenceResult(expr1_original, expr2_original, data.result);
                document.getElementById('equivalenceResult').style.display = 'block';
                DMC.hideLoading();
                DMC.showSuccess("Equivalence check completed");
            // Use original user-facing expressions for history
            recordLogicHistory('equivalence', {variables: variables, expression1: expr1_original, expression2: expr2_original}, data.result, `${expr1_original} ↔ ${expr2_original}`);
            } catch (error) {
                DMC.hideLoading();
                DMC.showError("Error checking equivalence: " + error.message);
            }
    });
    function displayEquivalenceResult(expr1, expr2, areEquivalent) {
        const resultContent = document.getElementById('eqResultContent');
        let html = `<p>Checking equivalence between:</p><div class="expression-display">${expr1}</div><div class="expression-display">${expr2}</div>`;
        if (areEquivalent) {
            html += `<p class="result-equivalent">These expressions are <strong>logically equivalent</strong>.</p>`;
        } else {
            html += `<p class="result-not-equivalent">These expressions are <strong>not logically equivalent</strong>.</p>`;
        }
        resultContent.innerHTML = html;
        renderMathJaxIfPresent(document.getElementById('eqResultContent'));
    }
}

function setupCustomToggle() {
    const toggleCustomBtn = document.getElementById('toggleCustomBtn');
    if (!toggleCustomBtn) return;
    toggleCustomBtn.addEventListener('click', function() {
        const customGroup = document.getElementById('customExpressionGroup');
        const expressionType = document.getElementById('expressionType');
        if (customGroup.style.display === 'none') {
            customGroup.style.display = 'block';
            expressionType.value = 'custom';
            toggleCustomBtn.querySelector('span').textContent = 'Use Predefined Expression';
        } else {
            customGroup.style.display = 'none';
            expressionType.value = 'and';
            toggleCustomBtn.querySelector('span').textContent = 'Use Custom Expression';
        }
    });
}

document.getElementById('customExpression').setAttribute('title','Enter a valid logical expression using ∧, ∨, ¬, →, ↔.');
document.getElementById('proofSteps').setAttribute('title','Enter each proof step on a new line.');

function renderMathJaxIfPresent(container) {
    if (window.MathJax && container && container.innerHTML.match(/\\\(|\\\[|\$|\^|\dfrac|\frac|\sum|\prod|\int|\sqrt|\leq|\geq|\neq|\approx|\infty|\forall|\exists/)) {
        MathJax.typesetPromise([container]);
    }
}

function recordLogicHistory(operation, inputs, answer, formula) {
    window.DMC_ExplainHistory = window.DMC_ExplainHistory || [];
    window.DMC_ExplainHistory.push({
        topic: 'logic',
        operation: operation,
        inputs: inputs, // inputs can be an object {variables, expression} or {variables, expression1, expression2}
        answer: answer,
        formula: formula, // This is the representative formula for the operation
        timestamp: Date.now()
    });
    if (window.DMC_ExplainHistory.length > 10) window.DMC_ExplainHistory.shift();
    window.DMC_ExplainContext.operation = operation;
    window.DMC_ExplainContext.inputs = inputs;
    window.DMC_ExplainContext.formula = formula;
}

function convertFormulaToBackendSyntax(formula) {
    return formula
        .replace(/∧/g, '&')
        .replace(/∨/g, '|')
        .replace(/¬/g, '~')
        .replace(/→/g, '->')
        .replace(/↔/g, '<->')
        .replace(/⊕/g, '^');
}

function sanitizeVariables(variables) {
    // Only allow single-letter variables (A-Z, a-z)
    // Filter out empty strings that might result from "P, , Q"
    return variables.filter(v => /^[A-Za-z]$/.test(v));
}

function formulaUsesOnlyVariables(formula, variables) {
    // Extract all single-letter variables from formula
    const usedInFormula = Array.from(new Set(formula.match(/[A-Za-z]+/g) || []));
    // Filter out known function names if parse_formula expects them (e.g. implies, iff)
    // For simplicity now, assume variables are single letters and distinct from function names.
    // The current backend `parse_formula` expects variables like P, Q and functions like implies(P,Q).
    // So, we only check for single letters here.
    const singleLetterVarsInFormula = usedInFormula.filter(v => /^[A-Za-z]$/.test(v));
    return singleLetterVarsInFormula.every(v => variables.includes(v));
}
