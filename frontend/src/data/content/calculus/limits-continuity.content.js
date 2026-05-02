const limitsContinuityTheory = {
  overview:
    'Limits describe the value a function **approaches** as the input approaches a point or infinity. Continuity requires the limit to exist, match the function value, and behave predictably at that point. This module uses **SymPy** to evaluate standard limits, including one-sided limits and limits at ±∞.',
  outcomes: [
    'Evaluate limits of rational and transcendental expressions at a point or at infinity.',
    'Choose one-sided limits when a two-sided limit is undefined.',
    'Relate limit existence to continuity and removable discontinuities.',
  ],
  formulas: [
    { title: 'Limit notation', content: '$$\\lim_{x\\to a} f(x) \\qquad \\lim_{x\\to a^+} f(x) \\qquad \\lim_{x\\to \\infty} f(x)$$' },
    {
      title: 'Standard limit',
      content: '$$\\lim_{x\\to 0}\\frac{\\sin x}{x}=1 \\qquad \\lim_{x\\to \\infty}\\left(1+\\frac{1}{x}\\right)^x=e$$',
    },
    { title: 'Continuity at a', content: '$$f\\text{ continuous at }a\\iff \\lim_{x\\to a}f(x)=f(a)$$' },
  ],
  examples: [
    {
      title: 'Worked example: sin(x)/x at 0',
      content: 'Enter `sin(x)/x`, variable `x`, point `0`, two-sided — the limit is **1** (agrees with the standard table).',
    },
    {
      title: 'Worked example: one-sided',
      content: 'For a step-like pattern, use **from the right** or **from the left** to match the definition of a one-sided limit.',
    },
  ],
};

export default limitsContinuityTheory;
