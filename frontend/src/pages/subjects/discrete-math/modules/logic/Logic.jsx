import { calcLogic } from '../../api/logic.js';
import ModuleExperience from '../../../../../components/module/ModuleExperience.jsx';
import logicTheory from '../../../../../data/content/discrete-math/logic.content.js';

function parseVariables(raw) {
  return String(raw || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

const logicConfig = {
  id: 'logic',
  eyebrow: 'Discrete Mathematics',
  title: 'Logic (Intro)',
  subtitle: 'Core propositional operators and truth tables.',
  theory: logicTheory,
  practice: {
    title: 'Truth Table Generator',
    description: 'Enter variables and a formula (using &, |, ~) to generate a truth table.',
    operationLabel: 'Operation',
    submitLabel: 'Generate',
    loadingLabel: 'Generating...',
    calculate: calcLogic,
    buildPayload: ({ operation, values }) => ({
      operation,
      variables: parseVariables(values.variables),
      formula: String(values.formula || ''),
    }),
    mapResult: (data) => data.result ?? data,
    operations: [
      { value: 'truth_table', label: 'Truth table', hint: 'Compute a full truth table.', default: true },
    ],
    fields: [
      {
        name: 'variables',
        label: 'Variables',
        smartType: 'set-list',
        type: 'text',
        defaultValue: 'P,Q',
        hint: 'Comma-separated, e.g. P,Q,R — or use chips below.',
        required: true,
      },
      {
        name: 'formula',
        label: 'Formula',
        smartType: 'formula',
        type: 'text',
        defaultValue: 'P & Q',
        hint: 'ASCII syntax for the engine: P & Q, P | Q, ~P',
        required: true,
        span: 'full',
        smartOptions: { multiline: false, useMathQuill: false },
      },
    ],
  },
};

export default function Logic() {
  return <ModuleExperience config={logicConfig} />;
}
