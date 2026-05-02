const graphTheoryContent = {
  overview:
    'Graphs model relationships between objects using vertices and edges. This module focuses on common representations (edge lists / adjacency lists) and basic algorithms and properties such as BFS/DFS traversal, connectivity, cycle checks, and shortest-path distances. The emphasis is on translating between representations and understanding what each algorithm returns.',
  outcomes: [
    'Represent graphs using edge lists and adjacency lists.',
    'Run BFS and DFS traversals from a start node.',
    'Compute connected components and detect cycles.',
    'Understand shortest-path distances at a high level (Dijkstra).',
    'Recognize when edge weights matter (Dijkstra/Kruskal).',
  ],
  formulas: [
    { title: 'Handshake lemma (undirected)', content: '$$\\sum_{v \\in V} \\deg(v) = 2|E|$$' },
    { title: 'Traversal complexity', content: '$$\\text{BFS/DFS runs in }O(|V|+|E|)$$' },
  ],
  examples: [
    {
      title: 'Worked example: BFS intuition',
      content:
        'BFS explores neighbors first, then neighbors-of-neighbors. In unweighted graphs this corresponds to increasing distance from the start node.',
    },
    {
      title: 'Worked example: degrees and the handshake lemma',
      content: [
        'Suppose an undirected graph has degrees \(\\deg(v)=\\{3,2,2,1\\}\\). Then',
        '$$\\sum_{v\\in V}\\deg(v)=3+2+2+1=8=2|E|\\Rightarrow |E|=4.$$',
      ].join('\n'),
    },
  ],
};

export default graphTheoryContent;

