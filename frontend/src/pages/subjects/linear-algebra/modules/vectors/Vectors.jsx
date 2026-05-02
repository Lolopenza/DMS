import { calcVectors } from '../../api/vectors.js';
import { parseVector } from '../../../../../utils/parsers.js';
import { LinearAlgebraResultRenderer } from '../../../../../components/module/ResultRenderers.jsx';
import vectorsTheory from '../../../../../data/content/linear-algebra/vectors.content.js';

function assertSameLength(a, b) {
  if (a.length !== b.length) {
    throw new Error(`Vectors must have the same dimension. Got ${a.length} and ${b.length}.`);
  }
}

function buildVectorsPayload({ operation, values }) {
  const a = parseVector(values.a, 'Vector A');

  if (operation === 'magnitude') {
    return { operation, a };
  }

  const b = parseVector(values.b, 'Vector B');
  assertSameLength(a, b);
  return { operation, a, b };
}

function normalizeVectorsResult(data) {
  if (data == null) return data;

  // Common shape from math engine proxy:
  // { result: { operation: 'dot-product', value: 10 } }
  const inner = data?.result ?? data;
  if (inner && typeof inner === 'object') {
    if (inner.value !== undefined) return inner.value;
    if (inner.vector !== undefined) return inner.vector;
    if (inner.matrix !== undefined) return inner.matrix;
    if (inner.determinant !== undefined) return inner.determinant;
    if (inner.rank !== undefined) return inner.rank;
    if (inner.solution !== undefined) return inner; // keep structured objects for specialized renderers
  }

  return data;
}

const vectorsConfig = {
  id: 'vectors',
  eyebrow: 'Linear Algebra',
  title: 'Vectors',
  subtitle: 'Compute vector operations with chip inputs and KaTeX-rendered results.',
  theory: vectorsTheory,
  practice: {
    title: 'Vector Calculator',
    description: 'Work with dot products, addition/subtraction, and magnitudes. Results render as clean mathematical output.',
    operationLabel: 'Operation',
    submitLabel: 'Calculate',
    loadingLabel: 'Calculating...',
    calculate: calcVectors,
    buildPayload: buildVectorsPayload,
    mapResult: (data) => normalizeVectorsResult(data),
    resultRenderer: LinearAlgebraResultRenderer,
    operations: [
      { value: 'dot-product', label: 'Dot Product (a · b)', hint: 'Returns a scalar.', default: true },
      { value: 'add', label: 'Addition (a + b)', hint: 'Adds vectors component-wise.' },
      { value: 'subtract', label: 'Subtraction (a − b)', hint: 'Subtracts vectors component-wise.' },
      { value: 'magnitude', label: 'Magnitude (‖a‖)', hint: 'Returns the Euclidean norm of a.' },
    ],
    fields: [
      {
        name: 'a',
        label: 'Vector A',
        smartType: 'vector-list',
        defaultValue: '1, 2, 3',
        hint: 'Comma-separated numbers, or use Add to build the vector.',
        required: true,
      },
      {
        name: 'b',
        label: 'Vector B',
        smartType: 'vector-list',
        defaultValue: '3, 2, 1',
        hint: 'Required for dot product and binary operations.',
        required: true,
        showWhen: ['dot-product', 'add', 'subtract'],
      },
    ],
  },
};

export default vectorsConfig;
