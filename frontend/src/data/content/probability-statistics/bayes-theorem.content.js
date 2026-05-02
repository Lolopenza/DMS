const bayesTheory = {
  overview:
    'Bayes’ theorem updates a prior belief using evidence quality. It explains base-rate effects and how true/false positive rates influence posterior probability.',
  outcomes: [
    'Compute a posterior probability from a prior and likelihoods.',
    'Interpret sensitivity and false positive rate.',
    'Understand how small priors can dominate outcomes (base-rate effect).',
    'Explain why a high true-positive rate does not guarantee a high posterior when the prior is tiny.',
  ],
  formulas: [
    { title: 'Bayes’ theorem', content: '$$P(H\\mid E)=\\frac{P(E\\mid H)P(H)}{P(E)}$$' },
    {
      title: 'Expanded denominator',
      content: '$$P(E)=P(E\\mid H)P(H)+P(E\\mid \\neg H)(1-P(H))$$',
    },
  ],
  examples: [
    {
      title: 'Worked example: posterior computation (structure)',
      content: [
        'Given prior \(P(H)\\), true positive \(P(E\\mid H)\\), and false positive \(P(E\\mid\\neg H)\\), compute:',
        '$$P(H\\mid E)=\\frac{P(E\\mid H)P(H)}{P(E\\mid H)P(H)+P(E\\mid \\neg H)(1-P(H))}.$$',
      ].join('\n'),
    },
    {
      title: 'Worked example: numeric substitution',
      content: [
        'Let \(P(H)=0.01\\), \(P(E\\mid H)=0.95\\), \(P(E\\mid\\neg H)=0.08\\). Then',
        '$$P(H\\mid E)=\\frac{0.95\\cdot 0.01}{0.95\\cdot 0.01+0.08\\cdot 0.99}$$',
        '$$=\\frac{0.0095}{0.0095+0.0792}=\\frac{0.0095}{0.0887}\\approx 0.1071.$$',
      ].join('\n'),
    },
  ],
};

export default bayesTheory;

