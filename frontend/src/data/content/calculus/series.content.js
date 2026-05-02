const seriesTheory = {
  overview:
    'A **Taylor (Maclaurin) expansion** approximates a smooth function near a point by a polynomial whose coefficients come from derivatives. The calculator returns a **truncated** series (order term removed) suitable for quick inspection and comparison with the original function near the expansion point.',
  outcomes: [
    'Generate a degree-truncated Taylor expansion of a univariate expression about a point.',
    'Connect series coefficients to local behavior (slope, curvature) of the graph.',
  ],
  formulas: [
    {
      title: 'Taylor polynomial (idea)',
      content:
        '$$f(x)\\approx \\sum_{k=0}^{n-1}\\frac{f^{(k)}(a)}{k!}(x-a)^k\\quad\\text{(near }x=a\\text{)}$$',
    },
  ],
  examples: [
    {
      title: 'Worked example: exp at 0',
      content: 'Use `exp(x)` about `0` with a few terms — compare to the well-known `1 + x + x^2/2 + ...` pattern.',
    },
  ],
};

export default seriesTheory;
