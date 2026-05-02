import { calcLogic } from '../../api/logic.js';
import ModuleExperience from '../../../../../components/module/ModuleExperience.jsx';
import logicTheory from '../../../../../data/content/discrete-math/logic.content.js';

function parseVariables(raw) {
  return String(raw || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildLogicPayload({ operation, values }) {
  const variables = parseVariables(values.variables);
  const base = { operation, variables };
  const f = String(values.formula || '').trim();
  const f1 = String(values.formula1 || '').trim();
  const f2 = String(values.formula2 || '').trim();

  if (operation === 'equivalence' || operation === 'implication') {
    return { ...base, formula1: f1, formula2: f2 };
  }
  return { ...base, formula: f };
}

const logicConfig = {
  id: 'logic',
  eyebrow: 'Discrete Mathematics',
  title: 'Logic (Intro)',
  subtitle:
    'Propositional formulas: truth tables, equivalence, implication validity, analysis, and normal forms (DNF/CNF).',
  theory: logicTheory,
  practice: {
    title: 'Logic Calculator',
    description:
      'Pick an operation, list single-letter variables (e.g. P,Q), then enter formula(s) using &, |, ~ and parentheses.',
    operationLabel: 'Operation',
    submitLabel: 'Run',
    loadingLabel: 'Computing…',
    calculate: calcLogic,
    buildPayload: buildLogicPayload,
    mapResult: (data) => data.result ?? data,
    operations: [
      { value: 'truth_table', label: 'Truth table', hint: 'Full table + tautology / contradiction / contingency.', default: true },
      { value: 'equivalence', label: 'Equivalence', hint: 'Check whether two formulas are logically equivalent.' },
      { value: 'formula_analysis', label: 'Formula analysis', hint: 'Truth table plus counts of satisfying / falsifying rows.' },
      { value: 'implication', label: 'Implication validity', hint: 'Test whether formula1 logically implies formula2 (no counterexample).' },
      { value: 'normal_forms', label: 'Normal forms (DNF / CNF)', hint: 'Minimal DNF and CNF from the truth table.' },
    ],
    fields: [
      {
        name: 'variables',
        label: 'Variables',
        smartType: 'set-list',
        type: 'text',
        defaultValue: 'P,Q',
        hint: 'Comma-separated single letters, e.g. P,Q,R.',
        required: true,
      },
      {
        name: 'formula',
        label: 'Formula',
        smartType: 'formula',
        type: 'text',
        defaultValue: 'P & Q',
        hint: 'ASCII: &, |, ~, parentheses. Example: ~(P & Q) | (~P | Q)',
        required: true,
        span: 'full',
        showWhen: ['truth_table', 'formula_analysis', 'normal_forms'],
        smartOptions: { multiline: false, useMathQuill: false },
      },
      {
        name: 'formula1',
        label: 'First formula',
        smartType: 'formula',
        type: 'text',
        defaultValue: '~(P & Q)',
        hint: 'Left-hand side for equivalence or antecedent for implication.',
        required: true,
        span: 'full',
        showWhen: ['equivalence', 'implication'],
        smartOptions: { multiline: false, useMathQuill: false },
      },
      {
        name: 'formula2',
        label: 'Second formula',
        smartType: 'formula',
        type: 'text',
        defaultValue: '(~P) | (~Q)',
        hint: 'Right-hand side for equivalence or consequent for implication.',
        required: true,
        span: 'full',
        showWhen: ['equivalence', 'implication'],
        smartOptions: { multiline: false, useMathQuill: false },
      },
    ],
  },
};

export default function Logic() {
  return <ModuleExperience config={logicConfig} />;
}
