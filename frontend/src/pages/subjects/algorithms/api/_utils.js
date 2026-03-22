/**
 * Shared algorithm utilities for analysis and computation
 */

// Asymptotic Analysis Utilities

export function calculateTimeComplexity(n, operation) {
  const operations = {
    'constant': 1,
    'linear': n,
    'quadratic': n * n,
    'cubic': n * n * n,
    'logarithmic': Math.ceil(Math.log2(n)),
    'linearithmic': n * Math.ceil(Math.log2(n)),
    'exponential': Math.pow(2, n),
    'factorial': n <= 20 ? factorial(n) : Infinity,
  };
  return operations[operation] || null;
}

export function compareComplexities(complexities) {
  const parsed = complexities.map((c) => ({
    ...c,
    value: calculateTimeComplexity(1000, c.type || c),
  }));
  return parsed.sort((a, b) => a.value - b.value);
}

// Sorting Algorithms

export function bubbleSort(arr) {
  if (!Array.isArray(arr)) throw new Error('Input must be an array');
  const result = [...arr];
  const comparisons = [];
  const swaps = [];
  
  for (let i = 0; i < result.length; i++) {
    for (let j = 0; j < result.length - 1 - i; j++) {
      comparisons.push(`Compare ${result[j]} and ${result[j + 1]}`);
      if (result[j] > result[j + 1]) {
        [result[j], result[j + 1]] = [result[j + 1], result[j]];
        swaps.push(`Swap ${result[j]} and ${result[j + 1]}`);
      }
    }
  }
  
  return {
    sorted: result,
    comparisons: comparisons.length,
    swaps: swaps.length,
    complexity: 'O(n²)',
  };
}

export function mergeSort(arr) {
  if (!Array.isArray(arr)) throw new Error('Input must be an array');
  
  function merge(left, right) {
    const result = [];
    let i = 0, j = 0;
    
    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) {
        result.push(left[i++]);
      } else {
        result.push(right[j++]);
      }
    }
    
    return result.concat(left.slice(i)).concat(right.slice(j));
  }
  
  function sort(arr) {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = sort(arr.slice(0, mid));
    const right = sort(arr.slice(mid));
    return merge(left, right);
  }
  
  return {
    sorted: sort(arr),
    comparisons: arr.length * Math.log2(arr.length),
    complexity: 'O(n log n)',
  };
}

export function quickSort(arr) {
  if (!Array.isArray(arr)) throw new Error('Input must be an array');
  
  let comparisons = 0;
  
  function partition(arr, low, high) {
    const pivot = arr[high];
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
      comparisons++;
      if (arr[j] < pivot) {
        [arr[i + 1], arr[j]] = [arr[j], arr[i + 1]];
        i++;
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
  }
  
  function sort(arr, low = 0, high = arr.length - 1) {
    if (low < high) {
      const pi = partition(arr, low, high);
      sort(arr, low, pi - 1);
      sort(arr, pi + 1, high);
    }
    return arr;
  }
  
  const result = [...arr];
  return {
    sorted: sort(result),
    comparisons,
    complexity: 'O(n log n) average, O(n²) worst',
  };
}

// Searching Algorithms

export function linearSearch(arr, target) {
  if (!Array.isArray(arr)) throw new Error('Array required');
  
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return { found: true, index: i, iterations: i + 1, complexity: 'O(n)' };
    }
  }
  return { found: false, index: -1, iterations: arr.length, complexity: 'O(n)' };
}

