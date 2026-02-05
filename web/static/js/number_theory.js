document.addEventListener('DOMContentLoaded', function() {
    setupDivisibilityCalculator();
    setupModularCalculator();
    setupCryptoCalculator();
    setupOperationListeners();
});

function setupDivisibilityCalculator() {
    const calculateBtn = document.getElementById('calculateBtn');
    if (!calculateBtn) return;
    calculateBtn.addEventListener('click', async function() {
        const operation = document.getElementById('operation').value;
        let a, b, n;
        let payload = { operation };
        if (operation === 'divisors' || operation === 'factorize' || operation === 'totient') {
            n = document.getElementById('n').value.trim();
            if (!n) {
                DMC.showError('Number is required.');
                return;
            }
            n = parseInt(n);
            if (isNaN(n) || n <= 0) {
                DMC.showError("Please enter a positive integer");
                return;
            }
            payload.n = n;
        } else {
            a = document.getElementById('a').value.trim();
            b = document.getElementById('b').value.trim();
            if (!a || !b) {
                DMC.showError('Both numbers are required.');
                return;
            }
            a = parseInt(a);
            b = parseInt(b);
            if (isNaN(a) || isNaN(b) || a <= 0 || b <= 0) {
                DMC.showError("Please enter positive integers");
                return;
            }
            payload.a = a;
            payload.b = b;
        }
        try {
            const response = await fetch('/api/number_theory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Server error');
            displayResult(operation, data.result, null, a, b, n);
            let formula = '';
            if (operation === 'gcd' || operation === 'lcm') {
                formula = `${operation}(${a}, ${b}) = ${data.result}`;
            } else if (operation === 'divisors') {
                formula = `Divisors of ${n}: ${data.result.join(', ')}`;
            } else if (operation === 'factorize') {
                formula = `Prime Factorization of ${n}: ${JSON.stringify(data.result)}`;
            } else if (operation === 'totient') {
                formula = `Euler's Totient of ${n}: ${data.result}`;
            }
            recordNumberTheoryHistory(operation, payload, data.result, formula);
        document.getElementById('result').style.display = 'block';
        setTimeout(() => {
            document.getElementById('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        } catch (error) {
            DMC.showError(error.message);
            document.getElementById('result').style.display = 'none';
        }
    });
}

function setupModularCalculator() {
    const calculateModBtn = document.getElementById('calculateModBtn');
    if (!calculateModBtn) return;
    calculateModBtn.addEventListener('click', async function() {
        const operation = document.getElementById('modOperation').value;
        let payload = { operation };
        try {
            if (operation === 'modExp') {
                payload.operation = 'mod_exp';
                payload.base = parseInt(document.getElementById('base').value);
                payload.exponent = parseInt(document.getElementById('exponent').value);
                payload.modulus = parseInt(document.getElementById('modulus').value);
            } else if (operation === 'modInv') {
                payload.operation = 'mod_inv';
                payload.a = parseInt(document.getElementById('invNumber').value);
                payload.m = parseInt(document.getElementById('invModulus').value);
            } else if (operation === 'chineseRemainder') {
                payload.operation = 'crt';
                payload.remainders = document.getElementById('crRemainders').value.split(',').map(x => parseInt(x.trim()));
                payload.moduli = document.getElementById('crModuli').value.split(',').map(x => parseInt(x.trim()));
            } else {
                throw new Error('Unsupported modular operation');
            }
            const response = await fetch('/api/number_theory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Server error');
            const resultValue = document.getElementById('modResultValue');
            if (resultValue) resultValue.textContent = data.result;
            const resultContainer = document.getElementById('modResult');
            if (resultContainer) resultContainer.style.display = 'block';
            let formula = '';
            if (operation === 'modExp') {
                formula = `(${payload.base}^${payload.exponent}) mod ${payload.modulus} = ${data.result}`;
            } else if (operation === 'modInv') {
                formula = `mod_inv(${payload.a}, ${payload.m}) = ${data.result}`;
            } else if (operation === 'chineseRemainder') {
                formula = `Chinese Remainder Theorem for remainders: ${payload.remainders.join(', ')} and moduli: ${payload.moduli.join(', ')}`;
            }
            recordNumberTheoryHistory(operation, payload, data.result, formula);
            DMC.showSuccess("Modular calculation completed successfully");
        } catch (error) {
            DMC.showError(error.message);
            const resultContainer = document.getElementById('modResult');
            if (resultContainer) resultContainer.style.display = 'none';
        }
    });
}

function setupCryptoCalculator() {
    const calculateCryptoBtn = document.getElementById('calculateCryptoBtn');
    if (!calculateCryptoBtn) return;
    calculateCryptoBtn.addEventListener('click', async function() {
        const operation = document.getElementById('cryptoOperation').value;
        let payload = { operation };
        try {
            if (operation === 'rsaGenerate') {
                payload.operation = 'rsa_generate';
                payload.bits = parseInt(document.getElementById('bitLength').value);
            } else if (operation === 'rsaEncrypt') {
                payload.operation = 'rsa_encrypt';
                payload.message = parseInt(document.getElementById('encMessage').value);
                payload.e = parseInt(document.getElementById('publicE').value);
                payload.n = parseInt(document.getElementById('publicN').value);
            } else if (operation === 'rsaDecrypt') {
                payload.operation = 'rsa_decrypt';
                payload.ciphertext = parseInt(document.getElementById('encryptedMessage').value);
                payload.d = parseInt(document.getElementById('privateD').value);
                payload.n = parseInt(document.getElementById('privateN').value);
            } else {
                throw new Error('Unsupported crypto operation');
            }
            const response = await fetch('/api/number_theory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Server error');
            let resultHTML = '';
            if (operation === 'rsaGenerate') {
                resultHTML = `<div class="crypto-result"><h4>RSA Key Generation</h4><div class="crypto-keys"><div class="key-card"><h5>Public Key</h5><p>${JSON.stringify(data.result.public)}</p></div><div class="key-card"><h5>Private Key</h5><p>${JSON.stringify(data.result.private)}</p></div></div></div>`;
            } else if (operation === 'rsaEncrypt') {
                resultHTML = `<div class="crypto-result"><h4>RSA Encryption</h4><div class="number-card result-highlight"><div class="label">Encrypted:</div><div class="value">${data.result}</div></div></div>`;
            } else if (operation === 'rsaDecrypt') {
                resultHTML = `<div class="crypto-result"><h4>RSA Decryption</h4><div class="number-card result-highlight"><div class="label">Decrypted:</div><div class="value">${data.result}</div></div></div>`;
            }
            document.getElementById('cryptoResultValue').innerHTML = resultHTML;
            document.getElementById('cryptoResult').style.display = 'block';
            setTimeout(() => {
                document.getElementById('cryptoResult').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
            let formula = '';
            if (operation === 'rsaGenerate') {
                formula = `RSA Key Generation with ${payload.bits} bits`;
            } else if (operation === 'rsaEncrypt') {
                formula = `RSA Encryption with message: ${payload.message}, public key: (${payload.e}, ${payload.n})`;
            } else if (operation === 'rsaDecrypt') {
                formula = `RSA Decryption with ciphertext: ${payload.ciphertext}, private key: (${payload.d}, ${payload.n})`;
            }
            recordNumberTheoryHistory(operation, payload, data.result, formula);
            DMC.showSuccess("Calculation completed successfully");
        } catch (error) {
            DMC.showError(error.message);
        }
    });
}

function setupOperationListeners() {
    const operationSelect = document.getElementById('operation');
    const singleNumberInput = document.getElementById('singleNumberInput');
    const twoNumberInputs = document.getElementById('twoNumberInputs');
    if (operationSelect && singleNumberInput && twoNumberInputs) {
        operationSelect.addEventListener('change', function() {
            const operation = this.value;
            if (operation === 'divisors' || operation === 'factorize' || operation === 'totient') {
                twoNumberInputs.style.display = 'none';
                singleNumberInput.style.display = 'block';
            } else {
                twoNumberInputs.style.display = 'flex';
                singleNumberInput.style.display = 'none';
            }
        });
    }
    const modOperationSelect = document.getElementById('modOperation');
    const modExpInputs = document.getElementById('modExpInputs');
    const modInvInputs = document.getElementById('modInvInputs');
    const modSolveInputs = document.getElementById('modSolveInputs');
    const chineseInputs = document.getElementById('chineseInputs');
    if (modOperationSelect && modExpInputs && modInvInputs && modSolveInputs && chineseInputs) {
        modOperationSelect.addEventListener('change', function() {
            const operation = this.value;
            modExpInputs.style.display = 'none';
            modInvInputs.style.display = 'none';
            modSolveInputs.style.display = 'none';
            chineseInputs.style.display = 'none';
            if (operation === 'modExp') {
                modExpInputs.style.display = 'block';
            } else if (operation === 'modInv') {
                modInvInputs.style.display = 'block';
            } else if (operation === 'modSolve') {
                modSolveInputs.style.display = 'block';
            } else if (operation === 'chineseRemainder') {
                chineseInputs.style.display = 'block';
            }
        });
    }
    const cryptoOperationSelect = document.getElementById('cryptoOperation');
    const rsaGenInputs = document.getElementById('rsaGenInputs');
    const rsaEncInputs = document.getElementById('rsaEncInputs');
    const rsaDecInputs = document.getElementById('rsaDecInputs');
    if (cryptoOperationSelect && rsaGenInputs && rsaEncInputs && rsaDecInputs) {
        cryptoOperationSelect.addEventListener('change', function() {
            const operation = this.value;
            rsaGenInputs.style.display = 'none';
            rsaEncInputs.style.display = 'none';
            rsaDecInputs.style.display = 'none';
            if (operation === 'rsaGenerate') {
                rsaGenInputs.style.display = 'block';
            } else if (operation === 'rsaEncrypt') {
                rsaEncInputs.style.display = 'block';
            } else if (operation === 'rsaDecrypt') {
                rsaDecInputs.style.display = 'block';
            }
        });
    }
}

function displayResult(operation, result, steps, a, b, n) {
    const resultValue = document.getElementById('resultValue');
    if (!resultValue) return;
    let html = '';
    if (operation === 'gcd' || operation === 'lcm') {
        html = `<strong>Result:</strong> ${result}`;
    } else if (operation === 'divisors') {
        html = `<strong>Divisors:</strong> ${result.join(', ')}`;
    } else if (operation === 'factorize') {
        html = `<strong>Prime Factorization:</strong> ${JSON.stringify(result)}`;
    } else if (operation === 'totient') {
        html = `<strong>Euler's Totient:</strong> ${result}`;
    }
    resultValue.innerHTML = html;
}

function validateNumberTheoryInputs(formType, values) {
    if (formType === 'divisibility') {
        if (values.a < 1 || values.b < 1) return 'Numbers must be positive.';
        if (values.operation === 'gcd' || values.operation === 'lcm') {
            if (values.a < 1 || values.b < 1) return 'Both numbers must be >= 1.';
        }
        if (['divisors', 'factorize', 'totient'].includes(values.operation) && values.n < 1) return 'Number must be >= 1.';
    }
    if (formType === 'modular') {
        if (values.modulus < 1) return 'Modulus must be >= 1.';
        if (values.base !== undefined && values.base < 0) return 'Base must be >= 0.';
        if (values.exponent !== undefined && values.exponent < 0) return 'Exponent must be >= 0.';
    }
    if (formType === 'crypto') {
        if (values.cryptoOperation === 'rsaGenerate' && (values.bitLength < 8 || values.bitLength > 16)) return 'Bit length should be 8-16 for demo.';
        if (values.cryptoOperation === 'rsaEncrypt' && values.encMessage < 0) return 'Message must be >= 0.';
        if (values.cryptoOperation === 'rsaDecrypt' && values.encryptedMessage < 0) return 'Encrypted message must be >= 0.';
    }
    return null;
}

// Add title/tooltips for complex fields
['bitLength','publicE','publicN','privateD','privateN','encMessage','encryptedMessage','modulus','base','exponent'].forEach(id=>{
    const el=document.getElementById(id);if(el)el.setAttribute('title','See help for valid range and meaning.');
});

function renderMathJaxIfPresent(container) {
    if (window.MathJax && container && container.innerHTML.match(/\\\(|\\\[|\$|\^|\dfrac|\frac|\sum|\prod|\int|\sqrt|\leq|\geq|\neq|\approx|\infty|\forall|\exists/)) {
        MathJax.typesetPromise([container]);
    }
}

function recordNumberTheoryHistory(operation, inputs, answer, formula) {
    window.DMC_ExplainHistory = window.DMC_ExplainHistory || [];
    window.DMC_ExplainHistory.push({
        topic: 'number theory',
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
