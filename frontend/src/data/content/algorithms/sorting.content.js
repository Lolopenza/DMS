const sortingTheory = {
  overview:
    'Sorting arranges elements into a chosen order (typically ascending). This module compares classic comparison-based sorts and visualizes their step-by-step behavior: comparisons, swaps, and partition/merge structure.',
  outcomes: [
    'Explain what it means for a sort to be stable or in-place.',
    'Compare bubble sort, merge sort, and quick sort at a high level.',
    'Relate algorithm behavior to time/space complexity trade-offs.',
    'Understand why comparison-based sorting has a lower bound of \(\\Omega(n\\log n)\\).',
  ],
  formulas: [
    { title: 'Complexity notation', content: '$$\\text{Time: }O(\\cdot),\\quad \\text{Space: }O(\\cdot)$$' },
    { title: 'Comparison sort lower bound (idea)', content: '$$\\text{Any comparison sort needs }\\Omega(n\\log n)\\text{ comparisons in the worst case.}$$' },
  ],
  examples: [
    {
      title: 'Worked example: one bubble sort pass',
      content:
        'Given array \\([4,2,3]\\), compare adjacent pairs: swap 4 and 2 → \\([2,4,3]\\), then swap 4 and 3 → \\([2,3,4]\\). A full sort repeats passes until no swaps occur.',
    },
    {
      title: 'Worked example: merge vs quick intuition',
      content: [
        '- **Merge sort**: always splits in half and does linear merging → predictable \(O(n\\log n)\\).',
        '- **Quick sort**: partitions around a pivot; average \(O(n\\log n)\\), worst-case \(O(n^2)\\) if partitions are very unbalanced.',
      ].join('\n'),
    },
  ],
};

export default sortingTheory;

