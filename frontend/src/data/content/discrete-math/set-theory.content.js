const setTheoryContent = {
  overview:
    'Set theory provides a language for collections of objects and operations on them. This module covers standard operations (union, intersection, difference, complement), basic properties (emptiness, finiteness, cardinality), and relation analysis (reflexive, symmetric, transitive) via closures. Relations are treated as sets of ordered pairs.',
  outcomes: [
    'Perform common set operations and interpret results.',
    'Compute basic set properties such as cardinality.',
    'Represent relations as sets of ordered pairs.',
    'Check relation properties and compute standard closures.',
    'Distinguish functions from general relations and interpret domain/codomain constraints.',
  ],
  formulas: [
    { title: 'Union', content: '$$A \\cup B = \\{x \\mid x \\in A \\;\\text{or}\\; x \\in B\\}$$' },
    { title: 'Intersection', content: '$$A \\cap B = \\{x \\mid x \\in A \\;\\text{and}\\; x \\in B\\}$$' },
    { title: 'Complement', content: '$$A^c = U \\setminus A$$' },
    { title: 'Difference', content: '$$A\\setminus B=\\{x\\in A:\\;x\\notin B\\}$$' },
    { title: 'Cartesian product', content: '$$A\\times B=\\{(a,b):a\\in A,\\; b\\in B\\}$$' },
    { title: 'Transitive closure (idea)', content: '$$R^+=\\text{smallest transitive relation containing }R$$' },
  ],
  examples: [
    {
      title: 'Worked example: union and intersection',
      content:
        'If \(A=\\{1,2,3\\}\\) and \(B=\\{2,3,4\\}\\), then \(A\\cup B=\\{1,2,3,4\\}\\) and \(A\\cap B=\\{2,3\\}\\).',
    },
    {
      title: 'Worked example: relation properties',
      content: [
        'Let \(U=\\{1,2,3\\}\\) and \(R=\\{(1,1),(2,2),(3,3),(1,2)\\}\\).',
        'Then \(R\\) is **reflexive** (all \((x,x)\\) are present).',
        'It is **not symmetric** because \((1,2)\\in R\\) but \((2,1)\\notin R\\).',
      ].join('\n'),
    },
  ],
};

export default setTheoryContent;

