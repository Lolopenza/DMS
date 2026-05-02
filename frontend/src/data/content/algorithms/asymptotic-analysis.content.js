const asymptoticAnalysisTheory = {
  overview:
    'Asymptotic analysis describes how runtime and memory scale with input size. Big-O notation captures upper bounds up to constant factors, enabling algorithm comparison independent of hardware details. The emphasis is on growth rates and how common code patterns (loops, recursion) translate into \(T(n)\).',
  outcomes: [
    'Interpret Big-O, Big-Ω, and Big-Θ at an intuitive level.',
    'Compare common growth rates (log n, n, n log n, n²).',
    'Relate nested loops/recursion patterns to complexity classes.',
    'Read a simple recurrence and infer its dominant term.',
  ],
  formulas: [
    {
      title: 'Big-O definition (upper bound)',
      content:
        '$$f(n)=O(g(n))\\iff \\exists c>0,\\exists n_0:\\forall n\\ge n_0,\\; f(n)\\le c\\,g(n)$$',
    },
    {
      title: 'Big-Θ (tight bound)',
      content:
        '$$f(n)=\\Theta(g(n))\\iff \\exists c_1,c_2>0,\\exists n_0:\\forall n\\ge n_0,\\; c_1g(n)\\le f(n)\\le c_2g(n)$$',
    },
    {
      title: 'Log rules (useful)',
      content: '$$\\log(ab)=\\log a+\\log b,\\quad \\log(a^k)=k\\log a$$',
    },
  ],
  examples: [
    {
      title: 'Worked example: why binary search is O(log n)',
      content:
        'Binary search halves the remaining search interval each step. After k steps, the remaining size is about n/2^k. Setting n/2^k≈1 gives k≈log₂n.',
    },
    {
      title: 'Worked example: nested loops',
      content: [
        'If you have two nested loops each running \(n\\) times, the total iterations are roughly:',
        '$$n\\cdot n=n^2,$$',
        'so the runtime is \(O(n^2)\\) (ignoring constant work per iteration).',
      ].join('\n'),
    },
  ],
};

export default asymptoticAnalysisTheory;

