import React from 'react';
import ModuleExperience from '../../../../../components/module/ModuleExperience.jsx';

const config = {
  id: 'limits-continuity',
  eyebrow: 'Calculus',
  title: 'Limits & Continuity',
  subtitle: 'Coming soon: theory + worked examples (Gold Standard).',
  theory: {
    overview:
      'This module will cover limit laws, continuity, standard limit forms, and intuition for approaching x→a and x→∞. Content is staged for the next build-out.',
    outcomes: [
      'Compute limits using algebraic simplification and limit laws.',
      'Identify removable vs non-removable discontinuities.',
      'Use standard limits (e.g., sin x / x) correctly.',
    ],
    formulas: [
      { title: 'Limit laws (sample)', content: '$$\\lim_{x\\to a}(f(x)+g(x))=\\lim_{x\\to a}f(x)+\\lim_{x\\to a}g(x)$$' },
    ],
    examples: [
      {
        title: 'Worked example (stub): removable discontinuity',
        content: [
          'Example content will be added when the full calculus track is authored.',
        ].join('\\n'),
      },
    ],
  },
  practice: {
    title: 'Calculator',
    description: 'Calculus calculators are planned and will appear here once backend endpoints are added.',
    operations: [{ value: 'coming-soon', label: 'Coming soon', default: true }],
    fields: [],
    submitLabel: 'Coming soon',
    loadingLabel: 'Coming soon',
    calculate: async () => ({ error: 'Calculus calculator is not available yet.' }),
    buildPayload: () => ({}),
    mapResult: (x) => x,
    resultRenderer: ({ result }) => (result?.error ? <div className="text-sm text-slate-600">{result.error}</div> : null),
  },
};

export default function LimitsContinuity() {
  return <ModuleExperience config={config} />;
}

