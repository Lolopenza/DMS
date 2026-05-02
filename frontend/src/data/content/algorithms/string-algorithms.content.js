const stringAlgorithmsTheory = {
  overview:
    'String algorithms process sequences of characters for tasks like searching, matching, and pattern detection. Efficient algorithms avoid redundant comparisons by leveraging structure in the pattern or text.',
  outcomes: [
    'Describe the goal of pattern matching.',
    'Compare naive matching with optimized approaches conceptually.',
    'Recognize where string algorithms appear in real systems (search, compilers, bioinformatics).',
    'Understand why preprocessing a pattern can reduce redundant work.',
  ],
  formulas: [
    { title: 'Pattern matching goal', content: '$$\\text{Find indices }i\\text{ such that }T[i..i+m-1]=P[0..m-1]$$' },
    { title: 'Naive worst-case (idea)', content: '$$\\text{Naive matching can take }O(nm)\\text{ comparisons in the worst case.}$$' },
  ],
  examples: [
    {
      title: 'Worked example: naive match idea',
      content:
        'To find pattern \"aba\" in text \"ababa\", slide the pattern and compare characters at each shift until a full match occurs.',
    },
    {
      title: 'Worked example: overlaps intuition',
      content: [
        'Patterns like \"abab\" have overlaps (prefixes that are also suffixes).',
        'Algorithms like KMP exploit this to avoid re-checking characters after a mismatch.',
      ].join('\n'),
    },
  ],
};

export default stringAlgorithmsTheory;

