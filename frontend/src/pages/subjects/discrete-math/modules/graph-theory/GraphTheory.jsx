import { calcGraphTheory } from '../../api/graph-theory.js';
import ModuleExperience from '../../../../../components/module/ModuleExperience.jsx';
import graphTheoryContent from '../../../../../data/content/discrete-math/graph-theory.content.js';

/**
 * Graph Theory module - migrated to use CytoscapeGraph + CalculatorCard.
 * Before: 264 lines with manual Cytoscape initialization.
 * After: ~120 lines with reusable components.
 */

const OPERATIONS = [
  { value: 'bfs', label: 'BFS', hint: 'Breadth-first traversal from a start node.' },
  { value: 'dfs', label: 'DFS', hint: 'Depth-first traversal from a start node.' },
  { value: 'connected_components', label: 'Connected Components', hint: 'List connected components of the graph.' },
  { value: 'has_cycle', label: 'Cycle Check', hint: 'Detect whether the graph contains a cycle.' },
  { value: 'dijkstra', label: 'Dijkstra distances', hint: 'Compute shortest-path distances from a start node (requires weights for meaningful results).' },
  { value: 'kruskal', label: 'Kruskal MST', hint: 'Compute a minimum spanning tree for an undirected weighted graph.' },
];

const INPUT_MODES = [
  {
    value: 'edge_list',
    label: 'Edge list (recommended)',
    hint: 'Paste one edge per line: "A B" or "A B 2.5" (optional weight).',
    default: true,
  },
  {
    value: 'adjacency_list',
    label: 'Adjacency list',
    hint: 'Format: node: neighbor1, neighbor2. Optional weights: B(2.5).',
  },
];

function normalizeNodeLabel(label) {
  return String(label || '').trim();
}

