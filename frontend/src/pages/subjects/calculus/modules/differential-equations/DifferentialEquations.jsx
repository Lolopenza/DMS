import React from 'react';
import ModuleExperience from '../../../../../components/module/ModuleExperience.jsx';

const config = {
  id: 'differential-equations',
  eyebrow: 'Calculus',
  title: 'Differential Equations',
  subtitle: 'Coming soon: first-order ODEs and modeling.',
  theory: {
    overview:
      'This module will cover basic first-order differential equations, separation of variables, and simple modeling examples. Content is staged for the next build-out.',
    outcomes: [
      'Recognize separable first-order ODEs.',
      'Solve simple separable equations by integration.',
      'Interpret solutions in modeling contexts.',
    ],
    formulas: [
      { title: 'Separation template (sample)', content: '$$\\frac{dy}{dx}=g(x)h(y)\\Rightarrow \\frac{1}{h(y)}dy=g(x)dx$$' },
    ],
    examples: [
      {
        title: 'Worked example (stub): separable ODE',
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

export default function DifferentialEquations() {
  return <ModuleExperience config={config} />;
}

