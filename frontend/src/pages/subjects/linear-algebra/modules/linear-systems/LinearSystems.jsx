import { calcLinearSystems } from '../../api/linear-systems.js';
import { parseMatrix, parseVector } from '../../../../../utils/parsers.js';
import ModuleExperience from '../../../../../components/module/ModuleExperience.jsx';
import { LinearAlgebraResultRenderer } from '../../../../../components/module/ResultRenderers.jsx';
import linearSystemsTheory from '../../../../../data/content/linear-algebra/linear-systems.content.js';

function assert2x2(matrix) {
  if (!Array.isArray(matrix) || matrix.length !== 2 || !Array.isArray(matrix[0]) || matrix[0].length !== 2 || matrix[1].length !== 2) {
    throw new Error('Only 2×2 systems are supported in this module.');
  }
}

function assertVector2(v) {
  if (!Array.isArray(v) || v.length !== 2) throw new Error('Vector b must have exactly 2 values.');
}

function buildLinearSystemsPayload({ operation, values }) {
  const a = parseMatrix(values.a, 'Coefficient matrix A');
  const b = parseVector(values.b, 'Vector b');
  assert2x2(a);
  assertVector2(b);
  // Math engine expects `matrix` (not `a`) for this module.
  return { operation, matrix: a, b };
}

function normalizeLinearSystemsResult(data) {
  const inner = data?.result ?? data;
  if (inner && typeof inner === 'object' && inner.value !== undefined) return inner.value;
  return inner;
}

const linearSystemsConfig = {
  id: 'linear-systems',
  eyebrow: 'Linear Algebra',
  title: 'Linear Systems',
  subtitle: 'Solve 2×2 systems with Gaussian elimination and matrix form.',
  theory: linearSystemsTheory,
  practice: {
    title: 'Linear System Solver',
    description:
      'Enter a 2×2 coefficient matrix and a 2D right-hand side vector, then compute the solution. The math engine currently solves 2×2 systems only; larger systems are not supported yet.',
    operationLabel: 'Method',
    submitLabel: 'Solve',
    loadingLabel: 'Solving...',
    calculate: calcLinearSystems,
    buildPayload: buildLinearSystemsPayload,
    mapResult: (data) => normalizeLinearSystemsResult(data),
    resultRenderer: LinearAlgebraResultRenderer,
    operations: [
      { value: 'gaussian-elimination', label: 'Gaussian Elimination (2×2)', hint: 'Solve by elimination steps.', default: true },
      { value: 'solve', label: 'Solve (2×2)', hint: 'Direct solve for the unique solution.' },
    ],
    fields: [
      {
        name: 'a',
        label: 'Coefficient matrix A',
        smartType: 'matrix-grid',
        smartOptions: { valueFormat: 'linear_algebra', square: true, minSize: 2, maxSize: 2, binaryActions: false },
        defaultValue: '2,1;1,-1',
        hint: '2×2 matrix only (solver limitation).',
        required: true,
        span: 'full',
      },
      {
        name: 'b',
        label: 'Vector b',
        smartType: 'vector-list',
        defaultValue: '5, 1',
        hint: 'Two numbers (right-hand side).',
        required: true,
      },
    ],
  },
};

export default function LinearSystems() {
  return <ModuleExperience config={linearSystemsConfig} />;
}
