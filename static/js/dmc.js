const DMC = {
    showToast(message, type = 'info') {
        let c = document.getElementById('toastContainer');
        if (!c) {
            c = document.createElement('div');
            c.id = 'toastContainer';
            c.className = 'toast-container';
            document.body.appendChild(c);
        }
        const t = document.createElement('div');
        t.className = `toast ${type}`;
        let icon = '';
        if (type === 'success') icon = '<i class="fas fa-check-circle toast-icon"></i>';
        else if (type === 'error') icon = '<i class="fas fa-exclamation-circle toast-icon"></i>';
        else icon = '<i class="fas fa-info-circle toast-icon"></i>';
        t.innerHTML = `${icon}${message}`;
        c.appendChild(t);
        setTimeout(() => t.remove(), 3500);
    },
    
    showSuccess(msg) { this.showToast(msg, 'success'); },
    
    showError(msg) { this.showToast(msg, 'error'); },
    
    initDarkMode() {
        const t = document.getElementById('darkModeToggle');
        const b = document.body;
        if (t) t.addEventListener('click', () => {
            b.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', b.classList.contains('dark-mode') ? 'enabled' : 'disabled');
        });
        if (localStorage.getItem('darkMode') === 'enabled') b.classList.add('dark-mode');
    },
    
    showLoading() {
        if (document.querySelector('.loader-container')) return;
        const l = document.createElement('div');
        l.className = 'loader-container';
        l.innerHTML = '<div class="loader"></div>';
        document.body.appendChild(l);
    },
    
    hideLoading() {
        const l = document.querySelector('.loader-container');
        if (l) l.remove();
    },
    
    factorial(n) {
        if (n < 0) return null;
        if (n > 170) return Infinity;
        let r = 1;
        for (let i = 2; i <= n; ++i) r *= i;
        return r;
    },
    
    combination(n, r) {
        if (r > n || r < 0 || n < 0) return 0;
        if (r === 0 || r === n) return 1;
        if (r > n / 2) r = n - r;
        let res = 1;
        for (let i = 1; i <= r; ++i) { res *= (n - (r - i)); res /= i; }
        return Math.round(res);
    },
    
    permutation(n, r) {
        if (r > n || r < 0 || n < 0) return 0;
        let res = 1;
        for (let i = 0; i < r; ++i) res *= (n - i);
        return res;
    },
    
    parseSet(str) {
        return str.split(',').map(x => x.trim()).filter(x => x.length).map(x => {
            if (/^-?\d+$/.test(x)) return parseInt(x, 10);
            if (/^-?\d*\.\d+$/.test(x)) return parseFloat(x);
            return x;
        });
    },
    
    formatSet(s) {
        if (!s || s.length === 0 || (s.size !== undefined && s.size === 0)) return '∅';
        const arr = Array.isArray(s) ? s : [...s];
        return '{' + arr.join(', ') + '}';
    },
    
    validateForm: function(formId, rules) {
        const form = document.getElementById(formId);
        if (!form) return true;
        
        let isValid = true;
        
        for (const field in rules) {
            const input = form.elements[field];
            if (!input) continue;
            
            const value = input.value.trim();
            const rule = rules[field];
            
            this.clearFieldError(input);
            
            if (rule.required && value === '') {
                this.showFieldError(input, rule.requiredMessage || 'This field is required');
                isValid = false;
                continue;
            }
        }
        
        return isValid;
    },
    
    showFieldError: function(input, message) {
        input.classList.add('is-invalid');
        
        const error = document.createElement('div');
        error.className = 'form-error';
        error.textContent = message;
        
        input.parentNode.insertBefore(error, input.nextSibling);
    },
    
    clearFieldError: function(input) {
        input.classList.remove('is-invalid');
        const error = input.nextElementSibling;
        if (error && error.className === 'form-error') {
            error.remove();
        }
    },
    
    async api(endpoint, data) {
        this.showLoading();
        try {
            const r = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const d = await r.json();
            this.hideLoading();
            if (!r.ok) throw new Error(d.error || 'Server error');
            return d.result;
        } catch (e) {
            this.hideLoading();
            this.showError(e.message);
            throw e;
        }
    },
    
    async calculateSetTheory(payload) {
        return await this.api('/api/set_theory', payload);
    },
    
    async calculateCombinatorics(payload) {
        return await this.api('/api/combinatorics', payload);
    },
    
    async calculateNumberTheory(payload) {
        return await this.api('/api/number_theory', payload);
    },
    
    async calculateProbability(payload) {
        return await this.api('/api/probability', payload);
    }
};

window.DMC = DMC;

document.addEventListener("DOMContentLoaded", function() {
    const offlineAlert = document.getElementById('offlineAlert');
    if (offlineAlert) {
        offlineAlert.style.display = 'block';
    }
    
    DMC.initDarkMode();
});

function showGlobalLoader() {document.getElementById('globalLoader').style.display = 'flex';}
function hideGlobalLoader() {document.getElementById('globalLoader').style.display = 'none';}
function fetchWithLoader(url, options) {showGlobalLoader();return fetch(url, options).finally(hideGlobalLoader);}
window.fetchWithLoader = fetchWithLoader;
window.showGlobalLoader = showGlobalLoader;
window.hideGlobalLoader = hideGlobalLoader;

// Доработка Дома 
document.addEventListener("DOMContentLoaded", function() {
    const offlineAlert = document.getElementById('offlineAlert');
    if (offlineAlert) {
        offlineAlert.style.display = 'block';
    }
    
    // Initialize dark mode
    DMC.initDarkMode();
});

function showGlobalLoader() {document.getElementById('globalLoader').style.display = 'flex';}
function hideGlobalLoader() {document.getElementById('globalLoader').style.display = 'none';}
function fetchWithLoader(url, options) {showGlobalLoader();return fetch(url, options).finally(hideGlobalLoader);}
window.fetchWithLoader = fetchWithLoader;
window.showGlobalLoader = showGlobalLoader;
window.hideGlobalLoader = hideGlobalLoader;

// Add ARIA attributes to result containers and interactive elements
// Trigger MathJax rendering if formulas are present
