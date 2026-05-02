import { calcOrthogonality } from '../../api/orthogonality.js';
import { parseVector } from '../../../../../utils/parsers.js';
import { LinearAlgebraResultRenderer } from '../../../../../components/module/ResultRenderers.jsx';
import orthogonalityTheory from '../../../../../data/content/linear-algebra/orthogonality.content.js';

function assertSameLength(a, b) {
  if (a.length !== b.length) throw new Error('Vectors must have the same dimension.');
}

function buildOrthogonalityPayload({ operation, values }) {
  const vector = parseVector(values.vector, 'Vector');
  const onto = parseVector(values.onto, 'Onto vector');
  assertSameLength(vector, onto);
  return { operation, vector, onto };
}

function normalizeOrthogonalityResult(data) {
  const inner = data?.result ?? data;
  if (inner && typeof inner === 'object' && inner.value !== undefined) return inner.value;
  return inner;
}

const orthogonalityConfig = {
  id: 'orthogonality',
  eyebrow: 'Linear Algebra',
  title: 'Orthogonality',
  subtitle: 'Dot products, orthogonality checks, and projections.',
  theory: orthogonalityTheory,
  practice: {
    title: 'Orthogonality Tools',
    description: 'Compute dot products, check orthogonality, or project one vector onto another.',
    operationLabel: 'Tool',
    submitLabel: 'Run',
    loadingLabel: 'Running...',
    calculate: calcOrthogonality,
    buildPayload: buildOrthogonalityPayload,
    mapResult: (data) => normalizeOrthogonalityResult(data),
    resultRenderer: LinearAlgebraResultRenderer,
    operations: [
      { value: 'projection', label: 'Projection', hint: 'Compute proj_u(v).', default: true },
      { value: 'dot-product', label: 'Dot Product', hint: 'Compute v · u.' },
      { value: 'is-orthogonal', label: 'Orthogonality Check', hint: 'Checks whether v · u = 0.' },
    ],
    fields: [
      {
        name: 'vector',
        label: 'Vector v',
        smartType: 'vector-list',
        defaultValue: '3, 4',
        hint: 'Primary vector.',
        required: true,
      },
      {
        name: 'onto',
        label: 'Onto vector u',
        smartType: 'vector-list',
        defaultValue: '1, 0',
        hint: 'Reference vector (same dimension as v).',
        required: true,
      },
    ],
  },
};

export default orthogonalityConfig;
