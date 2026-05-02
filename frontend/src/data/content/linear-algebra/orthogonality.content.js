const orthogonalityTheory = {
  overview:
    'Orthogonality formalizes the idea of “perpendicular” vectors using the dot product. Two vectors are orthogonal if their dot product is zero. Projections decompose a vector into components parallel and perpendicular to a reference direction and are foundational in least squares, geometry, and Gram–Schmidt orthonormalization.',
  outcomes: [
    'Compute dot products and interpret the sign and magnitude.',
    'Test whether two vectors are orthogonal using \\(\\mathbf{a}\\cdot\\mathbf{b}=0\\).',
    'Compute the projection of a vector onto another vector.',
    'Understand how projections relate to “closest point” problems.',
    'Recognize that projecting onto a zero vector is undefined (division by zero).',
  ],
  formulas: [
    {
      title: 'Dot product',
      content: '$$\\mathbf{a}\\cdot\\mathbf{b}=\\sum_{i=1}^{n} a_i b_i$$',
    },
    {
      title: 'Orthogonality test',
      content: '$$\\mathbf{a}\\perp\\mathbf{b}\\iff \\mathbf{a}\\cdot\\mathbf{b}=0$$',
    },
    {
      title: 'Projection of v onto u',
      content: [
        '$$',
        '\\operatorname{proj}_{\\mathbf{u}}(\\mathbf{v})=\\frac{\\mathbf{v}\\cdot\\mathbf{u}}{\\mathbf{u}\\cdot\\mathbf{u}}\\,\\mathbf{u}',
        '$$',
      ].join('\n'),
    },
    {
      title: 'Angle via dot product (optional)',
      content: '$$\\mathbf{a}\\cdot\\mathbf{b}=\\|\\mathbf{a}\\|\\,\\|\\mathbf{b}\\|\\cos\\theta$$',
    },
  ],
  examples: [
    {
      title: 'Worked example: projection in R²',
      content: [
        'Let',
        '$$\\mathbf{v}=(3,4),\\quad \\mathbf{u}=(1,0).$$',
        'Compute the factor:',
        '$$\\frac{\\mathbf{v}\\cdot\\mathbf{u}}{\\mathbf{u}\\cdot\\mathbf{u}}=\\frac{3\\cdot 1+4\\cdot 0}{1\\cdot 1+0\\cdot 0}=3.$$',
        'So the projection is:',
        '$$\\operatorname{proj}_{\\mathbf{u}}(\\mathbf{v})=3\\,(1,0)=(3,0).$$',
      ].join('\n'),
    },
    {
      title: 'Worked example: orthogonality check',
      content: [
        'Let \(\\mathbf{a}=(1,2)\\) and \(\\mathbf{b}=(2,-1)\\).',
        'Compute:',
        '$$\\mathbf{a}\\cdot\\mathbf{b}=1\\cdot 2+2\\cdot(-1)=2-2=0.$$',
        'Therefore the vectors are orthogonal: \(\\mathbf{a}\\perp\\mathbf{b}\\).',
      ].join('\n'),
    },
  ],
};

export default orthogonalityTheory;

