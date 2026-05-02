import { calcAdjacencyMatrix } from '../../api/adjacency-matrix.js';
import ModuleExperience from '../../../../../components/module/ModuleExperience.jsx';
import adjacencyMatrixContent from '../../../../../data/content/discrete-math/adjacency-matrix.content.js';

/**
 * Adjacency Matrix module - migrated to use CytoscapeGraph + CalculatorCard.
 * Before: 363 lines with manual Cytoscape initialization.
 * After: ~200 lines with reusable components.
 */

const OPERATIONS = [
  { value: 'info', label: 'Graph Info', hint: 'Get basic graph statistics' },
  { value: 'validate', label: 'Validate Matrix', hint: 'Check if matrix is square and symmetric' },
  { value: 'batch_analysis', label: 'Degree Analysis', hint: 'Analyze degree of each vertex' },
  { value: 'to_edge_list', label: 'To Edge List', hint: 'Convert matrix to edge list' },
  { value: 'to_adjacency_list', label: 'To Adjacency List', hint: 'Convert matrix to adjacency list' },
];

function parseMatrix(raw) {
  const rows = String(raw || '')
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const matrix = rows.map((line) =>
    line
      .split(/[\s,;]+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => Number(item)),
  );
  return matrix;
}

const SAMPLE_MATRIX = [
  [0, 1, 1, 0],
  [1, 0, 1, 1],
  [1, 1, 0, 1],
  [0, 1, 1, 0],
];

const adjacencyMatrixConfig = {
  id: 'adjacency-matrix',
  eyebrow: 'Discrete Mathematics',
  title: 'Adjacency Matrix',
  subtitle: 'Analyze graphs using matrix representation and convert formats.',
  theory: adjacencyMatrixContent,
  practice: {
    title: 'Matrix Calculator',
    description: 'Edit a matrix in a grid (easy) or paste raw text (advanced), then choose an operation.',
    operationLabel: 'Operation',
    submitLabel: 'Calculate',
    loadingLabel: 'Calculating...',
    calculate: calcAdjacencyMatrix,
    buildPayload: ({ operation, values }) => {
      const matrix = parseMatrix(values.matrixText);
      const directed = values.directed === 'true';

      if (operation === 'info') {
        return {
          operation,
          graph: {
            matrix,
            directed,
            weighted: false,
          },
        };
      }

      return {
        operation,
        matrix,
        directed,
      };
    },
    mapResult: (data) => data.result ?? data,
    operations: OPERATIONS.map((op, idx) => ({ ...op, default: idx === 0 })),
    fields: [
      {
        name: 'matrixInputMode',
        label: 'Input mode',
        type: 'select',
        defaultValue: 'grid',
        options: [
          { value: 'grid', label: 'Interactive grid (recommended)' },
          { value: 'text', label: 'Paste as text' },
        ],
        hint: 'Use the grid for fast edits. Switch to text if you want to paste from elsewhere.',
        span: 'full',
      },
      {
        name: 'matrixSize',
        label: 'Matrix size',
        type: 'number',
        defaultValue: '4',
        showWhen: [],
        disabled: true,
      },
      {
        name: 'matrixText',
        label: 'Adjacency matrix',
        smartType: 'matrix-grid',
        type: 'textarea',
        rows: 7,
        defaultValue: '0 1 1 0\n1 0 1 1\n1 1 0 1\n0 1 1 0',
        hint: 'In grid mode, edit cells below. In text mode, one row per line; spaces or commas between entries.',
        required: true,
        span: 'full',
        smartOptions: {
          modeField: 'matrixInputMode',
          textModeValue: 'text',
          sizeField: 'matrixSize',
          directedField: 'directed',
          mirrorUndirected: true,
          directedTrueValue: 'true',
          valueFormat: 'matrix_lines',
          square: true,
          sampleMatrix: SAMPLE_MATRIX,
          binaryActions: true,
          textRows: 7,
        },
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
    ],
  },
};

export default function AdjacencyMatrix() {
  return <ModuleExperience config={adjacencyMatrixConfig} />;
}
