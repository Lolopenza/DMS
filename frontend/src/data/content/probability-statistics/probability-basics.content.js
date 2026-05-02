const probabilityBasicsTheory = {
  overview:
    'Probability quantifies uncertainty. This module covers classical probability, complements, unions, and a basic independence check, connecting formulas to numeric computation.',
  outcomes: [
    'Compute P(A) from favorable/total outcomes.',
    'Use complement and union identities correctly.',
    'Perform a quick numeric independence consistency check.',
    'Understand valid ranges and sanity checks for probabilities.',
  ],
  formulas: [
    { title: 'Classical probability', content: '$$P(A)=\\frac{\\#\\text{favorable}}{\\#\\text{total}}$$' },
    { title: 'Complement', content: '$$P(A^c)=1-P(A)$$' },
    { title: 'Union', content: '$$P(A\\cup B)=P(A)+P(B)-P(A\\cap B)$$' },
    { title: 'Bounds', content: '$$0\\le P(A)\\le 1$$' },
  ],
  examples: [
    {
      title: 'Worked example: union identity',
      content: [
        'If \(P(A)=0.6\\), \(P(B)=0.5\\), and \(P(A\\cap B)=0.3\\), then',
        '$$P(A\\cup B)=0.6+0.5-0.3=0.8.$$',
      ].join('\n'),
    },
    {
      title: 'Worked example: independence check',
      content: [
        'If \(P(A)=0.6\\) and \(P(B)=0.5\\), then independence would require',
        '$$P(A\\cap B)=P(A)P(B)=0.6\\cdot 0.5=0.30.$$',
        'So if your given \(P(A\\cap B)=0.30\\), it is consistent with independence (in this simple check).',
      ].join('\n'),
    },
  ],
};

export default probabilityBasicsTheory;

