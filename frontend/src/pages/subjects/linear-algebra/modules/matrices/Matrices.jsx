import { calcLinearAlgebra } from '../../../../../api.js';
import { parseMatrix } from '../../../../../utils/parsers.js';
import { LinearAlgebraResultRenderer } from '../../../../../components/module/ResultRenderers.jsx';
import matricesTheory from '../../../../../data/content/linear-algebra/matrices.content.js';

function normalizeMatricesResult(data) {
  if (data == null) return data;
  const inner = data?.result ?? data;
  if (inner && typeof inner === 'object') {
    if (inner.value !== undefined) return inner.value;
    if (inner.matrix !== undefined) return inner.matrix;
    if (inner.determinant !== undefined) return inner.determinant;
  }
  return inner;
}

function assertMatrixShape(matrix, name = 'Matrix') {
  if (!Array.isArray(matrix) || matrix.length === 0 || !Array.isArray(matrix[0])) {
    throw new Error(`${name} must be a non-empty matrix`);
  }
  const rows = matrix.length;
  const cols = matrix[0].length;
  for (let i = 0; i < rows; i++) {
    if (!Array.isArray(matrix[i]) || matrix[i].length !== cols) {
      throw new Error(`${name} rows must have equal length`);
    }
  }
  return { rows, cols };
}

function buildMatricesPayload({ operation, values }) {
  const a = parseMatrix(values.a, 'Matrix A');
  const aShape = assertMatrixShape(a, 'Matrix A');

  if (operation === 'transpose') {
    return { module: 'matrices', operation, a };
  }

  if (operation === 'determinant') {
    if (aShape.rows !== aShape.cols) throw new Error('Determinant requires a square matrix.');
    return { module: 'matrices', operation, a };
  }

  if (operation === 'inverse') {
    if (aShape.rows !== aShape.cols) throw new Error('Inverse requires a square matrix.');
    if (aShape.rows !== 2) throw new Error('Inverse is supported for 2×2 matrices only in this module.');
    return { module: 'matrices', operation, a };
  }

  if (operation === 'add') {
    const b = parseMatrix(values.b, 'Matrix B');
    const bShape = assertMatrixShape(b, 'Matrix B');
    if (aShape.rows !== bShape.rows || aShape.cols !== bShape.cols) {
      throw new Error('Addition requires matrices of the same shape.');
    }
    return { module: 'matrices', operation, a, b };
  }

  // multiply (default)
  const b = parseMatrix(values.b, 'Matrix B');
  const bShape = assertMatrixShape(b, 'Matrix B');
  if (aShape.cols !== bShape.rows) {
    throw new Error(`Multiplication requires cols(A) = rows(B). Got ${aShape.cols} and ${bShape.rows}.`);
  }
  return { module: 'matrices', operation, a, b };
}

const matricesConfig = {
  id: 'matrices',
  eyebrow: 'Linear Algebra',
  title: 'Matrices',
  subtitle: 'Compute matrix operations with grid inputs and KaTeX-rendered results.',
  // Keep a local fallback while also supporting auto-load via ModuleExperience.
  theory: matricesTheory,
  practice: {
    title: 'Matrix Calculator',
    description: 'Choose an operation, enter matrices using the grid input, and view results in clean mathematical notation.',
    operationLabel: 'Operation',
    submitLabel: 'Calculate',
    loadingLabel: 'Calculating...',
    calculate: calcLinearAlgebra,
    buildPayload: buildMatricesPayload,
    mapResult: (data) => normalizeMatricesResult(data),
    resultRenderer: LinearAlgebraResultRenderer,
    operations: [
      { value: 'multiply', label: 'Multiply (A × B)', hint: 'Compute the product of two matrices.', default: true },
      { value: 'add', label: 'Add (A + B)', hint: 'Add two matrices element-wise.' },
      { value: 'transpose', label: 'Transpose (Aᵀ)', hint: 'Swap rows and columns.' },
      { value: 'determinant', label: 'Determinant (det A)', hint: 'Compute det(A) for a square matrix.' },
      { value: 'inverse', label: 'Inverse (A⁻¹)', hint: 'Compute A⁻¹ for a 2×2 matrix with non-zero determinant.' },
    ],
    fields: [
      {
        name: 'a',
        label: 'Matrix A',
        smartType: 'matrix-grid',
        smartOptions: {
          valueFormat: 'linear_algebra',
          square: false,
          minSize: 2,
          maxSize: 12,
          binaryActions: false,
        },
        defaultValue: '1,2;3,4',
        hint: 'Use the grid or enter as “1,2;3,4”.',
        required: true,
        span: 'full',
      },
      {
        name: 'b',
        label: 'Matrix B',
        smartType: 'matrix-grid',
        smartOptions: {
          valueFormat: 'linear_algebra',
          square: false,
          minSize: 2,
          maxSize: 12,
          binaryActions: false,
        },
        defaultValue: '2,0;1,2',
        hint: 'Only required for multiplication and addition.',
        required: true,
        showWhen: ['multiply', 'add'],
        span: 'full',
      },
    ],
  },
};

export default matricesConfig;
