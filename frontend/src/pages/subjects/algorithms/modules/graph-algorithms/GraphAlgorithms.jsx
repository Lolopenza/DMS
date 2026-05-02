import React from 'react';
import AlgorithmsModuleShell from '../../_shared/AlgorithmsModuleShell.jsx';
import { calcAlgorithms } from '../../../../../api.js';

/**
 * Graph Algorithms module - migrated to premium AlgorithmsModuleShell.
 * Before: Used old ModuleCard/ModulePage.
 * After: Uses CalculatorCard + useCalculator + StepByStepRenderer + ComplexityBadge.
 */
export default function GraphAlgorithms() {
  return (
    <AlgorithmsModuleShell
      module="graph-algorithms"
      title="Graph Algorithms"
      subtitle="Explore graph traversal algorithms"
      description="Master fundamental graph traversal algorithms including DFS and BFS. Visualize how these algorithms explore nodes and edges, and understand their applications in networks, dependency graphs, and pathfinding."
      operationOptions={[
        { 
          value: 'dfs', 
          label: 'Depth-First Search (DFS)', 
          hint: 'Explores as far as possible along each branch before backtracking. Uses stack (recursion). O(V + E) time.' 
        },
        { 
          value: 'bfs', 
          label: 'Breadth-First Search (BFS)', 
          hint: 'Explores all neighbors at current depth before moving deeper. Uses queue. O(V + E) time, finds shortest path in unweighted graphs.' 
        },
      ]}
      defaultOperation="dfs"
      fields={[
        { 
          key: 'graph', 
          label: 'Graph Adjacency List', 
          type: 'textarea', 
          defaultValue: 'A->B,C;B->D;C->D;D->', 
          hint: 'Format: node->neighbor1,neighbor2;node->neighbors. Example: A->B,C;B->D means A connects to B and C, B connects to D' 
        },
        { 
          key: 'startNode', 
          label: 'Start Node', 
          type: 'text', 
          defaultValue: 'A',
          hint: 'The node where traversal/search begins'
        },
      ]}
      calculate={calcAlgorithms}
    />
  );
}
