import { calcEigenvalues } from '../../api/eigenvalues.js';
import { parseMatrix } from '../../../../../utils/parsers.js';
import { LinearAlgebraResultRenderer } from '../../../../../components/module/ResultRenderers.jsx';
import eigenvaluesTheory from '../../../../../data/content/linear-algebra/eigenvalues.content.js';

function assert2x2(matrix) {
  if (!Array.isArray(matrix) || matrix.length !== 2 || !Array.isArray(matrix[0]) || matrix[0].length !== 2 || matrix[1].length !== 2) {
    throw new Error('Only 2×2 matrices are supported in this module.');
  }
}

function buildEigenvaluesPayload({ operation, values }) {
  const matrix = parseMatrix(values.matrix, 'Matrix A');
  assert2x2(matrix);
  return { operation, matrix };
}

function normalizeEigenvaluesResult(data) {
  const inner = data?.result ?? data;
  if (inner && typeof inner === 'object') {
    if (inner.value !== undefined) return inner.value;
    // math-engine returns { type: 'real'|'complex', values: [...] }
    if (inner.type && Array.isArray(inner.values)) return inner;
  }
  return inner;
}

const eigenvaluesConfig = {
  id: 'eigenvalues',
  eyebrow: 'Linear Algebra',
  title: 'Eigenvalues',
  subtitle: 'Compute 2×2 eigenvalues and interpret trace/determinant.',
  theory: eigenvaluesTheory,
  practice: {
    title: 'Eigenvalue Calculator',
    description: 'Enter a 2×2 matrix and compute eigenvalues (real or complex summary).',
    operationLabel: 'Operation',
    submitLabel: 'Calculate',
    loadingLabel: 'Calculating...',
    calculate: calcEigenvalues,
    buildPayload: buildEigenvaluesPayload,
    mapResult: (data) => normalizeEigenvaluesResult(data),
    resultRenderer: LinearAlgebraResultRenderer,
    operations: [
      { value: 'eigenvalues', label: 'Eigenvalues (2×2)', hint: 'Uses trace and determinant.', default: true },
    ],
    fields: [
      {
        name: 'matrix',
        label: 'Matrix A',
        smartType: 'matrix-grid',
        smartOptions: { valueFormat: 'linear_algebra', square: true, minSize: 2, maxSize: 2, binaryActions: false },
        defaultValue: '3,1;0,2',
        hint: '2×2 matrix.',
        required: true,
        span: 'full',
      },
    ],
  },
};

export default eigenvaluesConfig;
