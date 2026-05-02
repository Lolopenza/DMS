const integralsTheory = {
  overview:
    'Integration **reverses** differentiation: antiderivatives for indefinite integrals, and net signed area (when it exists) for definite integrals. The engine uses **SymPy**; results are exact symbolic expressions when possible.',
  outcomes: [
    'Obtain an antiderivative of a univariate expression.',
    'Evaluate a definite integral between numeric or symbolic bounds when integration succeeds.',
  ],
  formulas: [
    { title: 'Antiderivative', content: '$$\\int f(x)\\,dx = F(x) + C\\quad\\text{where }F\'=f$$' },
    { title: 'Fundamental Theorem (idea)', content: '$$\\int_a^b f(x)\\,dx = F(b)-F(a)$$' },
  ],
  examples: [
    {
      title: 'Worked example: indefinite',
      content: 'Try `x**2` with variable `x` — an antiderivative is `x**3/3` (up to a constant).',
    },
    {
      title: 'Worked example: definite',
      content: 'For `x` from `0` to `1`, the value is `1/2` — use **Definite** with `a=0`, `b=1`.',
    },
  ],
};

export default integralsTheory;
