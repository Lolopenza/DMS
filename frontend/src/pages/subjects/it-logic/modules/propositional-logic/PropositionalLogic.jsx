import React from 'react';
import { calcLogic } from '../../../../../api.js';
import { parseVars } from '../../../../../utils/parsers.js';
import MathResultBox from '../../../../../components/module/MathResultBox.jsx';
import { ClassificationRenderer } from '../../_shared/ITLogicModuleShell.jsx';
import propositionalLogicTheory from '../../../../../data/content/it-logic/propositional-logic.content.js';

/**
 * Propositional Logic module - migrated to ITLogicModuleShell.
 * Before: 68 lines with duplicate logic.
 * After: 50 lines of pure configuration.
 */
function buildPayload({ operation, values }) {
  return {
    operation,
    formula: String(values.formula || ''),
    variables: parseVars(values.variables),
  };
}

function PropositionalLogicResult({ result }) {
  if (!result) return null;
  const data = result?.result ?? result;

  return (
    <div className="space-y-4">
      {data.classification && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600">Classification:</span>
          <ClassificationRenderer classification={data.classification} />
        </div>
      )}

      {(data.true_rows !== undefined || data.false_rows !== undefined) && (
        <MathResultBox
          title="Truth Profile"
          content={`**True rows:** ${data.true_rows ?? 'n/a'}  \n**False rows:** ${data.false_rows ?? 'n/a'}`}
        />
      )}

      {data.dnf && <MathResultBox title="Disjunctive Normal Form (DNF)" content={`$$${data.dnf}$$`} />}
      {data.cnf && <MathResultBox title="Conjunctive Normal Form (CNF)" content={`$$${data.cnf}$$`} />}

      {!data.dnf && !data.cnf && data.message ? <MathResultBox title="Result" content={String(data.message)} /> : null}
    </div>
  );
}

const propositionalLogicConfig = {
  id: 'propositional-logic',
  eyebrow: 'Logic & Computation',
  title: 'Propositional Logic',
  subtitle: 'Classification, truth profiles, and normal forms.',
  theory: propositionalLogicTheory,
  practice: {
    title: 'Formula Analysis',
    description: 'Analyze a formula: classification, truth profile, and normal forms when available.',
    operationLabel: 'Operation',
    submitLabel: 'Analyze',
    loadingLabel: 'Analyzing...',
    calculate: calcLogic,
    buildPayload,
    mapResult: (data) => data?.result ?? data,
    resultRenderer: PropositionalLogicResult,
    operations: [{ value: 'formula_analysis', label: 'Formula Analysis', hint: 'Analyze classification and truth profile.', default: true }],
    fields: [
      { name: 'variables', label: 'Variables', smartType: 'set-list', defaultValue: 'P,Q', required: true },
      {
        name: 'formula',
        label: 'Formula',
        smartType: 'formula',
        defaultValue: '(P -> Q) & P',
        required: true,
        span: 'full',
        smartOptions: { multiline: true, useMathQuill: false },
      },
    ],
  },
};

export default propositionalLogicConfig;
