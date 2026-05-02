const multivariableTheory = {
  overview:
    'For functions of **several variables**, partial derivatives hold other variables fixed. The calculator differentiates with respect to one chosen variable after you list all symbols used in the expression (e.g. `x` and `y`).',
  outcomes: [
    'Compute a first partial derivative of a multivariable expression.',
    'Keep track of which variables are independent in the model (e.g. `x,y` in a surface `x**2*y + y**3`).',
  ],
  formulas: [
    { title: 'Partial derivative', content: '$$\\frac{\\partial f}{\\partial x}(x,y)=\\lim_{h\\to 0}\\frac{f(x+h,y)-f(x,y)}{h}$$' },
    { title: 'Gradient (2D, idea)', content: '$$\\nabla f=\\left(\\frac{\\partial f}{\\partial x},\\frac{\\partial f}{\\partial y}\\right)$$' },
  ],
  examples: [
    {
      title: 'Worked example: partial w.r.t. x',
      content: 'Expression `x**2 * y + y`, variables `x,y`, wrt `x` → `2*x*y`.',
    },
  ],
};

export default multivariableTheory;
