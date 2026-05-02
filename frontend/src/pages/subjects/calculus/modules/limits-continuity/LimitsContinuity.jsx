import React from 'react';
import ModuleExperience from '../../../../../components/module/ModuleExperience.jsx';
import { calcLimits } from '../../api/limits.js';
import limitsTheory from '../../../../../data/content/calculus/limits-continuity.content.js';

const DIRECTION_OPTIONS = [
  { value: '+-', label: 'Two-sided (x → a)' },
  { value: '+', label: 'From the right (x → a⁺)' },
  { value: '-', label: 'From the left (x → a⁻)' },
];

function buildLimitsPayload({ operation, values }) {
  return {
    module: 'limits',
    operation,
    expr: String(values.expr || ''),
    variable: String(values.variable || 'x').trim() || 'x',
    point: String(values.point ?? '0'),
    direction: String(values.direction || '+-'),
  };
}

const limitsConfig = {
  id: 'limits-continuity',
  eyebrow: 'Calculus',
  title: 'Limits & Continuity',
  subtitle: 'Symbolic limits at a point or infinity, including one-sided limits (SymPy).',
  theory: limitsTheory,
  practice: {
    title: 'Limit Calculator',
    description:
      'Enter an expression in plain SymPy-like syntax (sin(x), x**2, exp(-x)). Use point `oo` or `-oo` for limits at infinity.',
    operationLabel: 'Operation',
    submitLabel: 'Evaluate limit',
    loadingLabel: 'Computing…',
    calculate: calcLimits,
    buildPayload: buildLimitsPayload,
    mapResult: (data) => data?.result ?? data,
    operations: [{ value: 'limit', label: 'Limit', hint: 'Evaluate lim using direction below.', default: true }],
    fields: [
      {
        name: 'expr',
        label: 'Expression',
        type: 'text',
        defaultValue: 'sin(x)/x',
        hint: 'Examples: sin(x)/x, (exp(x)-1)/x, 1/x',
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
        name: 'point',
        label: 'Approach (point)',
        type: 'text',
        defaultValue: '0',
        hint: '0, pi/4, oo, -oo',
        required: true,
      },
      {
        name: 'direction',
        label: 'Direction',
        type: 'select',
        defaultValue: '+-',
        options: DIRECTION_OPTIONS,
        required: true,
      },
    ],
  },
};

export default function LimitsContinuity() {
  return <ModuleExperience config={limitsConfig} />;
}
