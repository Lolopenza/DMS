import React from 'react';
import { calcLogic } from '../../../../../api.js';
import { parseVars } from '../../../../../utils/parsers.js';
import MathResultBox from '../../../../../components/module/MathResultBox.jsx';
import equivalenceLawsTheory from '../../../../../data/content/it-logic/equivalence-laws.content.js';

/**
 * Equivalence Laws module - migrated to ITLogicModuleShell.
 * Before: 83 lines with duplicate logic.
 * After: 60 lines of pure configuration.
 */
function buildPayload({ operation, values }) {
  return {
    operation,
    formula: String(values.formula || ''),
    variables: parseVars(values.variables),
  };
}

function VerdictBadge({ valid }) {
  return (
    <div className="flex items-center justify-center py-8">
      <div
        className={`inline-flex items-center gap-3 px-6 py-4 rounded-xl border-2 ${
          valid ? 'bg-green-50 border-green-300 text-green-800' : 'bg-red-50 border-red-300 text-red-800'
        }`}
      >
        {valid ? (
          <>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-lg font-bold">Valid ✓</span>
          </>
        ) : (
          <>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-lg font-bold">Invalid ✗</span>
          </>
        )}
      </div>
    </div>
  );
}

function EquivalenceResult({ result }) {
  if (!result) return null;
  const data = result?.result ?? result;

  if (typeof data === 'boolean') return <VerdictBadge valid={data} />;
  if (data && typeof data === 'object' && data.valid !== undefined) {
    return (
      <div className="space-y-4">
        <VerdictBadge valid={Boolean(data.valid)} />
        {data.counterexample ? <MathResultBox title="Counterexample" content={JSON.stringify(data.counterexample, null, 2)} /> : null}
      </div>
    );
  }

  return <MathResultBox title="Result" content={JSON.stringify(data, null, 2)} />;
}

const equivalenceConfig = {
  id: 'equivalence-laws',
  eyebrow: 'Logic & Computation',
  title: 'Equivalence Laws',
  subtitle: 'Verify equivalence and implication validity.',
  theory: equivalenceLawsTheory,
  practice: {
    title: 'Equivalence Checker',
    description: 'Check validity for equivalence or implication operations (engine-defined semantics).',
    operationLabel: 'Operation',
    submitLabel: 'Check',
    loadingLabel: 'Checking...',
    calculate: calcLogic,
    buildPayload,
    mapResult: (data) => data?.result ?? data,
    resultRenderer: EquivalenceResult,
    operations: [
      { value: 'equivalence', label: 'Equivalence', hint: 'Check if two formulas are equivalent (engine-defined).', default: true },
      { value: 'implication', label: 'Implication', hint: 'Check if F1 implies F2 (engine-defined).' },
    ],
    fields: [
      { name: 'variables', label: 'Variables', smartType: 'set-list', defaultValue: 'P,Q', required: true },
      {
        name: 'formula',
        label: 'Formula',
        smartType: 'formula',
        defaultValue: 'P -> Q',
        required: true,
        span: 'full',
        smartOptions: { multiline: true, useMathQuill: false },
        hint: 'If your engine expects two formulas, encode them in the formula field using its supported syntax.',
      },
    ],
  },
};

export default equivalenceConfig;
