import { calcDeterminants } from '../../api/determinants.js';
import { parseMatrix } from '../../../../../utils/parsers.js';
import { LinearAlgebraResultRenderer } from '../../../../../components/module/ResultRenderers.jsx';
import determinantsTheory from '../../../../../data/content/linear-algebra/determinants.content.js';

function assertSquare2or3(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0 || !Array.isArray(matrix[0])) {
    throw new Error('Matrix A must be a valid matrix.');
  }
  const n = matrix.length;
  const m = matrix[0].length;
  if (n !== m) throw new Error('Determinant requires a square matrix.');
  if (n !== 2 && n !== 3) throw new Error('This module supports 2×2 or 3×3 determinants only.');
}

function buildDeterminantsPayload({ operation, values }) {
  const matrix = parseMatrix(values.matrix, 'Matrix A');
  assertSquare2or3(matrix);
  return { operation, matrix };
}

function normalizeDeterminantsResult(data) {
  const inner = data?.result ?? data;
  if (inner && typeof inner === 'object' && inner.value !== undefined) return inner.value;
  if (inner && typeof inner === 'object' && inner.determinant !== undefined) return inner.determinant;
  return inner;
}

const determinantsConfig = {
  id: 'determinants',
  eyebrow: 'Linear Algebra',
  title: 'Determinants',
  subtitle: 'Compute det(A) and interpret invertibility and scaling.',
  theory: determinantsTheory,
  practice: {
    title: 'Determinant Calculator',
    description: 'Enter a 2×2 or 3×3 matrix and compute its determinant.',
    operationLabel: 'Operation',
    submitLabel: 'Calculate',
    loadingLabel: 'Calculating...',
    calculate: calcDeterminants,
    buildPayload: buildDeterminantsPayload,
    mapResult: (data) => normalizeDeterminantsResult(data),
    resultRenderer: LinearAlgebraResultRenderer,
    operations: [
      { value: 'determinant', label: 'Calculate det(A)', hint: 'Square matrices only (2×2 or 3×3).', default: true },
    ],
    fields: [
      {
        name: 'matrix',
        label: 'Matrix A',
        smartType: 'matrix-grid',
        smartOptions: { valueFormat: 'linear_algebra', square: true, minSize: 2, maxSize: 3, binaryActions: false },
        defaultValue: '4,2;1,3',
        hint: 'Use the grid or enter as “1,2;3,4” (2×2) / “1,2,3;4,5,6;7,8,9” (3×3).',
        required: true,
        span: 'full',
      },
    ],
  },
};

export default determinantsConfig;
