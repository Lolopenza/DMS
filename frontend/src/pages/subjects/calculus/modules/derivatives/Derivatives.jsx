import React from 'react';
import ModuleExperience from '../../../../../components/module/ModuleExperience.jsx';
import { calcDerivatives } from '../../api/derivatives.js';
import derivativesTheory from '../../../../../data/content/calculus/derivatives.content.js';

function buildDerivativesPayload({ operation, values }) {
  const order = Math.min(12, Math.max(1, parseInt(values.order, 10) || 1));
  return {
    module: 'derivatives',
    operation,
    expr: String(values.expr || ''),
    variable: String(values.variable || 'x').trim() || 'x',
    order,
  };
}

const derivativesConfig = {
  id: 'derivatives',
  eyebrow: 'Calculus',
  title: 'Derivatives',
  subtitle: 'Symbolic differentiation to arbitrary small integer order (SymPy).',
  theory: derivativesTheory,
  practice: {
    title: 'Derivative Calculator',
    description: 'Enter f(x), choose the independent variable, and the derivative order (1 = first derivative).',
    operationLabel: 'Operation',
    submitLabel: 'Differentiate',
    loadingLabel: 'Computing…',
    calculate: calcDerivatives,
    buildPayload: buildDerivativesPayload,
    mapResult: (data) => data?.result ?? data,
    operations: [{ value: 'derivative', label: 'Derivative', hint: 'd^n/dx^n of the expression.', default: true }],
    fields: [
      {
        name: 'expr',
        label: 'f(x)',
        type: 'text',
        defaultValue: 'x**3 + sin(x)',
        required: true,
        span: 'full',
      },
      {
        name: 'variable',
        label: 'Variable',
        type: 'text',
        defaultValue: 'x',
        required: true,
      },
      {
        name: 'order',
        label: 'Order n',
        smartType: 'validated-number',
        type: 'number',
        min: 1,
        max: 12,
        defaultValue: '1',
        required: true,
      },
    ],
  },
};

export default function Derivatives() {
  return <ModuleExperience config={derivativesConfig} />;
}
