const divideConquerTheory = {
  overview:
    'Divide and conquer solves problems by splitting them into smaller subproblems, solving each recursively, and combining the results. It is a structural technique that is naturally described by recurrences and often yields logarithmic recursion depth.',
  outcomes: [
    'Describe the divide, conquer, and combine steps.',
    'Recognize recurrence-style runtime behavior.',
    'Connect algorithm structure to log factors in complexity.',
    'Identify \(a,b,f(n)\) in a recurrence \(T(n)=aT(n/b)+f(n)\\).',
  ],
  formulas: [
    { title: 'Typical recurrence shape', content: '$$T(n)=a\\,T(n/b)+f(n)$$' },
    { title: 'Merge sort recurrence', content: '$$T(n)=2T(n/2)+\\Theta(n)\\Rightarrow T(n)=\\Theta(n\\log n)$$' },
  ],
  examples: [
    {
      title: 'Worked example: merge sort structure',
      content:
        'Split array into halves until size 1, then merge sorted halves back together. The merging work is linear per level, across \(\\log n\\) levels.',
    },
    {
      title: 'Worked example: recurrence intuition',
      content: [
        'If a problem splits into 2 subproblems of size \(n/2\\) and the combine step costs \(n\\), then',
        '$$T(n)=2T(n/2)+n.$$',
        'There are about \(\\log_2 n\\) levels, and each level does total work \(\\approx n\\), giving \(T(n)=\\Theta(n\\log n)\\).',
      ].join('\n'),
    },
  ],
};

export default divideConquerTheory;

