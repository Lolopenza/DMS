import React from 'react';
import { calcLogic } from '../../../../../api.js';
import { parseVars } from '../../../../../utils/parsers.js';
import MathResultBox from '../../../../../components/module/MathResultBox.jsx';
import { TruthTableRenderer, ClassificationRenderer } from '../../_shared/ITLogicModuleShell.jsx';
import truthTablesTheory from '../../../../../data/content/it-logic/truth-tables.content.js';

function buildPayload({ operation, values }) {
  return {
    operation,
    formula: String(values.formula || ''),
    variables: parseVars(values.variables),
  };
}

function TruthTablesResult({ result }) {
  if (!result) return null;

  const data = result?.result ?? result;

  return (
    <div className="space-y-4">
      {data.classification ? (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Classification:</span>
          <ClassificationRenderer classification={data.classification} />
        </div>
      ) : null}

      {data.headers && data.table ? (
        <div>
          <h4 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Truth Table</h4>
          <TruthTableRenderer headers={data.headers} rows={data.table} />
        </div>
      ) : (
        <MathResultBox title="Result" content={JSON.stringify(data, null, 2)} />
      )}
    </div>
  );
}

const truthTablesConfig = {
  id: 'truth-tables',
  eyebrow: 'Logic & Computation',
  title: 'Truth Tables',
  subtitle: 'Generate complete truth tables for compound formulas.',
  theory: truthTablesTheory,
  practice: {
    title: 'Truth Table Generator',
    description: 'Enter variables and a formula to generate a full truth table and classification.',
    operationLabel: 'Operation',
    submitLabel: 'Generate',
    loadingLabel: 'Generating...',
    calculate: calcLogic,
    buildPayload,
    mapResult: (data) => data?.result ?? data,
    resultRenderer: TruthTablesResult,
    operations: [
      { value: 'truth_table', label: 'Truth Table', hint: 'Generate a complete truth table.', default: true },
    ],
    fields: [
      {
        name: 'variables',
        label: 'Variables',
        smartType: 'set-list',
        defaultValue: 'P,Q,R',
        hint: 'Comma-separated, e.g. P,Q,R — or use chips.',
        required: true,
      },
      {
        name: 'formula',
        label: 'Formula',
        smartType: 'formula',
        defaultValue: '(P | Q) & ~R',
        hint: 'Supported operators: & | ~ -> <-> ^ (and unicode variants)',
        required: true,
        span: 'full',
        smartOptions: { multiline: true, useMathQuill: false },
      },
    ],
  },
};

export default truthTablesConfig;
