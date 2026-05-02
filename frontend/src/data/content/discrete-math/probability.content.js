const probabilityIntroContent = {
  overview:
    'Probability quantifies uncertainty. In the classical model with equally likely outcomes, the probability of an event is the ratio of favorable outcomes to total outcomes in the sample space. A correct setup identifies the sample space and counts favorable outcomes.',
  outcomes: [
    'Translate a word problem into favorable/total counting.',
    'Compute a probability as a rational number and as a decimal.',
    'Check sanity: probability is always between 0 and 1.',
    'Use complements to simplify counting when it is easier to count “not A”.',
  ],
  formulas: [
    { title: 'Classical Probability', content: '$$P(A)=\\frac{\\#\\text{favorable}}{\\#\\text{total}}$$' },
    { title: 'Complement rule', content: '$$P(A^c)=1-P(A)$$' },
  ],
  examples: [
    {
      title: 'Worked example: simple probability',
      content:
        'If an experiment has 3 favorable outcomes out of 10 equally likely outcomes, then \(P(A)=3/10=0.3\\).',
    },
    {
      title: 'Worked example: complement shortcut',
      content: [
        'If the probability of an event is hard to count directly, compute its complement.',
        'For example, if \(P(A)=0.2\\), then',
        '$$P(A^c)=1-0.2=0.8.$$',
      ].join('\n'),
    },
  ],
};

export default probabilityIntroContent;