export function binarySearch(arr, target) {
  if (!Array.isArray(arr)) throw new Error('Array required');
  const sorted = [...arr].sort((a, b) => a - b);
  
  let left = 0, right = sorted.length - 1, iterations = 0;
  while (left <= right) {
    iterations++;
    const mid = Math.floor((left + right) / 2);
    if (sorted[mid] === target) {
      return { found: true, index: mid, iterations, complexity: 'O(log n)' };
    }
    if (sorted[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return { found: false, index: -1, iterations, complexity: 'O(log n)' };
}

// Graph Algorithms

export function dfs(graph, startNode) {
  if (!graph || !startNode) throw new Error('Graph and startNode required');
  
  const visited = new Set();
  const result = [];
  
  function visit(node) {
    if (visited.has(node)) return;
    visited.add(node);
    result.push(node);
    
    if (graph[node]) {
      for (const neighbor of graph[node]) {
        visit(neighbor);
      }
    }
  }
  
  visit(startNode);
  return { traversal: result, visited: Array.from(visited), complexity: 'O(V + E)' };
}

export function bfs(graph, startNode) {
  if (!graph || !startNode) throw new Error('Graph and startNode required');
  
  const visited = new Set([startNode]);
  const queue = [startNode];
  const result = [];
  
  while (queue.length > 0) {
    const node = queue.shift();
    result.push(node);
    
    if (graph[node]) {
      for (const neighbor of graph[node]) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
  }
  
  return { traversal: result, visited: Array.from(visited), complexity: 'O(V + E)' };
}

// Dynamic Programming

export function fibonacci(n) {
  if (!Number.isInteger(n) || n < 0) throw new Error('Non-negative integer required');
  
  if (n <= 1) return n;
  
  const dp = [0, 1];
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  
  return { result: dp[n], steps: n, complexity: 'O(n)', memo: dp };
}

export function countWays(n, steps) {
  if (!Number.isInteger(n) || n < 0) throw new Error('Non-negative integer required');
  
  const dp = Array(n + 1).fill(0);
  dp[0] = 1;
  
  for (let coin of steps) {
    for (let i = coin; i <= n; i++) {
      dp[i] += dp[i - coin];
    }
  }
  
  return { ways: dp[n], complexity: 'O(n * m)' };
}

// Greedy Algorithms

export function fractionalKnapsack(items, capacity) {
  if (!Array.isArray(items)) throw new Error('Items must be array');
  
  const sorted = items
    .map((item) => ({ ...item, ratio: item.value / item.weight }))
    .sort((a, b) => b.ratio - a.ratio);
  
  let totalValue = 0, totalWeight = 0;
  const selected = [];
  
  for (const item of sorted) {
    if (totalWeight + item.weight <= capacity) {
      totalWeight += item.weight;
      totalValue += item.value;
      selected.push({ ...item, fraction: 1 });
    } else {
      const fraction = (capacity - totalWeight) / item.weight;
      totalValue += item.value * fraction;
      totalWeight = capacity;
      selected.push({ ...item, fraction });
      break;
    }
  }
  
  return { value: totalValue, weight: totalWeight, items: selected, complexity: 'O(n log n)' };
}

// Divide and Conquer

export function binaryPower(base, exp) {
  if (!Number.isInteger(exp) || exp < 0) throw new Error('Non-negative integer exponent required');
  
  function power(b, e) {
    if (e === 0) return 1;
    if (e === 1) return b;
    
    const half = power(b, Math.floor(e / 2));
    return e % 2 === 0 ? half * half : half * half * b;
  }
  
  return { result: power(base, exp), complexity: 'O(log n)' };
}

// String Algorithms

export function bruteForceSearch(text, pattern) {
  if (!text || !pattern) throw new Error('Text and pattern required');
  
  const matches = [];
  for (let i = 0; i < text.length - pattern.length + 1; i++) {
    if (text.substring(i, i + pattern.length) === pattern) {
      matches.push(i);
    }
  }
  
  return { matches, count: matches.length, complexity: 'O(n*m)' };
}

export function kmpSearch(text, pattern) {
  if (!text || !pattern) throw new Error('Text and pattern required');
  
  function buildLPS(pattern) {
    const lps = Array(pattern.length).fill(0);
    let len = 0;
    
    for (let i = 1; i < pattern.length; i++) {
      while (len > 0 && pattern[i] !== pattern[len]) {
        len = lps[len - 1];
      }
      if (pattern[i] === pattern[len]) len++;
      lps[i] = len;
    }
    
    return lps;
  }
  
  const lps = buildLPS(pattern);
  const matches = [];
  let i = 0, j = 0;
  
  while (i < text.length) {
    if (text[i] === pattern[j]) {
      i++;
      j++;
    }
    
    if (j === pattern.length) {
      matches.push(i - j);
      j = lps[j - 1];
    } else if (i < text.length && text[i] !== pattern[j]) {
      j = j ? lps[j - 1] : 0;
      i++;
    }
  }
  
  return { matches, count: matches.length, complexity: 'O(n + m)' };
}

// Helper function
function factorial(n) {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}
