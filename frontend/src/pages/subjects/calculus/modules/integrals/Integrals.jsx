import React from 'react';
import ModuleExperience from '../../../../../components/module/ModuleExperience.jsx';

const config = {
  id: 'integrals',
  eyebrow: 'Calculus',
  title: 'Integrals',
  subtitle: 'Coming soon: antiderivatives, definite integrals, and the Fundamental Theorem.',
  theory: {
    overview:
      'This module will cover antiderivatives, definite integrals as accumulation/area, and the Fundamental Theorem of Calculus. Content is staged for the next build-out.',
    outcomes: [
      'Compute basic antiderivatives.',
      'Interpret definite integrals as signed area/accumulation.',
      'Connect differentiation and integration via the FTC.',
    ],
    formulas: [
      { title: 'Fundamental Theorem (sample)', content: '$$\\frac{d}{dx}\\int_a^x f(t)\\,dt=f(x)$$' },
    ],
    examples: [
      {
        title: 'Worked example (stub): ∫ x dx',
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

export default function Integrals() {
  return <ModuleExperience config={config} />;
}

