const matricesTheory = {
  overview:
    'Matrices are rectangular arrays that represent linear maps and systems of linear equations. This module focuses on the core algebra of matrices—addition, multiplication, transpose, determinant, and inverse—so you can connect symbolic rules with concrete computation.',
  outcomes: [
    'Recognize matrix dimensions and when operations are defined.',
    'Compute sums, products, and transposes and interpret their shapes.',
    'Use determinants to reason about invertibility and volume scaling.',
    'Compute a 2×2 inverse and verify it by multiplication.',
  ],
  formulas: [
    {
      title: 'Matrix addition (same shape)',
      content:
        '$$ (A + B)_{ij} = a_{ij} + b_{ij} \\quad \\text{for } A,B \\in \\mathbb{R}^{m\\times n} $$',
    },
    {
      title: 'Matrix multiplication (compatible shapes)',
      content:
        '$$ (AB)_{ij} = \\sum_{k=1}^{n} a_{ik} b_{kj}, \\quad A\\in\\mathbb{R}^{m\\times n},\\; B\\in\\mathbb{R}^{n\\times p} $$',
    },
    {
      title: 'Transpose',
      content: '$$ (A^\\top)_{ij} = a_{ji} $$',
    },
    {
      title: 'Determinant (2×2)',
      content:
        '$$ \\det\\!\\begin{pmatrix}a & b\\\\ c & d\\end{pmatrix} = ad - bc $$',
    },
    {
      title: 'Inverse (2×2, if \\(\\det(A)\\neq 0\\))',
      content:
        '$$ \\begin{pmatrix}a & b\\\\ c & d\\end{pmatrix}^{-1} = \\frac{1}{ad-bc}\\begin{pmatrix}d & -b\\\\ -c & a\\end{pmatrix} $$',
    },
  ],
  examples: [
    {
      title: 'Worked example: multiply two 2×2 matrices',
      content: [
        'Let',
        '$$A=\\begin{bmatrix}1 & 2\\\\3 & 4\\end{bmatrix},\\quad B=\\begin{bmatrix}2 & 0\\\\1 & 2\\end{bmatrix}.$$',
        'Compute \(AB\) entry-by-entry:',
        '$$',
        '(AB)_{11}=1\\cdot 2+2\\cdot 1=4,\\quad (AB)_{12}=1\\cdot 0+2\\cdot 2=4,',
        '$$',
        '$$',
        '(AB)_{21}=3\\cdot 2+4\\cdot 1=10,\\quad (AB)_{22}=3\\cdot 0+4\\cdot 2=8.',
        '$$',
        'So',
        '$$AB=\\begin{bmatrix}4 & 4\\\\10 & 8\\end{bmatrix}.$$',
      ].join('\n'),
    },
    {
      title: 'Worked example: inverse of a 2×2 matrix',
      content: [
        'Let',
        '$$A=\\begin{bmatrix}1 & 2\\\\3 & 4\\end{bmatrix}.$$',
        'First compute the determinant:',
        '$$\\det(A)=1\\cdot 4-2\\cdot 3=-2 \\neq 0,$$',
        'so \(A\) is invertible. Using the 2×2 inverse formula:',
        '$$A^{-1}=\\frac{1}{-2}\\begin{bmatrix}4 & -2\\\\-3 & 1\\end{bmatrix}=\\begin{bmatrix}-2 & 1\\\\1.5 & -0.5\\end{bmatrix}.$$',
        'You can verify by checking \(AA^{-1}=I\\).',
      ].join('\n'),
    },
  ],
};

export default matricesTheory;

