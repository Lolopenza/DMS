const dynamicProgrammingTheory = {
  overview:
    'Dynamic programming (DP) solves problems with overlapping subproblems and optimal substructure by storing intermediate results. This module demonstrates DP through Fibonacci and coin change.',
  outcomes: [
    'Explain overlapping subproblems and memoization/tabulation.',
    'Compute Fibonacci values efficiently using DP.',
    'Model coin change as a recurrence over amounts.',
    'Distinguish state definition, transition, and base cases.',
  ],
  formulas: [
    { title: 'Fibonacci recurrence', content: '$$F(0)=0,\\;F(1)=1,\\;F(n)=F(n-1)+F(n-2)$$' },
    { title: 'Coin change (conceptual)', content: '$$dp[a]=\\min_{c\\in Coins}(dp[a-c]+1)$$' },
    { title: 'DP template (words)', content: '$$\\text{Define state }dp[\\cdot]\\;\\text{then write a transition and fill in an order.}$$' },
  ],
  examples: [
    {
      title: 'Worked example: Fibonacci tabulation',
      content:
        'To compute \(F(5)\\): build table \(F(0)=0, F(1)=1\\) then \(F(2)=1, F(3)=2, F(4)=3, F(5)=5\\).',
    },
    {
      title: 'Worked example: coin change transition',
      content: [
        'For coins \([1,3,4]\\) and amount \(a=6\\), a typical transition is:',
        '$$dp[6]=\\min(dp[5]+1,\\;dp[3]+1,\\;dp[2]+1).$$',
        'Each term corresponds to taking a coin \(c\\in\\{1,3,4\\}\\) as the last coin.',
      ].join('\n'),
    },
  ],
};

export default dynamicProgrammingTheory;

