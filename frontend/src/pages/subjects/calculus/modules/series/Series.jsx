import React from 'react';
import ModuleExperience from '../../../../../components/module/ModuleExperience.jsx';

const config = {
  id: 'series',
  eyebrow: 'Calculus',
  title: 'Series',
  subtitle: 'Coming soon: convergence and Taylor expansions.',
  theory: {
    overview:
      'This module will cover infinite series, convergence tests, power series, and Taylor/Maclaurin expansions. Content is staged for the next build-out.',
    outcomes: [
      'Recognize common convergent/divergent series forms.',
      'Apply basic convergence tests in standard cases.',
      'Use Taylor expansions for approximation (where applicable).',
    ],
    formulas: [
      { title: 'Geometric series (sample)', content: '$$\\sum_{k=0}^{\\infty} ar^k=\\frac{a}{1-r}\\quad (|r|<1)$$' },
    ],
    examples: [
      {
        title: 'Worked example (stub): geometric series',
        content: 'Example content will be added when the full calculus track is authored.',
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

export default function Series() {
  return <ModuleExperience config={config} />;
}

