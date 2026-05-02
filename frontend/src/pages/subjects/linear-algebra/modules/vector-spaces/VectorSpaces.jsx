import { calcVectorSpaces } from '../../api/vector-spaces.js';
import { parseMatrix } from '../../../../../utils/parsers.js';
import { LinearAlgebraResultRenderer } from '../../../../../components/module/ResultRenderers.jsx';
import vectorSpacesTheory from '../../../../../data/content/linear-algebra/vector-spaces.content.js';

function buildVectorSpacesPayload({ operation, values }) {
  const vectors = parseMatrix(values.vectors, 'Vectors matrix');
  return { operation, vectors };
}

function normalizeVectorSpacesResult(data) {
  const inner = data?.result ?? data;
  if (inner && typeof inner === 'object' && inner.value !== undefined) return inner.value;
  return inner;
}

const vectorSpacesConfig = {
  id: 'vector-spaces',
  eyebrow: 'Linear Algebra',
  title: 'Vector Spaces',
  subtitle: 'Check rank and basic basis conditions using a vector matrix.',
  theory: vectorSpacesTheory,
  practice: {
    title: 'Vector Space Tools',
    description: 'Provide a matrix where each row is a vector. Compute rank or run a basic basis check.',
    operationLabel: 'Tool',
    submitLabel: 'Run',
    loadingLabel: 'Running...',
    calculate: calcVectorSpaces,
    buildPayload: buildVectorSpacesPayload,
    mapResult: (data) => normalizeVectorSpacesResult(data),
    resultRenderer: LinearAlgebraResultRenderer,
    operations: [
      { value: 'basis-check', label: 'Basis Check', hint: 'Checks whether the provided vectors form a basis (module-defined).', default: true },
      { value: 'rank', label: 'Rank', hint: 'Computes the rank of the vectors matrix.' },
    ],
    fields: [
      {
        name: 'vectors',
        label: 'Vectors matrix',
        smartType: 'matrix-grid',
        smartOptions: { valueFormat: 'linear_algebra', square: false, minSize: 2, maxSize: 8, binaryActions: false },
        defaultValue: '1,0,0;0,1,0;1,1,0',
        hint: 'Each row is one vector.',
        required: true,
        span: 'full',
      },
    ],
  },
};

export default vectorSpacesConfig;
