const truthTablesTheory = {
  overview:
    'Truth tables provide a complete semantic evaluation of a propositional formula by enumerating all assignments of its variables. They are used to determine whether a formula is a tautology, contradiction, or contingency and to validate logical relationships precisely.',
  outcomes: [
    'Construct a truth table for a propositional formula in given variables.',
    'Classify a formula as tautology, contradiction, or contingency.',
    'Interpret a truth table as a semantic definition of a formula.',
    'Translate between operator notation (¬, ∧, ∨, →, ↔) and engine syntax.',
    'Use counterexamples (rows) to explain why a claim fails.',
  ],
  formulas: [
    { title: 'Negation', content: '$$\\neg P$$' },
    { title: 'Conjunction / Disjunction', content: '$$P \\land Q \\qquad P \\lor Q$$' },
    { title: 'Implication / Biconditional', content: '$$P \\to Q \\qquad P \\leftrightarrow Q$$' },
    { title: 'Tautology / Contradiction', content: '$$\\text{Tautology: always true}\\qquad\\text{Contradiction: always false}$$' },
  ],
  examples: [
    {
      title: 'Worked example: classify a formula',
      content: [
        'Consider',
        '$$ (P \\to Q) \\land P. $$',
        'A truth table shows the formula is not always true (so it is not a tautology), and it is true under some assignments (so it is not a contradiction).',
        'Therefore it is a **contingency**.',
      ].join('\n'),
    },
    {
      title: 'Worked example: a tautology',
      content: [
        'The formula',
        '$$P\\lor \\neg P$$',
        'is true for both \(P=T\\) and \(P=F\\), so it is a **tautology**.',
      ].join('\n'),
    },
  ],
};

export default truthTablesTheory;

