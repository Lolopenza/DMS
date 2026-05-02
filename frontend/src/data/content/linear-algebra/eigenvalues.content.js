const eigenvaluesTheory = {
  overview:
    'Eigenvalues describe how a linear transformation stretches or flips vectors along special directions. For a square matrix \(A\), an eigenvalue \\(\\lambda\\) and a nonzero eigenvector \\(\\mathbf{v}\\) satisfy \(A\\mathbf{v}=\\lambda\\mathbf{v}\\). The eigenvalues are roots of the characteristic polynomial \\(\\det(A-\\lambda I)=0\\). This module focuses on 2×2 matrices to connect trace/determinant with the quadratic formula.',
  outcomes: [
    'State the eigenvalue equation \(A\\mathbf{v}=\\lambda\\mathbf{v}\\).',
    'Compute eigenvalues of a 2×2 matrix using trace and determinant.',
    'Recognize when eigenvalues are complex (negative discriminant).',
    'Interpret eigenvalues as scaling factors along invariant directions.',
    'Relate eigenvalues to stability and repeated application of a transformation.',
  ],
  formulas: [
    {
      title: 'Eigenvalue equation',
      content: '$$A\\mathbf{v}=\\lambda\\mathbf{v},\\quad \\mathbf{v}\\neq \\mathbf{0}$$',
    },
    {
      title: 'Characteristic equation',
      content: '$$\\det(A-\\lambda I)=0$$',
    },
    {
      title: 'Characteristic polynomial (2×2)',
      content:
        '$$A\\in\\mathbb{R}^{2\\times 2}:\\; p(\\lambda)=\\lambda^2-\\operatorname{tr}(A)\\,\\lambda+\\det(A)$$',
    },
    {
      title: 'Closed form eigenvalues (2×2)',
      content: [
        '$$',
        '\\lambda_{1,2}=\\frac{\\operatorname{tr}(A)\\pm\\sqrt{\\operatorname{tr}(A)^2-4\\det(A)}}{2}',
        '$$',
      ].join('\n'),
    },
  ],
  examples: [
    {
      title: 'Worked example: eigenvalues of an upper triangular matrix',
      content: [
        'Let',
        '$$A=\\begin{bmatrix}3 & 1\\\\0 & 2\\end{bmatrix}.$$',
        'Compute trace and determinant:',
        '$$\\operatorname{tr}(A)=3+2=5,\\quad \\det(A)=3\\cdot 2-1\\cdot 0=6.$$',
        'Discriminant:',
        '$$\\Delta=\\operatorname{tr}(A)^2-4\\det(A)=25-24=1.$$',
        'So',
        '$$\\lambda_{1,2}=\\frac{5\\pm 1}{2}\\Rightarrow \\lambda_1=3,\\;\\lambda_2=2.$$',
      ].join('\n'),
    },
    {
      title: 'Worked example: complex eigenvalues (discriminant < 0)',
      content: [
        'If a 2×2 matrix has \\(\\operatorname{tr}(A)^2-4\\det(A)<0\\), then the square root is imaginary and the eigenvalues are complex conjugates.',
        'This often corresponds to rotation-like behavior in 2D (possibly with scaling).',
      ].join('\n'),
    },
  ],
};

export default eigenvaluesTheory;

