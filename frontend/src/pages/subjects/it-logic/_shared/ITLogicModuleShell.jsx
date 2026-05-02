import React, { useState } from 'react';
import { calcLogic } from '../../../../api.js';
import { useCalculator } from '../../../../hooks/useCalculator.js';
import { parseVars } from '../../../../utils/parsers.js';
import CalculatorCard from '../../../../components/module/CalculatorCard.jsx';
import MathResultBox, { formatResult } from '../../../../components/module/MathResultBox.jsx';
import { FormSelect, CalculateButton } from '../../../../components/module/FormInputs.jsx';
import SmartCalculatorInput from '../../../../components/module/SmartCalculatorInput.jsx';

/**
 * Unified shell for IT Logic modules (PropositionalLogic, TruthTables, EquivalenceLaws, BooleanAlgebra).
 * Uses SmartCalculatorInput for variable chips and formula entry.
 */
export default function ITLogicModuleShell({
  title,
  subtitle,
  operations = [],
  defaultOperation = 'truth_table',
  defaultFormula = '(P | Q) & ~R',
  defaultVariables = 'P,Q,R',
  customResultRenderer = null,
}) {
  const [operation, setOperation] = useState(defaultOperation);
  const [values, setValues] = useState({
    variables: defaultVariables,
    formula: defaultFormula,
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const { result, loading, calculate } = useCalculator(calcLogic, {
    successMessage: 'Calculation complete',
  });

  const selectedOp = operations.find((op) => op.value === operation);

  function setValue(name, v) {
    setValues((prev) => ({ ...prev, [name]: v }));
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  async function handleCalculate() {
    const errors = {};
    if (!String(values.variables || '').trim()) errors.variables = 'Add at least one variable.';
    if (!String(values.formula || '').trim()) errors.formula = 'Enter a formula.';
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    try {
      const parsedVars = parseVars(values.variables);
      await calculate({
        operation,
        formula: values.formula,
        variables: parsedVars,
      });
    } catch {
      // Error already handled by useCalculator
    }
  }

  const resultComponent = result ? (
    customResultRenderer ? (
      customResultRenderer(result, operation)
    ) : (
      <MathResultBox content={formatResult(result)} title="Result" />
    )
  ) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{title}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">{subtitle}</p>
      </div>

      <CalculatorCard
        title="Logic Calculator"
        description="Analyze propositional formulas, generate truth tables, and verify logical equivalences"
        resultComponent={resultComponent}
      >
        <FormSelect
          label="Operation"
          value={operation}
          onChange={(e) => setOperation(e.target.value)}
          options={operations}
          hint={selectedOp?.hint}
        />

        <SmartCalculatorInput
          field={{
            name: 'variables',
            label: 'Variables',
            smartType: 'set-list',
            required: true,
            hint: 'Comma-separated names, or use chips (order is preserved left-to-right).',
          }}
          value={values.variables}
          values={values}
          setValue={setValue}
          operation={operation}
          error={fieldErrors.variables}
        />

        <SmartCalculatorInput
          field={{
            name: 'formula',
            label: 'Formula',
            smartType: 'formula',
            required: true,
            hint: 'Supported operators: & | ~ -> <-> ^ (and unicode variants)',
            placeholder: '(P -> Q) & P',
            smartOptions: { multiline: true, useMathQuill: false },
          }}
          value={values.formula}
          values={values}
          setValue={setValue}
          operation={operation}
          error={fieldErrors.formula}
        />

        <CalculateButton loading={loading} onClick={handleCalculate}>
          {loading ? 'Calculating...' : 'Calculate'}
        </CalculateButton>
      </CalculatorCard>
    </div>
  );
}

/**
 * Helper component for rendering truth tables.
 */
export function TruthTableRenderer({ headers = [], rows = [] }) {
  if (!headers.length || !rows.length) {
    return <p className="text-sm text-slate-500">No table data available</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
        <thead className="bg-slate-100">
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50 transition-colors">
              {row.map((cell, j) => (
                <td key={`${i}-${j}`} className="px-4 py-3 text-sm text-slate-800 font-mono">
                  {cell === true ? 'T' : cell === false ? 'F' : String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Helper component for rendering classification results.
 */
export function ClassificationRenderer({ classification }) {
  if (!classification) return null;

  const badges = {
    tautology: { label: 'Tautology', color: 'bg-green-100 text-green-800 border-green-200' },
    contradiction: { label: 'Contradiction', color: 'bg-red-100 text-red-800 border-red-200' },
    contingency: { label: 'Contingency', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    satisfiable: { label: 'Satisfiable', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    unsatisfiable: { label: 'Unsatisfiable', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  };

  const badge = badges[classification.toLowerCase()] || {
    label: classification,
    color: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-semibold text-sm">
      <span className={`inline-block px-3 py-1 rounded-full ${badge.color}`}>{badge.label}</span>
    </div>
  );
}
