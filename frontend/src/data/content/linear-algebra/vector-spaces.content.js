const vectorSpacesTheory = {
  overview:
    'A vector space is a set of vectors equipped with addition and scalar multiplication that satisfy standard axioms. Important substructures include subspaces (closed under these operations), spans (all linear combinations of a set), and bases (minimal spanning sets). This module focuses on practical tests via rank and basis checks using a matrix of vectors.',
  outcomes: [
    'Explain span, linear independence, basis, and dimension at a high level.',
    'Represent a set of vectors as a matrix and connect rank to independence.',
    'Use rank to reason about the dimension of a span.',
    'Determine if a set of vectors can serve as a basis (in the supported checks).',
  ],
  formulas: [
    {
      title: 'Span of vectors',
      content:
        '$$\\operatorname{span}(\\mathbf{v}_1,\\dots,\\mathbf{v}_k)=\\left\\{\\sum_{i=1}^k c_i\\mathbf{v}_i\\;:\\;c_i\\in\\mathbb{R}\\right\\}$$',
    },
    {
      title: 'Linear independence (definition)',
      content:
        '$$c_1\\mathbf{v}_1+\\cdots+c_k\\mathbf{v}_k=\\mathbf{0}\\Rightarrow c_1=\\cdots=c_k=0$$',
    },
    {
      title: 'Rank–independence link (matrix of vectors)',
      content:
        '$$\\text{Vectors are independent }\\iff \\operatorname{rank}(V)=k\\;\\text{(with vectors as columns)}$$',
    },
  ],
  examples: [
    {
      title: 'Worked example: rank indicates dependence',
      content: [
        'Consider vectors in \\(\\mathbb{R}^3\\):',
        '$$\\mathbf{v}_1=(1,0,0),\\;\\mathbf{v}_2=(0,1,0),\\;\\mathbf{v}_3=(1,1,0).$$',
        'Note that',
        '$$\\mathbf{v}_3=\\mathbf{v}_1+\\mathbf{v}_2,$$',
        'so the set is linearly dependent and the span has dimension 2.',
      ].join('\n'),
    },
  ],
};

export default vectorSpacesTheory;

