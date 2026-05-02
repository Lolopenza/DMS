import React from 'react';
import { calcProbability } from '../../../../../api.js';
import MathResultBox from '../../../../../components/module/MathResultBox.jsx';
import ModuleExperience from '../../../../../components/module/ModuleExperience.jsx';
import bayesTheory from '../../../../../data/content/probability-statistics/bayes-theorem.content.js';

function BayesResult({ result, values }) {
  if (!result) return null;
  const numeric = typeof result?.result === 'number' ? result.result : null;
  const content =
    typeof numeric === 'number'
      ? `$$P(H\\mid E)=\\frac{P(E\\mid H)P(H)}{P(E\\mid H)P(H)+P(E\\mid \\neg H)(1-P(H))} \\approx ${numeric.toFixed(
          6,
        )}$$`
      : `\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``;

  return <MathResultBox title="Posterior" content={content} />;
}

const bayesConfig = {
  id: 'bayes-theorem',
  eyebrow: 'Probability & Statistics',
  title: "Bayes' Theorem",
  subtitle: 'Posterior inference using prior and evidence quality.',
  theory: bayesTheory,
  practice: {
    title: 'Bayesian inference',
    description: 'Enter prior and test characteristics to compute the posterior.',
    submitLabel: 'Calculate posterior',
    loadingLabel: 'Calculating...',
    calculate: calcProbability,
    buildPayload: ({ values }) => ({
      operation: 'bayes',
      prior: Number(values.prior),
      true_pos: Number(values.truePos),
      false_pos: Number(values.falsePos),
    }),
    mapResult: (data) => data,
    resultRenderer: (props) => <BayesResult {...props} />,
    operations: [{ value: 'bayes', label: 'Posterior', default: true }],
    fields: [
      { name: 'prior', label: 'Prior P(H)', type: 'number', min: 0, max: 1, step: 0.001, defaultValue: 0.01, required: true },
      { name: 'truePos', label: 'True positive P(E|H)', type: 'number', min: 0, max: 1, step: 0.001, defaultValue: 0.95, required: true },
      { name: 'falsePos', label: 'False positive P(E|¬H)', type: 'number', min: 0, max: 1, step: 0.001, defaultValue: 0.08, required: true },
    ],
  },
};

export default function BayesTheorem() {
  return <ModuleExperience config={bayesConfig} />;
}
