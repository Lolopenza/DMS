const determinantsTheory = {
  overview:
    'The determinant is a scalar that summarizes key properties of a square matrix: whether it is invertible, how it scales area/volume under the associated linear transformation, and whether orientation is preserved. This module focuses on computing determinants (2×2 and 3×3) and interpreting the result.',
  outcomes: [
    'Compute det(A) for 2×2 and 3×3 matrices.',
    'Use \\(\\det(A)\\neq 0\\) to conclude that \(A\) is invertible.',
    'Interpret \\(|\\det(A)|\\) as area/volume scaling.',
    'Connect the sign of det(A) with orientation changes.',
  ],
  formulas: [
    {
      title: 'Determinant of a 2×2 matrix',
      content: '$$\\det\\!\\begin{pmatrix}a & b\\\\ c & d\\end{pmatrix} = ad - bc$$',
    },
    {
      title: 'Determinant of a 3×3 matrix (cofactor expansion along first row)',
      content: [
        '$$',
        '\\det\\!\\begin{pmatrix}',
        'a & b & c\\\\',
        'd & e & f\\\\',
        'g & h & i',
        '\\end{pmatrix}',
        '= a(ei-fh) - b(di-fg) + c(dh-eg).',
        '$$',
      ].join('\n'),
    },
    {
      title: 'Invertibility criterion',
      content: '$$\\det(A)\\neq 0 \\iff A\\text{ is invertible}$$',
    },
  ],
  examples: [
    {
      title: 'Worked example: det(A) for a 2×2 matrix',
      content: [
        'Let',
        '$$A=\\begin{bmatrix}4 & 2\\\\1 & 3\\end{bmatrix}.$$',
        'Compute',
        '$$\\det(A)=4\\cdot 3-2\\cdot 1=12-2=10.$$',
        'Since \(\\det(A)\\neq 0\\), the matrix is invertible.',
      ].join('\n'),
    },
    {
      title: 'Worked example: area scaling intuition',
      content: [
        'If \(A\\) represents a linear map in \\(\\mathbb{R}^2\\), then \\(|\\det(A)|\\) is the factor by which areas are scaled.',
        'For the matrix above, \\(|\\det(A)|=10\\), so areas scale by **10×**.',
      ].join('\n'),
    },
  ],
};

export default determinantsTheory;

