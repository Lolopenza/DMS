import React from 'react';
import ModuleExperience from '../../../../../components/module/ModuleExperience.jsx';

const config = {
  id: 'multivariable',
  eyebrow: 'Calculus',
  title: 'Multivariable Calculus',
  subtitle: 'Coming soon: partial derivatives, gradients, and multiple integrals.',
  theory: {
    overview:
      'This module will cover partial derivatives, gradients, directional derivatives, and multiple integrals. Content is staged for the next build-out.',
    outcomes: [
      'Compute partial derivatives of multivariable functions.',
      'Interpret the gradient as the direction of steepest ascent.',
      'Work with basic multivariable integrals (setup and meaning).',
    ],
    formulas: [
      { title: 'Gradient (sample)', content: '$$\\nabla f=\\left(\\frac{\\partial f}{\\partial x},\\frac{\\partial f}{\\partial y}\\right)$$' },
    ],
    examples: [
      {
        title: 'Worked example (stub): partial derivative',
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

export default function Multivariable() {
  return <ModuleExperience config={config} />;
}

