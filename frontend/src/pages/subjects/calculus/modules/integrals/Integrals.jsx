import React from 'react';
import ModuleExperience from '../../../../../components/module/ModuleExperience.jsx';
import { calcIntegrals } from '../../api/integrals.js';
import integralsTheory from '../../../../../data/content/calculus/integrals.content.js';

function buildIntegralsPayload({ operation, values }) {
  const base = {
    module: 'integrals',
    operation,
    expr: String(values.expr || ''),
    variable: String(values.variable || 'x').trim() || 'x',
  };
  if (operation === 'definite') {
    return {
      ...base,
      a: String(values.a ?? '0'),
      b: String(values.b ?? '1'),
    };
  }
  return base;
}

const integralsConfig = {
  id: 'integrals',
  eyebrow: 'Calculus',
  title: 'Integrals',
  subtitle: 'Indefinite integration and definite integrals when SymPy can integrate symbolically.',
  theory: integralsTheory,
  practice: {
    title: 'Integral Calculator',
    description:
      'Indefinite: antiderivative + constant (implicit). Definite: specify bounds a,b (numbers or simple constants like pi).',
    operationLabel: 'Operation',
    submitLabel: 'Integrate',
    loadingLabel: 'Computing…',
    calculate: calcIntegrals,
    buildPayload: buildIntegralsPayload,
    mapResult: (data) => data?.result ?? data,
    operations: [
      { value: 'indefinite', label: 'Indefinite ∫ … dx', hint: 'Antiderivative.', default: true },
      { value: 'definite', label: 'Definite ∫ₐᵇ … dx', hint: 'Provide bounds a and b.', default: false },
    ],
    fields: [
      {
        name: 'expr',
        label: 'Integrand',
        type: 'text',
        defaultValue: 'x**2',
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
        name: 'a',
        label: 'Lower bound a',
        type: 'text',
        defaultValue: '0',
        hint: 'Definite integral only',
        showWhen: ['definite'],
        required: true,
      },
      {
        name: 'b',
        label: 'Upper bound b',
        type: 'text',
        defaultValue: '1',
        hint: 'Definite integral only',
        showWhen: ['definite'],
        required: true,
      },
    ],
  },
};

export default function Integrals() {
  return <ModuleExperience config={integralsConfig} />;
}
