import { calcSetTheory } from '../../api/set-theory.js';
import ModuleExperience from '../../../../../components/module/ModuleExperience.jsx';
import setTheoryContent from '../../../../../data/content/discrete-math/set-theory.content.js';

const OPERATIONS = [
  { value: 'union', label: 'A ∪ B', hint: 'Combine all unique elements from both sets.' },
  { value: 'intersection', label: 'A ∩ B', hint: 'Elements common to A and B.' },
  { value: 'difference', label: 'A \\ B', hint: 'Elements in A but not in B.' },
  { value: 'symmetric', label: 'A △ B', hint: 'Elements in exactly one of A or B.' },
  { value: 'complement', label: 'Aᶜ', hint: 'Elements in universe U that are not in A.' },
  { value: 'cartesian', label: 'A × B', hint: 'All ordered pairs (a, b) with a ∈ A, b ∈ B.' },
  { value: 'power', label: '𝒫(A)', hint: 'Set of all subsets of A.' },

  { value: 'empty', label: 'Empty?', hint: 'Check if a set is empty.' },
  { value: 'finite', label: 'Finite?', hint: 'Check if a set is finite.' },
  { value: 'infinite', label: 'Infinite?', hint: 'Check if a set is infinite.' },
  { value: 'cardinality', label: 'Cardinality', hint: 'Compute |A|.' },

  { value: 'relation_reflexive', label: 'Reflexive?', hint: 'Check reflexivity of a relation on U.' },
  { value: 'relation_symmetric', label: 'Symmetric?', hint: 'Check symmetry of a relation on U.' },
  { value: 'relation_antisymmetric', label: 'Antisymmetric?', hint: 'Check antisymmetry of a relation on U.' },
  { value: 'relation_transitive', label: 'Transitive?', hint: 'Check transitivity of a relation on U.' },
  { value: 'relation_inverse', label: 'Inverse', hint: 'Compute inverse relation.' },
  { value: 'relation_reflexive_closure', label: 'Reflexive closure', hint: 'Compute reflexive closure.' },
  { value: 'relation_symmetric_closure', label: 'Symmetric closure', hint: 'Compute symmetric closure.' },
  { value: 'relation_transitive_closure', label: 'Transitive closure', hint: 'Compute transitive closure.' },
];

function parseSet(str) {
  return String(str || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseRelation(str) {
  const pairs = [];
  const matches = String(str || '').match(/\(([^)]+)\)/g) || [];
  matches.forEach((m) => {
    const inner = m
      .slice(1, -1)
      .split(',')
      .map((s) => s.trim());
    if (inner.length === 2) pairs.push(inner);
  });
  return pairs;
}

const setTheoryConfig = {
  id: 'set-theory',
  eyebrow: 'Discrete Mathematics',
  title: 'Set Theory',
  subtitle: 'Set operations, properties, and relation checks.',
  theory: setTheoryContent,
  practice: {
    title: 'Set calculator',
    description: 'Enter sets as comma-separated lists. For relations use pairs like (1,2),(2,3).',
    operationLabel: 'Operation',
    submitLabel: 'Calculate',
    loadingLabel: 'Calculating...',
    calculate: calcSetTheory,
    buildPayload: ({ operation, values }) => {
      const setOps = new Set(['union', 'intersection', 'difference', 'symmetric', 'complement', 'cartesian', 'power']);
      const propOps = new Set(['empty', 'finite', 'infinite', 'cardinality']);
      const relOps = new Set([
        'relation_reflexive',
        'relation_symmetric',
        'relation_antisymmetric',
        'relation_transitive',
        'relation_inverse',
        'relation_reflexive_closure',
        'relation_symmetric_closure',
        'relation_transitive_closure',
      ]);

      if (setOps.has(operation)) {
        return {
          operation,
          setA: parseSet(values.setA),
          setB: parseSet(values.setB),
          universe: parseSet(values.universe),
        };
      }

      if (propOps.has(operation)) {
        return { operation, setA: parseSet(values.setAOnly) };
      }

      if (relOps.has(operation)) {
        return {
          operation,
          relation: parseRelation(values.relation),
          universe: parseSet(values.relUniverse),
        };
      }

      return { operation };
    },
    mapResult: (data) => data ?? {},
    operations: OPERATIONS.map((op, idx) => ({ ...op, default: idx === 0 })),
    fields: [
      {
        name: 'setA',
        label: 'Set A',
        smartType: 'set-list',
        type: 'text',
        defaultValue: '1,2,3',
        required: true,
        showWhen: ['union', 'intersection', 'difference', 'symmetric', 'complement', 'cartesian', 'power'],
      },
      {
        name: 'setB',
        label: 'Set B',
        smartType: 'set-list',
        type: 'text',
        defaultValue: '2,3,4',
        required: true,
        showWhen: ['union', 'intersection', 'difference', 'symmetric', 'cartesian'],
      },
      {
        name: 'universe',
        label: 'Universe U',
        smartType: 'set-list',
        type: 'text',
        defaultValue: '1,2,3,4,5',
        hint: 'Used for complement and relation operations.',
        showWhen: ['complement'],
      },
      {
        name: 'setAOnly',
        label: 'Set',
        smartType: 'set-list',
        type: 'text',
        defaultValue: '1,2,3',
        required: true,
        showWhen: ['empty', 'finite', 'infinite', 'cardinality'],
        span: 'full',
      },
      {
        name: 'relation',
        label: 'Relation (pairs)',
        smartType: 'relation-pairs',
        type: 'text',
        defaultValue: '(1,2),(2,3)',
        required: true,
        hint: 'Format: (a,b),(c,d)',
        showWhen: [
          'relation_reflexive',
          'relation_symmetric',
          'relation_antisymmetric',
          'relation_transitive',
          'relation_inverse',
          'relation_reflexive_closure',
          'relation_symmetric_closure',
          'relation_transitive_closure',
        ],
        span: 'full',
      },
      {
        name: 'relUniverse',
        label: 'Universe',
        smartType: 'set-list',
        type: 'text',
        defaultValue: '1,2,3',
        required: true,
        showWhen: [
          'relation_reflexive',
          'relation_symmetric',
          'relation_antisymmetric',
          'relation_transitive',
          'relation_inverse',
          'relation_reflexive_closure',
          'relation_symmetric_closure',
          'relation_transitive_closure',
        ],
      },
    ],
  },
};

export default function SetTheory() {
  return <ModuleExperience config={setTheoryConfig} />;
}
