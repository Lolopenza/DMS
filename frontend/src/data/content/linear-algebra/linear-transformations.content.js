const linearTransformationsTheory = {
  overview:
    'A linear transformation is a function \(T:\\mathbb{R}^n\\to\\mathbb{R}^m\) that preserves vector addition and scalar multiplication. Every linear transformation can be represented by a matrix \(A\) such that \(T(\\mathbf{x})=A\\mathbf{x}\\). This module focuses on applying a transformation matrix to a vector and interpreting the result geometrically.',
  outcomes: [
    'State the linearity properties \(T(\\mathbf{u}+\\mathbf{v})=T(\\mathbf{u})+T(\\mathbf{v})\) and \(T(c\\mathbf{u})=cT(\\mathbf{u})\).',
    'Compute \(A\\mathbf{x}\\) for a matrix \(A\) and vector \\(\\mathbf{x}\\).',
    'Track dimension compatibility for matrix–vector multiplication.',
    'Interpret common 2D transformations (reflections, scalings, rotations) via matrices.',
  ],
  formulas: [
    {
      title: 'Matrix representation',
      content: '$$T(\\mathbf{x})=A\\mathbf{x}$$',
    },
    {
      title: 'Matrix–vector multiplication',
      content:
        '$$ (A\\mathbf{x})_i=\\sum_{j=1}^{n} a_{ij}x_j,\\quad A\\in\\mathbb{R}^{m\\times n},\\;\\mathbf{x}\\in\\mathbb{R}^n $$',
    },
    {
      title: 'Linearity',
      content: [
        '$$T(\\mathbf{u}+\\mathbf{v})=T(\\mathbf{u})+T(\\mathbf{v}),\\qquad T(c\\mathbf{u})=cT(\\mathbf{u})$$',
      ].join('\n'),
    },
  ],
  examples: [
    {
      title: 'Worked example: reflection across the x-axis',
      content: [
        'Consider the transformation matrix',
        '$$A=\\begin{bmatrix}1 & 0\\\\0 & -1\\end{bmatrix}$$',
        'and input vector',
        '$$\\mathbf{x}=\\begin{bmatrix}2\\\\3\\end{bmatrix}.$$',
        'Compute',
        '$$A\\mathbf{x}=\\begin{bmatrix}1 & 0\\\\0 & -1\\end{bmatrix}\\begin{bmatrix}2\\\\3\\end{bmatrix}=\\begin{bmatrix}2\\\\-3\\end{bmatrix}.$$',
        'Geometrically, this reflects points across the x-axis.',
      ].join('\n'),
    },
  ],
};

export default linearTransformationsTheory;

