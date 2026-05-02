const booleanAlgebraTheory = {
  overview:
    'Boolean algebra treats logical formulas as algebraic expressions over truth values. Normal forms (CNF/DNF) provide standardized representations that support simplification, equivalence reasoning, and algorithmic manipulation.',
  outcomes: [
    'Compute CNF and DNF representations of a formula.',
    'Distinguish canonical and simplified normal forms.',
    'Use normal forms to reason about satisfiability.',
    'Relate Boolean algebra transformations to logical equivalences.',
    'Recognize that CNF/DNF are equivalent representations with different structure.',
  ],
  formulas: [
    { title: 'CNF / DNF', content: '$$\\text{CNF: conjunction of disjunctions}\\quad\\text{DNF: disjunction of conjunctions}$$' },
    { title: 'Distributive pattern', content: '$$P\\land(Q\\lor R)\\equiv (P\\land Q)\\lor(P\\land R)$$' },
    { title: 'Double negation', content: '$$\\neg\\neg P\\equiv P$$' },
  ],
  examples: [
    {
      title: 'Worked example: normal forms (conceptual)',
      content: [
        'For a given formula \(F\\), the calculator can compute CNF and DNF forms.',
        'These forms are logically equivalent to \(F\\) but structured to support systematic reasoning and simplification.',
      ].join('\n'),
    },
    {
      title: 'Worked example: distribute to get DNF shape',
      content: [
        'Start with',
        '$$P\\land(Q\\lor R).$$',
        'Distribute:',
        '$$(P\\land Q)\\lor(P\\land R),$$',
        'which is a DNF-style “OR of ANDs”.',
      ].join('\n'),
    },
  ],
};

export default booleanAlgebraTheory;

