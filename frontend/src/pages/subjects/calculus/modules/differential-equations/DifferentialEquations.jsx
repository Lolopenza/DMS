import React from 'react';
import ModuleExperience from '../../../../../components/module/ModuleExperience.jsx';
import { calcDifferentialEquations } from '../../api/differential-equations.js';
import differentialEquationsTheory from '../../../../../data/content/calculus/differential-equations.content.js';

function buildOdePayload({ operation, values }) {
  return {
    module: 'ode',
    operation,
    ode_rhs: String(values.ode_rhs || ''),
  };
}

const differentialEquationsConfig = {
  id: 'differential-equations',
  eyebrow: 'Calculus',
  title: 'Differential Equations',
  subtitle: 'First-order ODEs y′ = f(x, y) — symbolic general solutions when available.',
  theory: differentialEquationsTheory,
  practice: {
    title: 'First-order ODE',
    description:
      'Enter only the **right-hand side** of y′ = … using `x` and `y` (meaning y(x)). Example: `y` gives exponential solutions; `x + y` is a linear first-order equation.',
    operationLabel: 'Operation',
    submitLabel: 'Solve',
    loadingLabel: 'Computing…',
    calculate: calcDifferentialEquations,
    buildPayload: buildOdePayload,
    mapResult: (data) => data?.result ?? data,
    operations: [{ value: 'first_order', label: "y′ = f(x, y)", hint: 'SymPy dsolve on first-order explicit form.', default: true }],
    fields: [
      {
        name: 'ode_rhs',
        label: 'Right-hand side f(x, y)',
        type: 'text',
        defaultValue: 'y',
        hint: 'Examples: y, x + y, x*y',
        required: true,
        span: 'full',
      },
    ],
  },
};

export default function DifferentialEquations() {
  return <ModuleExperience config={differentialEquationsConfig} />;
}
