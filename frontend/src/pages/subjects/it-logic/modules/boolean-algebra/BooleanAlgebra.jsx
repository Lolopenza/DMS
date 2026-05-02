import React from 'react';
import { calcLogic } from '../../../../../api.js';
import { parseVars } from '../../../../../utils/parsers.js';
import MathResultBox from '../../../../../components/module/MathResultBox.jsx';
import { ClassificationRenderer } from '../../_shared/ITLogicModuleShell.jsx';
import booleanAlgebraTheory from '../../../../../data/content/it-logic/boolean-algebra.content.js';

/**
 * Boolean Algebra module - migrated to ITLogicModuleShell.
 * Before: 67 lines with duplicate logic.
 * After: 55 lines of pure configuration.
 */
function buildPayload({ operation, values }) {
  return {
    operation,
    formula: String(values.formula || ''),
    variables: parseVars(values.variables),
  };
}

function BooleanAlgebraResult({ result }) {
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

      {data.dnf && <MathResultBox title="Disjunctive Normal Form (DNF)" content={`$$${data.dnf}$$`} />}
      {data.cnf && <MathResultBox title="Conjunctive Normal Form (CNF)" content={`$$${data.cnf}$$`} />}
      {data.simplified_dnf && <MathResultBox title="Simplified DNF" content={`$$${data.simplified_dnf}$$`} />}
      {data.simplified_cnf && <MathResultBox title="Simplified CNF" content={`$$${data.simplified_cnf}$$`} />}
    </div>
  );
}

const booleanAlgebraConfig = {
  id: 'boolean-algebra',
  eyebrow: 'Logic & Computation',
  title: 'Boolean Algebra',
  subtitle: 'Compute canonical and simplified normal forms.',
  theory: booleanAlgebraTheory,
  practice: {
    title: 'Normal Forms',
    description: 'Compute CNF/DNF (and simplified forms when available) for a propositional formula.',
    operationLabel: 'Operation',
    submitLabel: 'Compute',
    loadingLabel: 'Computing...',
    calculate: calcLogic,
    buildPayload,
    mapResult: (data) => data?.result ?? data,
    resultRenderer: BooleanAlgebraResult,
    operations: [{ value: 'normal_forms', label: 'Normal Forms (CNF/DNF)', hint: 'Compute canonical and simplified normal forms.', default: true }],
    fields: [
      { name: 'variables', label: 'Variables', smartType: 'set-list', defaultValue: 'P,Q,R', required: true },
      {
        name: 'formula',
        label: 'Formula',
        smartType: 'formula',
        defaultValue: '(P -> Q) & (Q -> R)',
        required: true,
        span: 'full',
        smartOptions: { multiline: true, useMathQuill: false },
      },
    ],
  },
};

export default booleanAlgebraConfig;
