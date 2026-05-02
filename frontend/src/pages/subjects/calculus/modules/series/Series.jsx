import React from 'react';
import ModuleExperience from '../../../../../components/module/ModuleExperience.jsx';
import { calcSeries } from '../../api/series.js';
import seriesTheory from '../../../../../data/content/calculus/series.content.js';

function buildSeriesPayload({ operation, values }) {
  const n = Math.min(20, Math.max(1, parseInt(values.taylor_order, 10) || 6));
  return {
    module: 'series',
    operation,
    expr: String(values.expr || ''),
    variable: String(values.variable || 'x').trim() || 'x',
    about: String(values.about ?? '0'),
    taylor_order: n,
    order: n,
  };
}

const seriesConfig = {
  id: 'series',
  eyebrow: 'Calculus',
  title: 'Series',
  subtitle: 'Taylor / Maclaurin polynomial truncations for univariate expressions.',
  theory: seriesTheory,
  practice: {
    title: 'Taylor expansion',
    description: 'Expands near **about** (use `0` for Maclaurin). Higher term count increases local accuracy near the expansion point.',
    operationLabel: 'Operation',
    submitLabel: 'Expand',
    loadingLabel: 'Computing…',
    calculate: calcSeries,
    buildPayload: buildSeriesPayload,
    mapResult: (data) => data?.result ?? data,
    operations: [{ value: 'taylor', label: 'Taylor polynomial', hint: 'Truncated Taylor series (order term removed).', default: true }],
    fields: [
      {
        name: 'expr',
        label: 'Expression',
        type: 'text',
        defaultValue: 'exp(x)',
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
        name: 'about',
        label: 'Expand about',
        type: 'text',
        defaultValue: '0',
        hint: 'Point a in (x − a)^k',
        required: true,
      },
      {
        name: 'taylor_order',
        label: 'Terms / depth',
        smartType: 'validated-number',
        type: 'number',
        min: 1,
        max: 20,
        defaultValue: '6',
        required: true,
      },
    ],
  },
};

export default function Series() {
  return <ModuleExperience config={seriesConfig} />;
}
