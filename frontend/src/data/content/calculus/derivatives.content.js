const derivativesTheory = {
  overview:
    'The derivative measures **instantaneous rate of change** and the local slope of a graph. Symbolic differentiation applies sum, product, quotient, and chain rules automatically. This module returns exact **LaTeX**-friendly results for common smooth expressions built from powers, exp, log, and trig functions.',
  outcomes: [
    'Compute first and higher-order derivatives with respect to a chosen variable.',
    'Interpret the derivative as a new function for further analysis (e.g. critical points in the next step on paper).',
  ],
  formulas: [
    { title: 'Power rule', content: '$$\\frac{d}{dx}x^n = n x^{n-1}$$' },
    { title: 'Product / quotient', content: '$$ (uv)\' = u\'v + uv\' \\qquad \\left(\\frac{u}{v}\\right)\'=\\frac{u\'v-uv\'}{v^2}$$' },
    { title: 'Chain rule', content: '$$\\frac{d}{dx}f(g(x))=f\'(g(x))g\'(x)$$' },
  ],
  examples: [
    {
      title: 'Worked example: polynomial',
      content: 'For `x**3 + 2*x`, first derivative is `3*x**2 + 2` — try order `1` and `2` in the calculator.',
    },
  ],
};

export default derivativesTheory;
