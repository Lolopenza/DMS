import { calcLinearTransformations } from '../../api/linear-transformations.js';
import { parseMatrix, parseVector } from '../../../../../utils/parsers.js';
import { LinearAlgebraResultRenderer } from '../../../../../components/module/ResultRenderers.jsx';
import linearTransformationsTheory from '../../../../../data/content/linear-algebra/linear-transformations.content.js';

function assertMatVecCompatible(A, x) {
  if (!Array.isArray(A) || A.length === 0 || !Array.isArray(A[0])) throw new Error('Matrix must be valid.');
  if (!Array.isArray(x) || x.length === 0) throw new Error('Vector must be valid.');
  const cols = A[0].length;
  if (cols !== x.length) throw new Error(`Expected vector length ${cols} to match matrix columns, got ${x.length}.`);
}

function buildLinearTransformationsPayload({ operation, values }) {
  const matrix = parseMatrix(values.matrix, 'Transformation matrix');
  const vector = parseVector(values.vector, 'Input vector');
  assertMatVecCompatible(matrix, vector);
  return { operation, matrix, vector };
}

function normalizeLinearTransformationsResult(data) {
  const inner = data?.result ?? data;
  if (inner && typeof inner === 'object' && inner.value !== undefined) return inner.value;
  return inner;
}

const linearTransformationsConfig = {
  id: 'linear-transformations',
  eyebrow: 'Linear Algebra',
  title: 'Linear Transformations',
  subtitle: 'Apply a matrix transformation to a vector.',
  theory: linearTransformationsTheory,
  practice: {
    title: 'Transformation Calculator',
    description: 'Enter a transformation matrix and an input vector, then compute the transformed vector.',
    operationLabel: 'Operation',
    submitLabel: 'Calculate',
    loadingLabel: 'Calculating...',
    calculate: calcLinearTransformations,
    buildPayload: buildLinearTransformationsPayload,
    mapResult: (data) => normalizeLinearTransformationsResult(data),
    resultRenderer: LinearAlgebraResultRenderer,
    operations: [
      { value: 'apply-transformation', label: 'Apply Transformation', hint: 'Computes A·x.', default: true },
    ],
    fields: [
      {
        name: 'matrix',
        label: 'Transformation matrix A',
        smartType: 'matrix-grid',
        smartOptions: { valueFormat: 'linear_algebra', square: false, minSize: 2, maxSize: 6, binaryActions: false },
        defaultValue: '1,0;0,-1',
        hint: 'Any m×n matrix (2–6 size range in UI).',
        required: true,
        span: 'full',
      },
      {
        name: 'vector',
        label: 'Input vector x',
        smartType: 'vector-list',
        defaultValue: '2, 3',
        hint: 'Length must match the number of columns of A.',
        required: true,
      },
    ],
  },
};

export default linearTransformationsConfig;