function parseEdgeList(raw) {
  const lines = String(raw || '')
    .split('\n')
    .map((line) => line.replace(/#.*$/, '').trim())
    .filter(Boolean);

  const edges = [];
  lines.forEach((line) => {
    // Allow separators: space, comma, semicolon, tab
    const parts = line.split(/[\s,;]+/).map((p) => p.trim()).filter(Boolean);
    const u = normalizeNodeLabel(parts[0]);
    const v = normalizeNodeLabel(parts[1]);
    if (!u || !v) return;
    const wRaw = parts[2];
    const weight = typeof wRaw === 'string' && wRaw.length ? Number(wRaw) : undefined;
    edges.push({
      u,
      v,
      ...(Number.isFinite(weight) ? { weight } : {}),
    });
  });

  return edges;
}

function parseWeightedNeighbor(token) {
  const trimmed = String(token || '').trim();
  if (!trimmed) return null;

  // Accept formats:
  // - B
  // - B(2.5)
  // - B (2.5)
  const match = trimmed.match(/^(.+?)(?:\s*\(\s*(-?\d+(?:\.\d+)?)\s*\))?$/);
  if (!match) return { v: trimmed };
  const v = normalizeNodeLabel(match[1]);
  const weight = typeof match[2] === 'string' ? Number(match[2]) : undefined;
  if (!v) return null;
  return Number.isFinite(weight) ? { v, weight } : { v };
}

function parseAdjacencyList(raw) {
  const lines = String(raw || '')
    .split('\n')
    .map((line) => line.replace(/#.*$/, '').trim())
    .filter(Boolean);

  const adj = {};
  lines.forEach((line) => {
    const [nodeRaw, targetsRaw] = line.split(':');
    const node = normalizeNodeLabel(nodeRaw);
    if (!node) return;

    const targets = String(targetsRaw || '').trim();
    if (!targets) {
      adj[node] = [];
      return;
    }

    // Allow commas OR whitespace as separators.
    const tokens = targets.split(/[,\s]+/).map((t) => t.trim()).filter(Boolean);
    adj[node] = tokens.map(parseWeightedNeighbor).filter(Boolean);
  });

  return adj;
}

function adjacencyToGraphData(adj, directed) {
  const vertices = new Set();
  const edges = [];

  Object.entries(adj || {}).forEach(([u, neighbors]) => {
    vertices.add(String(u));
    (neighbors || []).forEach((neighbor) => {
      if (!neighbor) return;
      const vv = String(neighbor.v);
      vertices.add(vv);
      edges.push({ u: String(u), v: vv, ...(typeof neighbor.weight === 'number' ? { weight: neighbor.weight } : {}) });
    });
  });

  const weighted = edges.some((edge) => typeof edge.weight === 'number');
  return {
    vertices: Array.from(vertices),
    edges,
    directed: Boolean(directed),
    weighted,
  };
}

function edgeListToGraphData(edgeRows, directed) {
  const vertices = new Set();
  const edges = [];

  (edgeRows || []).forEach((row) => {
    if (!row) return;
    const u = normalizeNodeLabel(row.u);
    const v = normalizeNodeLabel(row.v);
    if (!u || !v) return;
    vertices.add(u);
    vertices.add(v);
    edges.push({
      u,
      v,
      ...(typeof row.weight === 'number' ? { weight: row.weight } : {}),
    });
  });

  const weighted = edges.some((edge) => typeof edge.weight === 'number');
  return {
    vertices: Array.from(vertices),
    edges,
    directed: Boolean(directed),
    weighted,
  };
}

const graphTheoryConfig = {
  id: 'graph-theory',
  eyebrow: 'Discrete Mathematics',
  title: 'Graph Theory',
  subtitle: 'Work with adjacency lists and compute basic graph properties.',
  theory: graphTheoryContent,
  practice: {
    title: 'Graph Calculator',
    description: 'Paste edges or an adjacency list. Edge list is the easiest format for quick experiments.',
    operationLabel: 'Operation',
    submitLabel: 'Calculate',
    loadingLabel: 'Calculating...',
    calculate: calcGraphTheory,
    buildPayload: ({ operation, values }) => {
      const directed = values.directed === 'true';
      const inputMode = values.inputMode || 'edge_list';
      const graph = inputMode === 'edge_list'
        ? edgeListToGraphData(parseEdgeList(values.edgeList), directed)
        : adjacencyToGraphData(parseAdjacencyList(values.adjacencyList), directed);

      if (!graph.vertices.length) {
        throw new Error('Please paste a graph first (at least one edge or one adjacency line).');
      }

      if (['bfs', 'dfs', 'dijkstra'].includes(operation) && !String(values.startNode || '').trim()) {
        throw new Error('Start node is required for this operation.');
      }

      return {
        operation,
        graph,
        start_node: values.startNode ? String(values.startNode).trim() : undefined,
        end_node: values.endNode ? String(values.endNode) : undefined,
      };
    },
    mapResult: (data) => data.result ?? data,
    operations: OPERATIONS.map((op, idx) => ({ ...op, default: idx === 0 })),
    fields: [
      {
        name: 'inputMode',
        label: 'Input format',
        type: 'select',
        defaultValue: 'edge_list',
        options: INPUT_MODES.map((m) => ({ value: m.value, label: m.label })),
        hint: INPUT_MODES.find((m) => m.value === 'edge_list')?.hint,
        span: 'full',
      },
      {
        name: 'edgeList',
        label: 'Edge list',
        smartType: 'edge-list',
        type: 'textarea',
        rows: 7,
        defaultValue: 'A B\nA C\nB C 2\nC D 1',
        hint: 'One edge per line: "u v" or "u v weight". Separators: space / comma / semicolon. Use # for comments.',
        required: true,
        visibleWhen: (v) => v.inputMode === 'edge_list',
        span: 'full',
        smartOptions: {
          fromKey: 'edgeFrom',
          toKey: 'edgeTo',
          weightKey: 'edgeWeight',
          errorKey: 'edgeBuilderError',
        },
      },
      // Internal builder state (kept in ModuleExperience values)
      { name: 'edgeFrom', label: 'From', type: 'text', defaultValue: '', showWhen: [], disabled: true },
      { name: 'edgeTo', label: 'To', type: 'text', defaultValue: '', showWhen: [], disabled: true },
      { name: 'edgeWeight', label: 'Weight', type: 'text', defaultValue: '', showWhen: [], disabled: true },
      { name: 'edgeBuilderError', label: 'Edge builder error', type: 'text', defaultValue: '', showWhen: [], disabled: true },
      {
        name: 'adjacencyList',
        label: 'Adjacency list',
        type: 'textarea',
        rows: 7,
        defaultValue: 'A: B, C\nB: C(2)\nC: D(1)\nD:',
        hint: 'Format: node: neighbor1, neighbor2. Optional weights: B(2.5). Use # for comments.',
        required: true,
        visibleWhen: (v) => v.inputMode === 'adjacency_list',
        span: 'full',
      },
      {
        name: 'directed',
        label: 'Directed graph',
        type: 'select',
        defaultValue: 'false',
        options: [
          { value: 'false', label: 'No (undirected)' },
          { value: 'true', label: 'Yes (directed)' },
        ],
      },
      {
        name: 'startNode',
        label: 'Start node',
        type: 'text',
        defaultValue: 'A',
        hint: 'Used for BFS/DFS/Dijkstra only. Must match a node label in the adjacency list.',
        showWhen: ['bfs', 'dfs', 'dijkstra'],
      },
      {
        name: 'endNode',
        label: 'End node',
        type: 'text',
        defaultValue: 'D',
        hint: 'Reserved for future path reconstruction.',
        showWhen: [],
      },
    ],
  },
};

export default function GraphTheory() {
  return <ModuleExperience config={graphTheoryConfig} />;
}
