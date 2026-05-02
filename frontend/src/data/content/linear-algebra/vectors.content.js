const vectorsTheory = {
  overview:
    'Vectors model quantities with both magnitude and direction. In linear algebra, they are the basic objects that you add, scale, compare via dot products, and measure via norms. This module connects the geometric meaning of vectors with the coordinate computations used in applications.',
  outcomes: [
    'Add and subtract vectors component-wise and interpret the result.',
    'Compute dot products and use them to test orthogonality.',
    'Compute the Euclidean norm (magnitude) of a vector.',
    'Translate between geometric language and coordinate formulas.',
  ],
  formulas: [
    {
      title: 'Vector addition and subtraction',
      content:
        '$$\\mathbf{a}+\\mathbf{b}=(a_1+b_1,\\dots,a_n+b_n),\\quad \\mathbf{a}-\\mathbf{b}=(a_1-b_1,\\dots,a_n-b_n)$$',
    },
    {
      title: 'Scalar multiplication',
      content:
        '$$c\\mathbf{a}=(ca_1,\\dots,ca_n)$$',
    },
    {
      title: 'Dot product',
      content:
        '$$\\mathbf{a}\\cdot\\mathbf{b}=\\sum_{i=1}^{n} a_i b_i$$',
    },
    {
      title: 'Euclidean norm (magnitude)',
      content:
        '$$\\|\\mathbf{a}\\|=\\sqrt{\\mathbf{a}\\cdot\\mathbf{a}}=\\sqrt{\\sum_{i=1}^{n} a_i^2}$$',
    },
    {
      title: 'Orthogonality (right angle)',
      content:
        '$$\\mathbf{a}\\perp\\mathbf{b}\\iff \\mathbf{a}\\cdot\\mathbf{b}=0$$',
    },
  ],
  examples: [
    {
      title: 'Worked example: dot product and orthogonality',
      content: [
        'Let',
        '$$\\mathbf{a}=(1,2,3),\\quad \\mathbf{b}=(3,2,1).$$',
        'Compute the dot product:',
        '$$\\mathbf{a}\\cdot\\mathbf{b}=1\\cdot 3+2\\cdot 2+3\\cdot 1=3+4+3=10.$$',
        'Since the result is not \(0\\), the vectors are **not** orthogonal.',
      ].join('\n'),
    },
    {
      title: 'Worked example: magnitude of a vector',
      content: [
        'Let',
        '$$\\mathbf{v}=(3,-4).$$',
        'Then',
        '$$\\|\\mathbf{v}\\|=\\sqrt{3^2+(-4)^2}=\\sqrt{9+16}=\\sqrt{25}=5.$$',
      ].join('\n'),
    },
  ],
};

export default vectorsTheory;

