const linearSystemsTheory = {
  overview:
    'A linear system is a collection of linear equations that share the same unknowns. In matrix form, the system \(A\\mathbf{x}=\\mathbf{b}\\) organizes coefficients into a matrix \(A\), unknowns into a vector \\(\\mathbf{x}\\), and the right-hand side into \\(\\mathbf{b}\\). The main questions are: does a solution exist, is it unique, and how can we compute it efficiently?',
  outcomes: [
    'Rewrite a 2×2 system as \(A\\mathbf{x}=\\mathbf{b}\\).',
    'Use Gaussian elimination steps to reason about solutions.',
    'Determine when a unique solution exists via \\(\\det(A)\\neq 0\\).',
    'Solve a 2×2 system and verify the solution by substitution.',
    'Connect uniqueness to invertibility of \(A\) and to geometric intersection of lines.',
  ],
  formulas: [
    {
      title: 'Matrix form',
      content: '$$A\\mathbf{x}=\\mathbf{b}$$',
    },
    {
      title: '2×2 determinant and uniqueness',
      content:
        '$$A=\\begin{pmatrix}a & b\\\\ c & d\\end{pmatrix},\\quad \\det(A)=ad-bc,\\quad \\det(A)\\neq 0\\Rightarrow \\text{unique solution}$$',
    },
    {
      title: 'Cramer’s rule (2×2)',
      content: [
        '$$',
        '\\begin{pmatrix}a & b\\\\ c & d\\end{pmatrix}\\begin{pmatrix}x\\\\y\\end{pmatrix}=\\begin{pmatrix}e\\\\f\\end{pmatrix}',
        '\\quad\\Rightarrow\\quad',
        'x=\\frac{ed-bf}{ad-bc},\\; y=\\frac{af-ec}{ad-bc}',
        '$$',
      ].join('\n'),
    },
    {
      title: 'Elimination step (row operation idea)',
      content: '$$\\text{Replace }R_i\\leftarrow R_i - cR_j\\text{ to eliminate a coefficient.}$$',
    },
  ],
  examples: [
    {
      title: 'Worked example: solve a 2×2 system',
      content: [
        'Solve',
        '$$\\begin{cases}2x+y=5\\\\x-y=1\\end{cases}$$',
        'Write \(A\\mathbf{x}=\\mathbf{b}\\):',
        '$$A=\\begin{bmatrix}2 & 1\\\\1 & -1\\end{bmatrix},\\; \\mathbf{b}=\\begin{bmatrix}5\\\\1\\end{bmatrix}.$$',
        'Add the second equation to the first to eliminate \(y\\):',
        '$$ (2x+y)+(x-y)=5+1\\Rightarrow 3x=6\\Rightarrow x=2.$$',
        'Substitute into \(x-y=1\\): \(2-y=1\\Rightarrow y=1\\).',
        'So',
        '$$\\mathbf{x}=\\begin{bmatrix}2\\\\1\\end{bmatrix}.$$',
      ].join('\n'),
    },
    {
      title: 'Worked example: uniqueness from determinant',
      content: [
        'Let',
        '$$A=\\begin{bmatrix}2 & 1\\\\1 & -1\\end{bmatrix}.$$',
        'Compute',
        '$$\\det(A)=2\\cdot(-1)-1\\cdot 1=-3\\neq 0,$$',
        'so the system has a **unique** solution for every \\(\\mathbf{b}\\).',
      ].join('\n'),
    },
  ],
};

export default linearSystemsTheory;

