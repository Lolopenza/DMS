import React from 'react';
import { calcProbability } from '../../../../../api.js';
import MathResultBox from '../../../../../components/module/MathResultBox.jsx';
import ModuleExperience from '../../../../../components/module/ModuleExperience.jsx';
import conditionalProbabilityTheory from '../../../../../data/content/probability-statistics/conditional-probability.content.js';

function parseNumList(value) {
  return String(value || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => Number(x))
    .filter((x) => Number.isFinite(x));
}

function ConditionalProbabilityResult({ result, operation, values }) {
  if (!result) return null;
  const numeric = typeof result?.result === 'number' ? result.result : null;

  const content =
    typeof numeric === 'number'
      ? operation === 'conditional'
        ? `$$P(A\\mid B)=\\frac{P(A\\cap B)}{P(B)}=\\frac{${values.joint}}{${values.condition}}\\approx ${numeric.toFixed(6)}$$`
        : `$$P(B)=\\sum_i P(B\\mid A_i)P(A_i) \\approx ${numeric.toFixed(6)}$$`
      : `\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``;

  return <MathResultBox title="Result" content={content} />;
}

const conditionalProbabilityConfig = {
  id: 'conditional-probability',
  eyebrow: 'Probability & Statistics',
  title: 'Conditional Probability',
  subtitle: 'Conditional probability and the law of total probability.',
  theory: conditionalProbabilityTheory,
  practice: {
    title: 'Conditional models',
    description: 'Choose a model and enter the parameters.',
    operationLabel: 'Operation',
    submitLabel: 'Calculate',
    loadingLabel: 'Calculating...',
    calculate: calcProbability,
    buildPayload: ({ operation, values }) => {
      if (operation === 'conditional') {
        return { operation, joint: Number(values.joint), condition: Number(values.condition) };
      }
      return { operation, priors: parseNumList(values.priors), likelihoods: parseNumList(values.likelihoods) };
    },
    mapResult: (data) => data,
    resultRenderer: (props) => <ConditionalProbabilityResult {...props} />,
    operations: [
      { value: 'conditional', label: 'P(A|B)', hint: 'Compute conditional probability', default: true },
      { value: 'total_probability', label: 'Total probability', hint: 'Compute P(B) from priors and likelihoods' },
    ],
    fields: [
      { name: 'joint', label: 'P(A ∩ B)', type: 'number', min: 0, max: 1, step: 0.01, defaultValue: 0.12, required: true, showWhen: ['conditional'] },
      { name: 'condition', label: 'P(B)', type: 'number', min: 0, max: 1, step: 0.01, defaultValue: 0.3, required: true, showWhen: ['conditional'] },
      { name: 'priors', label: 'Priors P(A_i)', type: 'text', defaultValue: '0.7,0.3', hint: 'Comma-separated, e.g. 0.7,0.3', required: true, showWhen: ['total_probability'], span: 'full' },
      { name: 'likelihoods', label: 'Likelihoods P(B|A_i)', type: 'text', defaultValue: '0.2,0.8', hint: 'Comma-separated, e.g. 0.2,0.8', required: true, showWhen: ['total_probability'], span: 'full' },
    ],
  },
};

export default function ConditionalProbability() {
  return <ModuleExperience config={conditionalProbabilityConfig} />;
}
