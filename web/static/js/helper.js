/**
 * Common helper functions for the Discrete Math Calculator
 */

// Factorial calculation with memoization for better performance
const factorialCache = [1, 1]; // 0! = 1, 1! = 1

function factorial(n) {
    if (n < 0) throw new Error("Factorial not defined for negative numbers");
    if (n > 170) return Infinity; // JS limit
    
    // Check cache first
    if (factorialCache[n] !== undefined) {
        return factorialCache[n];
    }
    
    // Calculate and store in cache
    for (let i = factorialCache.length; i <= n; i++) {
        factorialCache[i] = factorialCache[i-1] * i;
    }
    
    return factorialCache[n];
}

// GCD calculation using Euclidean algorithm
function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    
    while (b > 0) {
        let temp = b;
        b = a % b;
        a = temp;
    }
    
    return a;
}

// LCM calculation
function lcm(a, b) {
    return Math.abs(a * b) / gcd(a, b);
}

// Binomial coefficient calculator
function binomialCoefficient(n, k) {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    
    // Use symmetry to reduce calculations
    if (k > n - k) {
        k = n - k;
    }
    
    let result = 1;
    for (let i = 1; i <= k; i++) {
        result *= (n - (k - i));
        result /= i;
    }
    
    return Math.round(result);
}

// Check if a number is prime
function isPrime(n) {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;
    
    for (let i = 5; i * i <= n; i += 6) {
        if (n % i === 0 || n % (i + 2) === 0) return false;
    }
    
    return true;
}

// Produce a nice LaTeX formatted mathematical expression
function formatMathExpression(expr) {
    return '\\(' + expr + '\\)';
}

// Create a simple bar chart
function createBarChart(labels, values, title, maxHeight = 200) {
    if (!labels || !values || labels.length !== values.length) {
        console.error("Invalid data for createBarChart: labels and values must be non-empty arrays of the same length.");
        return '<div class="chart-error">Error: Invalid data provided for chart.</div>';
    }
    if (labels.length === 0) {
        return '<div class="chart-info">No data to display in chart.</div>'; // Handle empty data case
    }

    const maxValue = Math.max(...values);
    // Handle case where maxValue is 0 or negative (though probabilities should be >= 0)
    const effectiveMaxValue = maxValue <= 0 ? 1 : maxValue; // Avoid division by zero or negative heights
    
    let html = `<div class="chart-container"><h4>${title}</h4>`;
    html += '<div class="bar-chart" style="display: flex; align-items: flex-end; height: ' + maxHeight + 'px; gap: 10px; justify-content: center; padding: 10px 0;">'; // Added justify-content and padding
    
    for (let i = 0; i < labels.length; i++) {
        // Ensure value is non-negative before calculating height
        const currentValue = Math.max(0, values[i]); 
        // Calculate height based on effectiveMaxValue, handle maxValue === 0 case
        const height = (currentValue / effectiveMaxValue) * maxHeight;
        // Format value for display (e.g., limit decimal places)
        const displayValue = values[i].toFixed(4); // Show 4 decimal places for probabilities

        html += `
            <div class="bar-container" style="display: flex; flex-direction: column; align-items: center; text-align: center;">
                <div class="bar-value" style="font-size: 0.8em; margin-bottom: 3px;">${displayValue}</div>
                <div class="bar" title="${labels[i]}: ${displayValue}" style="width: 30px; height: ${height}px; background-color: #5e35b1; border-radius: 3px 3px 0 0;"></div>
                <div class="bar-label" style="font-size: 0.9em; margin-top: 5px;">${labels[i]}</div>
            </div>
        `;
    }
    
    html += '</div></div>';
    return html;
}
