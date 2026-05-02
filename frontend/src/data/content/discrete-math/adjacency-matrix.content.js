const adjacencyMatrixContent = {
  overview:
    'An adjacency matrix is a square matrix that encodes edges between vertices. This module helps you edit and validate adjacency matrices, compute degree statistics, and convert between matrix and list representations. It is especially useful for small/medium graphs where matrix operations are convenient.',
  outcomes: [
    'Represent a graph as an adjacency matrix.',
    'Validate squareness and symmetry (for undirected graphs).',
    'Compute degree-related summaries from the matrix.',
    'Convert to edge list and adjacency list formats.',
    'Interpret diagonal entries and symmetry in terms of loops and directionality.',
  ],
  formulas: [
    { title: 'Adjacency matrix entry', content: '$$A_{ij}=\\begin{cases}1 & (i,j)\\in E\\\\0 & \\text{otherwise}\\end{cases}$$' },
    { title: 'Degree from adjacency matrix (undirected, simple)', content: '$$\\deg(i)=\\sum_{j} A_{ij}$$' },
  ],
  examples: [
    {
      title: 'Worked example: symmetry',
      content:
        'For an undirected graph, the adjacency matrix is symmetric: \(A_{ij}=A_{ji}\\).',
    },
    {
      title: 'Worked example: compute degrees',
      content: [
        'If row 1 of \(A\\) is \([0,1,1,0]\\), then vertex 1 has',
        '$$\\deg(1)=0+1+1+0=2.$$',
        'Repeating this for each row gives all vertex degrees.',
      ].join('\n'),
    },
  ],
};

export default adjacencyMatrixContent;

