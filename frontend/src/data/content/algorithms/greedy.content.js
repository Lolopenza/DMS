const greedyTheory = {
  overview:
    'Greedy algorithms build a solution step-by-step by choosing the best local option at each stage. They are efficient when the problem has the greedy-choice property and optimal substructure.',
  outcomes: [
    'Explain what a greedy choice is and when it works.',
    'Recognize problems where greedy methods are correct (e.g., certain scheduling/selection tasks).',
    'Compare greedy vs dynamic programming approaches.',
    'Identify a greedy invariant/correctness argument (exchange argument) at a high level.',
  ],
  formulas: [
    { title: 'Greedy principle', content: '$$\\text{Choose locally optimal step }\\Rightarrow\\text{ globally optimal (when property holds)}$$' },
    { title: 'Exchange argument (idea)', content: '$$\\text{Transform an optimal solution to include greedy choice without worsening it.}$$' },
  ],
  examples: [
    {
      title: 'Worked example: interval selection intuition',
      content:
        'In activity selection, choosing the activity that finishes earliest leaves maximal room for remaining activities, which can be proven optimal.',
    },
    {
      title: 'Worked example: coin system caveat',
      content: [
        'Greedy “take the largest coin first” works for some coin systems but fails for others.',
        'Example system \([1,3,4]\\), amount \(6\\): greedy picks \(4+1+1\\) (3 coins) but optimal is \(3+3\\) (2 coins).',
      ].join('\n'),
    },
  ],
};

export default greedyTheory;

