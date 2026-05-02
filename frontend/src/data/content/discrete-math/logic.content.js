const logicTheory = {
  overview:
    'Propositional logic assigns truth values to formulas built from variables using logical operators. Truth tables give the semantics of a formula; equivalence and implication checks relate pairs of formulas; normal forms express any Boolean function as a sum of products (DNF) or product of sums (CNF).',
  outcomes: [
    'Read and write propositional formulas using &, |, ~ and parentheses.',
    'Compute and interpret full truth tables (tautology, contradiction, contingency).',
    'Test whether two formulas are logically equivalent or whether one implies another.',
    'Read DNF/CNF strings produced from a formula’s truth table.',
    "Apply De Morgan's laws to simplify negations of conjunctions and disjunctions.",
  ],
  formulas: [
    { title: 'Negation', content: '$$\\neg P \\quad\\text{(ASCII: ~P)}$$' },
    { title: 'Conjunction / Disjunction', content: '$$P \\land Q \\qquad P \\lor Q \\quad\\text{(ASCII: P \\& Q, P | Q)}$$' },
    { title: 'Implication / Biconditional', content: '$$P \\to Q \\equiv \\neg P \\lor Q \\qquad P \\leftrightarrow Q \\equiv (P \\to Q) \\land (Q \\to P)$$' },
    {
      title: "De Morgan's laws",
      content:
        '$$\\neg(P\\land Q)\\equiv (\\neg P\\lor \\neg Q),\\qquad \\neg(P\\lor Q)\\equiv (\\neg P\\land \\neg Q)$$',
    },
    {
      title: 'Normal forms (informal)',
      content:
        '$$\\text{DNF}:\\ \\bigvee_i \\text{(product term)} \\qquad \\text{CNF}:\\ \\bigwedge_j \\text{(clause)}$$',
    },
  ],
  examples: [
    {
      title: 'Worked example: truth table for exclusive-or pattern',
      content: [
        'Let variables be \\(P,Q\\). Consider \\(F = (P \\lor Q) \\land \\neg(P \\land Q)\\) (XOR in disguise).',
        'Run **Truth table** in the calculator with formula `(P | Q) & ~(P & Q)` — the last column is true exactly when \\(P\\) and \\(Q\\) differ.',
      ].join('\n'),
    },
    {
      title: 'Worked example: De Morgan via Equivalence',
      content: [
        'Use **Equivalence** with variables `P,Q`, formula1 `~(P & Q)`, formula2 `(~P) | (~Q)`.',
        'The engine reports equivalence — this is De Morgan for negating a conjunction.',
      ].join('\n'),
    },
    {
      title: 'Worked example: implication validity',
      content: [
        'To see whether \\(\\{(P\\land Q)\\}\\) entails \\(P\\), use **Implication validity** with formula1 `P & Q` and formula2 `P`.',
        'You should get **valid** with no counterexamples — whenever the premise holds, the conclusion holds.',
      ].join('\n'),
    },
    {
      title: 'Worked example: implication sketch',
      content: [
        'Implication \\(P\\to Q\\) is false only when \\(P\\) is true and \\(Q\\) is false:',
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
