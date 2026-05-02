const distributionsTheory = {
  overview:
    'Discrete distributions model random variables that take countable values. This module covers binomial, Poisson, and geometric models and lets you compute PMF values and basic summary quantities.',
  outcomes: [
    'Choose an appropriate discrete distribution model.',
    'Compute PMF values at k.',
    'Interpret parameters (n, p, λ) and their constraints.',
    'Connect each model to a story (counting successes, rare events, trials until first success).',
  ],
  formulas: [
    { title: 'Binomial PMF', content: '$$P(X=k)=\\binom{n}{k}p^k(1-p)^{n-k}$$' },
    { title: 'Poisson PMF', content: '$$P(X=k)=e^{-\\lambda}\\frac{\\lambda^k}{k!}$$' },
    { title: 'Geometric PMF', content: '$$P(X=k)=(1-p)^{k-1}p,\\quad k\\ge 1$$' },
    { title: 'Binomial mean/variance', content: '$$\\mathbb{E}[X]=np,\\quad \\mathrm{Var}(X)=np(1-p)$$' },
    { title: 'Poisson mean/variance', content: '$$\\mathbb{E}[X]=\\lambda,\\quad \\mathrm{Var}(X)=\\lambda$$' },
  ],
  examples: [
    {
      title: 'Worked example: binomial interpretation',
      content: 'If you run \(n\\) independent trials with success probability \(p\\), then \(X\\sim\\text{Binomial}(n,p)\\) counts successes.',
    },
    {
      title: 'Worked example: binomial PMF at k',
      content: [
        'Let \(X\\sim\\mathrm{Binomial}(n=10,p=0.4)\\). Then',
        '$$P(X=3)=\\binom{10}{3}(0.4)^3(0.6)^7.$$',
        'This is exactly what the PMF operation evaluates numerically.',
      ].join('\n'),
    },
  ],
};

export default distributionsTheory;

