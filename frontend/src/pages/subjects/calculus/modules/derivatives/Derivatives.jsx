import React from 'react';
import ModuleExperience from '../../../../../components/module/ModuleExperience.jsx';

const config = {
  id: 'derivatives',
  eyebrow: 'Calculus',
  title: 'Derivatives',
  subtitle: 'Coming soon: rules, interpretation, and worked examples.',
  theory: {
    overview:
      'This module will cover derivative definitions, rules (product/quotient/chain), and geometric/physical interpretations. Content is staged for the next build-out.',
    outcomes: [
      'Compute derivatives using standard differentiation rules.',
      'Interpret f′(x) as slope and instantaneous rate of change.',
      'Apply chain rule in composite functions.',
    ],
    formulas: [
      { title: 'Definition (difference quotient)', content: "$$f'(a)=\\lim_{h\\to 0}\\frac{f(a+h)-f(a)}{h}$$" },
    ],
    examples: [
      {
        title: 'Worked example (stub): derivative of x²',
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

export default function Derivatives() {
  return <ModuleExperience config={config} />;
}

