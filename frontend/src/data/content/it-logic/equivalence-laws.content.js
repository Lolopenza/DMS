const equivalenceLawsTheory = {
  overview:
    'Equivalence laws allow you to transform formulas without changing their meaning. Two formulas are equivalent if they have the same truth value under every assignment. Implication checks whether \(F_1\\to F_2\\) is a tautology.',
  outcomes: [
    'Define logical equivalence and implication semantically.',
    'Use truth-table checks to validate equivalence/implication.',
    'Understand counterexamples as concrete falsifying assignments.',
    'Connect equivalence to rewriting rules in Boolean algebra.',
    'Apply a small set of core laws (De Morgan, distributive, absorption) to simplify formulas.',
  ],
  formulas: [
    { title: 'Equivalence', content: '$$F_1\\equiv F_2\\iff (F_1\\leftrightarrow F_2)\\text{ is a tautology}$$' },
    { title: 'Implication', content: '$$F_1\\Rightarrow F_2\\iff (F_1\\to F_2)\\text{ is a tautology}$$' },
    {
      title: "De Morgan's laws",
      content: '$$\\neg(P\\land Q)\\equiv (\\neg P\\lor \\neg Q),\\qquad \\neg(P\\lor Q)\\equiv (\\neg P\\land \\neg Q)$$',
    },
    {
      title: 'Absorption',
      content: '$$P\\lor(P\\land Q)\\equiv P,\\qquad P\\land(P\\lor Q)\\equiv P$$',
    },
  ],
  examples: [
    {
      title: 'Worked example: De Morgan’s law',
      content: [
        'A classical equivalence is:',
        '$$\\neg(P\\land Q)\\equiv (\\neg P \\lor \\neg Q).$$',
        'A truth-table check confirms both sides match on all assignments.',
      ].join('\n'),
    },
    {
      title: 'Worked example: simplify using absorption',
      content: [
        'Simplify',
        '$$P\\lor(P\\land Q).$$',
        'By absorption:',
        '$$P\\lor(P\\land Q)\\equiv P.$$',
      ].join('\n'),
    },
  ],
};

export default equivalenceLawsTheory;

