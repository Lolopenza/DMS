const conditionalProbabilityTheory = {
  overview:
    'Conditional probability updates the probability of an event given that another event occurred. The law of total probability aggregates across mutually exclusive cases using priors and likelihoods.',
  outcomes: [
    'Compute P(A|B) from P(A∩B) and P(B).',
    'Apply the law of total probability to compute P(B).',
    'Interpret inputs as valid probabilities.',
    'Recognize that conditional probabilities require P(B) > 0.',
  ],
  formulas: [
    { title: 'Conditional probability', content: '$$P(A\\mid B)=\\frac{P(A\\cap B)}{P(B)}$$' },
    { title: 'Total probability', content: '$$P(B)=\\sum_i P(B\\mid A_i)P(A_i)$$' },
    { title: 'Multiplication rule', content: '$$P(A\\cap B)=P(A\\mid B)P(B)$$' },
  ],
  examples: [
    {
      title: 'Worked example: conditional probability',
      content: [
        'If \(P(A\\cap B)=0.12\\) and \(P(B)=0.30\\), then',
        '$$P(A\\mid B)=\\frac{0.12}{0.30}=0.4.$$',
      ].join('\n'),
    },
    {
      title: 'Worked example: total probability (two cases)',
      content: [
        'Suppose \(P(A_1)=0.7\\), \(P(A_2)=0.3\\), and \(P(B\\mid A_1)=0.2\\), \(P(B\\mid A_2)=0.8\\). Then:',
        '$$P(B)=0.2\\cdot 0.7 + 0.8\\cdot 0.3 = 0.14+0.24=0.38.$$',
      ].join('\n'),
    },
  ],
};

export default conditionalProbabilityTheory;

