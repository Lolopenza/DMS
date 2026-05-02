import React from 'react';
import ModuleExperience from '../../../../../components/module/ModuleExperience.jsx';
import { calcMultivariable } from '../../api/multivariable.js';
import multivariableTheory from '../../../../../data/content/calculus/multivariable.content.js';

function buildMultivariablePayload({ operation, values }) {
  return {
    module: 'multivariable',
    operation,
    expr: String(values.expr || ''),
    variables: String(values.variables || 'x,y').replace(/\s+/g, ''),
    wrt: String(values.wrt || 'x').trim() || 'x',
  };
}

const multivariableConfig = {
  id: 'multivariable',
  eyebrow: 'Calculus',
  title: 'Multivariable Calculus',
  subtitle: 'First partial derivatives with respect to one variable.',
  theory: multivariableTheory,
  practice: {
    title: 'Partial derivative',
    description:
      'List every symbol that appears in the expression (comma-separated), then choose **Differentiate with respect to**.',
    operationLabel: 'Operation',
    submitLabel: 'Differentiate',
    loadingLabel: 'Computing…',
    calculate: calcMultivariable,
    buildPayload: buildMultivariablePayload,
    mapResult: (data) => data?.result ?? data,
    operations: [{ value: 'partial', label: '∂/∂xᵢ', hint: 'Partial derivative holding other variables fixed.', default: true }],
    fields: [
      {
        name: 'expr',
        label: 'Expression',
        type: 'text',
        defaultValue: 'x**2 * y + y**3',
        required: true,
        span: 'full',
      },
      {
        name: 'variables',
        label: 'Variables',
        type: 'text',
        defaultValue: 'x,y',
        hint: 'Comma-separated: x,y,z',
        required: true,
      },
      {
        name: 'wrt',
        label: 'Differentiate with respect to',
        type: 'text',
        defaultValue: 'x',
        required: true,
      },
    ],
  },
};

export default function Multivariable() {
  return <ModuleExperience config={multivariableConfig} />;
}
