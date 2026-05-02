import { calcProbability } from '../../api/probability.js';
import ModuleExperience from '../../../../../components/module/ModuleExperience.jsx';
import probabilityIntroContent from '../../../../../data/content/discrete-math/probability.content.js';

const probabilityConfig = {
  id: 'probability',
  eyebrow: 'Discrete Mathematics',
  title: 'Probability (Intro)',
  subtitle: 'Compute basic probabilities from counts of favorable and total outcomes.',
  theory: probabilityIntroContent,
  practice: {
    title: 'Probability Calculator',
    description: 'Enter the number of favorable outcomes and the total number of outcomes.',
    calculate: calcProbability,
    buildPayload: ({ operation, values }) => ({
      operation,
      favorable: Number(values.favorable),
      total: Number(values.total),
    }),
    mapResult: (data) => data ?? {},
    operations: [{ value: 'simple', label: 'Simple probability', default: true }],
    fields: [
      {
        name: 'favorable',
        label: 'Favorable outcomes',
        smartType: 'validated-number',
        type: 'number',
        min: 0,
        defaultValue: 3,
        required: true,
      },
      {
        name: 'total',
        label: 'Total outcomes',
        smartType: 'validated-number',
        type: 'number',
        min: 1,
        defaultValue: 10,
        required: true,
      },
    ],
  },
};

export default function Probability() {
  return <ModuleExperience config={probabilityConfig} />;
}
