const combinatoricsTheory = {
  overview:
    'Combinatorics studies finite structures and the number of ways to arrange, select, distribute, or partition objects under clear constraints. A key skill is translating a word problem into a counting model (order matters vs does not matter, repetition allowed vs not, labeled vs unlabeled), then applying the right formula or recurrence.',
  outcomes: [
    'Distinguish ordered arrangements from unordered selections.',
    'Apply factorial, permutation, and combination formulas to finite sets.',
    'Use Catalan, Stirling, binomial, and pigeonhole models for common counting tasks.',
    'Recognize when a problem is best modeled by a recurrence rather than a closed form.',
  ],
  formulas: [
    { title: 'Factorial', content: '$$n! = n \\cdot (n - 1) \\cdot \\ldots \\cdot 2 \\cdot 1$$' },
    {
      title: 'Permutations and Combinations',
      content: '$$P(n,r)=\\frac{n!}{(n-r)!} \\qquad C(n,r)=\\frac{n!}{r!(n-r)!}$$',
    },
    { title: 'Catalan Numbers', content: '$$C_n = \\frac{1}{n + 1}\\binom{2n}{n}$$' },
    {
      title: 'Binomial theorem coefficient',
      content: '$$\\binom{n}{k}=\\frac{n!}{k!(n-k)!} \\quad\\text{and}\\quad (x+y)^n=\\sum_{k=0}^{n}\\binom{n}{k}x^{n-k}y^k$$',
    },
    {
      title: 'Pigeonhole principle (basic form)',
      content: '$$\\text{If }p\\text{ objects are placed into }h\\text{ boxes, then some box has at least }\\left\\lceil\\frac{p}{h}\\right\\rceil\\text{ objects.}$$',
    },
  ],
  examples: [
    {
      title: 'When order matters',
      content:
        'Arranging 3 students from a group of 10 is a permutation: the first, second, and third positions are distinct.',
    },
    {
      title: 'When order does not matter',
      content:
        'Choosing 3 students for a committee from a group of 10 is a combination: only membership matters.',
    },
    {
      title: 'Worked example: combinations (choose a committee)',
      content: [
        'A committee of 3 students is chosen from 10 students. Order does not matter, so the count is:',
        '$$\\binom{10}{3}=\\frac{10!}{3!\\,7!}=\\frac{10\\cdot 9\\cdot 8}{3\\cdot 2\\cdot 1}=120.$$',
      ].join('\n'),
    },
    {
      title: 'Worked example: pigeonhole lower bound',
      content: [
        'You distribute \(p=10\\) objects into \(h=3\\) boxes. By pigeonhole:',
        '$$\\left\\lceil\\frac{10}{3}\\right\\rceil=4,$$',
        'so at least one box contains **at least 4** objects (no matter how you distribute).',
      ].join('\n'),
    },
  ],
};

export default combinatoricsTheory;

