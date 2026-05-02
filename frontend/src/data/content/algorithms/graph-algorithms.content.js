const graphAlgorithmsTheory = {
  overview:
    'Graph algorithms explore relationships between nodes and edges. This module focuses on traversal (DFS/BFS) and shortest paths (Dijkstra) with step-by-step visualization.',
  outcomes: [
    'Differentiate DFS and BFS exploration strategies.',
    'Use BFS to find shortest paths in unweighted graphs.',
    'Understand Dijkstra’s relaxation idea for weighted graphs.',
    'Recognize when negative edges break Dijkstra’s assumptions.',
  ],
  formulas: [
    { title: 'Traversal complexity', content: '$$\\text{DFS/BFS: }O(V+E)$$' },
    { title: 'Dijkstra (typical)', content: '$$O((V+E)\\log V)\\text{ with a priority queue}$$' },
    { title: 'Relaxation step', content: '$$\\text{if }dist[v]>dist[u]+w(u,v)\\text{ then update }dist[v]\\leftarrow dist[u]+w(u,v)$$' },
  ],
  examples: [
    {
      title: 'Worked example: BFS wave expansion',
      content:
        'Starting from node A, BFS visits all neighbors of A first (distance 1), then neighbors of those nodes (distance 2), etc. This guarantees shortest path lengths in unweighted graphs.',
    },
    {
      title: 'Worked example: Dijkstra relaxation intuition',
      content: [
        'When the next closest node \(u\\) is finalized, try improving each neighbor \(v\\) by the path through \(u\\):',
        '$$dist[v]\\;\\stackrel{?}{>}\\;dist[u]+w(u,v).$$',
        'If yes, update \(dist[v]\\) and the predecessor pointer.',
      ].join('\n'),
    },
  ],
};

export default graphAlgorithmsTheory;

