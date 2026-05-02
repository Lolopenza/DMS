const differentialEquationsTheory = {
  overview:
    'A first-order **ordinary differential equation (ODE)** relates an unknown function `y(x)` and its derivative `y′(x)`. This module solves simple **separable and linear-type** cases that SymPy can `dsolve` in closed form, using the standard form `y′ = f(x, y)` (right-hand side only).',
  outcomes: [
    'Set up a first-order ODE in the form y′ = f(x, y) and request a symbolic general solution when available.',
    'Relate ODEs to modeling (growth/decay, mixing, simple feedback).',
  ],
  formulas: [
    { title: 'First-order form', content: '$$\\frac{dy}{dx}=F(x,y)$$' },
    { title: 'Exponential model', content: '$$y\'=ky\\implies y=Ce^{kx}$$' },
  ],
  examples: [
    {
      title: 'Worked example: y′ = y',
      content: 'Right-hand side: `y` — expect a general solution involving an arbitrary constant (SymPy form).',
    },
    {
      title: 'Worked example: y′ = x + y',
      content: 'Enter `x + y` as the RHS; `y` denotes the unknown `y(x)` in the engine.',
    },
  ],
};

export default differentialEquationsTheory;
