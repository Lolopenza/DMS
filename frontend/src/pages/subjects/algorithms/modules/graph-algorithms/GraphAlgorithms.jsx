import React from 'react';
import AlgorithmsModuleShell from '../../_shared/AlgorithmsModuleShell';
import { calcGraphAlgorithms } from '../../api/graph-algorithms';

const GraphAlgorithms = () => {
  return (
    <AlgorithmsModuleShell
      title="Graph Algorithms"
      subtitle="DFS and BFS Traversal"
      intro="Explore graph traversal algorithms with depth-first and breadth-first search."
      operationOptions={[
        { value: 'dfs', label: 'Depth-First Search (DFS)' },
        { value: 'bfs', label: 'Breadth-First Search (BFS)' },
      ]}
      defaultOperation="dfs"
      fields={[
        { key: 'graph', label: 'Graph (A->B,C;B->D;C->D)', type: 'textarea', defaultValue: 'A->B,C;B->D;C->D', hint: 'Format: node->neighbor,neighbor;node->neighbor' },
        { key: 'startNode', label: 'Start Node', type: 'text', defaultValue: 'A' },
      ]}
      crossLink={{
        to: '/discrete-math/modules/graph-theory',
        label: 'Need to build a graph from a matrix? Go to Graph Theory.',
      }}
      calculate={calcGraphAlgorithms}
    />
  );
};

export default GraphAlgorithms;
