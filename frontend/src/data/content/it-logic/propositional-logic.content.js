const propositionalLogicTheory = {
  overview:
    'Propositional logic studies formulas built from atomic propositions using logical operators. By analyzing a formula’s truth table (or derived forms like CNF/DNF), we can classify it and reason about implication and equivalence rigorously.',
  outcomes: [
    'Parse common propositional operators and understand precedence.',
    'Classify formulas using truth-table semantics.',
    'Understand CNF and DNF as standard normal forms.',
    'Use normal forms to reason about satisfiability and structure.',
  ],
  formulas: [
    { title: 'Basic operators', content: '$$\\neg P,\\; P\\land Q,\\; P\\lor Q,\\; P\\to Q,\\; P\\leftrightarrow Q$$' },
    { title: 'Normal forms', content: '$$\\text{CNF: }\\bigwedge \\text{(clauses)},\\quad \\text{DNF: }\\bigvee \\text{(terms)}$$' },
  ],
  examples: [
    {
      title: 'Worked example: modus ponens form',
      content: [
        'Consider',
        '$$ (P \\to Q) \\land P. $$',
        'Whenever this formula is true, \(P\\) must be true and \(P\\to Q\\) must be true, which forces \(Q\\) to be true.',
        'A truth-table analysis classifies it as a **contingency**.',
      ].join('\n'),
    },
  ],
};

export default propositionalLogicTheory;

