const logicTheory = {
  overview:
    'Propositional logic assigns truth values to formulas built from variables using logical operators. Truth tables provide the semantics of formulas, and equivalences allow you to rewrite formulas without changing meaning. This module focuses on core operators and truth-table evaluation.',
  outcomes: [
    'Read and write simple propositional formulas.',
    'Compute truth tables for basic operators.',
    'Interpret a truth table as a semantic definition of a formula.',
    'Recognize tautologies, contradictions, and contingencies from truth tables.',
  ],
  formulas: [
    { title: 'Negation', content: '$$\\neg P$$' },
    { title: 'Conjunction / Disjunction', content: '$$P \\land Q \\qquad P \\lor Q$$' },
    { title: 'Implication / Biconditional', content: '$$P \\to Q \\qquad P \\leftrightarrow Q$$' },
    { title: "De Morgan's laws", content: '$$\\neg(P\\land Q)\\equiv (\\neg P\\lor \\neg Q),\\qquad \\neg(P\\lor Q)\\equiv (\\neg P\\land \\neg Q)$$' },
  ],
  examples: [
    {
      title: 'Worked example: evaluate a formula',
      content:
        'For \(P=true\\) and \(Q=false\\), the formula \(P\\land Q\\) evaluates to false, while \(P\\lor Q\\) evaluates to true.',
    },
    {
      title: 'Worked example: truth table sketch for implication',
      content: [
        'Implication \(P\\to Q\\) is false only when \(P\\) is true and \(Q\\) is false:',
        '$$',
        '\\begin{array}{c c | c}',
        'P & Q & P\\to Q\\\\\\hline',
        'T & T & T\\\\',
        'T & F & F\\\\',
        'F & T & T\\\\',
        'F & F & T',
        '\\end{array}',
        '$$',
      ].join('\n'),
    },
  ],
};

export default logicTheory;

