const searchingTheory = {
  overview:
    'Searching finds a target value in a collection. Linear search scans sequentially, while binary search exploits sorted order to halve the search space repeatedly.',
  outcomes: [
    'Choose linear vs binary search based on whether data is sorted.',
    'Describe binary search’s invariant and halving behavior.',
    'Interpret runtime differences using Big-O reasoning.',
    'State the key precondition for binary search: sorted order.',
  ],
  formulas: [
    { title: 'Linear search time', content: '$$T(n)=O(n)$$' },
    { title: 'Binary search time', content: '$$T(n)=O(\\log n)$$' },
    { title: 'Binary search invariant (informal)', content: '$$\\text{Target, if present, remains in the current interval }[L,R].$$' },
  ],
  examples: [
    {
      title: 'Worked example: binary search idea',
      content:
        'In sorted array \\([10,20,30,40,50]\\), target 30: check middle 30 → found immediately. Each step halves the remaining interval.',
    },
    {
      title: 'Worked example: why sortedness matters',
      content: [
        'Binary search decides “left vs right” by comparing to the middle element.',
        'Without sorted order, that decision is not logically valid, so the algorithm can skip the target.',
      ].join('\n'),
    },
  ],
};

export default searchingTheory;

