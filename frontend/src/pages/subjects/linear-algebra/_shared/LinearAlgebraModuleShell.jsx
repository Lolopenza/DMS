import React, { useState } from 'react';
import { useCalculator } from '../../../../hooks/useCalculator.js';
import { parseVector, parseMatrix, parseNumber } from '../../../../utils/parsers.js';
import CalculatorCard from '../../../../components/module/CalculatorCard.jsx';
import { LinearAlgebraResultRenderer } from '../../../../components/module/ResultRenderers.jsx';
import { FormGroup, FormSelect, CalculateButton } from '../../../../components/module/FormInputs.jsx';
import SmartCalculatorInput from '../../../../components/module/SmartCalculatorInput.jsx';

function resolveSmartType(field) {
  if (field.smartType) return field.smartType;
  if (field.type === 'matrix') return 'matrix-grid';
  if (field.type === 'vector') return 'vector-list';
  if (field.type === 'number') return 'validated-number';
  return null;
}

function defaultMatrixSmartOptions() {
  return {
    valueFormat: 'linear_algebra',
    square: false,
    minSize: 2,
    maxSize: 12,
    binaryActions: false,
  };
}

function validateLaFields(fields, operation, fieldValues) {
  const errors = {};
  for (const field of fields) {
    if (field.showWhen && !field.showWhen.includes(operation)) continue;
    if (!field.required) continue;
    const raw = fieldValues[field.key];
    const empty = raw === '' || raw === undefined || raw === null;
    if (empty) errors[field.key] = 'This field is required.';
  }
  return errors;
}

/**
 * Premium Linear Algebra Module Shell.
 * Uses SmartCalculatorInput for matrices (grid), vectors (chip list), and validated numbers.
 */
export default function LinearAlgebraModuleShell({
  title,
  subtitle,
  description,
  module,
  operationOptions,
  defaultOperation,
  fields,
  calculate,
}) {
  const [operation, setOperation] = useState(defaultOperation);
  const [fieldValues, setFieldValues] = useState(() => {
    const initial = {};
    fields.forEach((field) => {
      const dv = field.defaultValue;
      initial[field.key] = dv !== undefined && dv !== null ? String(dv) : '';
    });
    return initial;
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const { result, loading, calculate: executeCalculation } = useCalculator(calculate, {
    successMessage: 'Calculation complete',
  });

  const selectedOp = operationOptions.find((op) => op.value === operation);

  function setFieldValue(name, value) {
    setFieldValues((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  async function handleCalculate() {
    const validation = validateLaFields(fields, operation, fieldValues);
    if (Object.keys(validation).length) {
      setFieldErrors(validation);
      return;
    }
    setFieldErrors({});

    try {
      const payload = { module, operation };

      for (const field of fields) {
        if (field.showWhen && !field.showWhen.includes(operation)) {
          continue;
        }

        const rawValue = fieldValues[field.key];

        let parsedValue;
        if (field.type === 'vector') {
          parsedValue = parseVector(rawValue, field.label);
        } else if (field.type === 'matrix') {
          parsedValue = parseMatrix(rawValue, field.label);
        } else if (field.type === 'number') {
          parsedValue = parseNumber(rawValue, field.label);
        } else {
          parsedValue = rawValue;
        }

        payload[field.key] = parsedValue;
      }

      await executeCalculation(payload);
    } catch {
      // Error already handled by useCalculator
    }
  }

  const visibleFields = fields.filter((field) => {
    if (!field.showWhen) return true;
    return field.showWhen.includes(operation);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{title}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">{subtitle}</p>
      </div>

      <CalculatorCard
        title="Linear Algebra Calculator"
        description={description || 'Perform matrix and vector operations with LaTeX-rendered results'}
        resultComponent={
          result ? (
            <LinearAlgebraResultRenderer result={result} operation={operation} />
          ) : null
        }
      >
        <FormSelect
          label="Operation"
          value={operation}
          onChange={(e) => setOperation(e.target.value)}
          options={operationOptions}
          hint={selectedOp?.hint}
        />

        {visibleFields.map((field) => {
          const st = resolveSmartType(field);
          if (st) {
            const augmented = {
              ...field,
              name: field.key,
              smartType: st,
              smartOptions:
                field.type === 'matrix'
                  ? { ...defaultMatrixSmartOptions(), ...field.smartOptions }
                  : field.smartOptions,
            };
            return (
              <SmartCalculatorInput
                key={field.key}
                field={augmented}
                value={fieldValues[field.key] ?? ''}
                values={fieldValues}
                setValue={setFieldValue}
                operation={operation}
                error={fieldErrors[field.key]}
              />
            );
          }

          return (
            <FormGroup
              key={field.key}
              label={field.label}
              value={fieldValues[field.key]}
              onChange={(e) => setFieldValue(field.key, e.target.value)}
              type="text"
              placeholder={field.defaultValue}
              hint={field.help}
              required
            />
          );
        })}

        <CalculateButton loading={loading} onClick={handleCalculate}>
          Calculate
        </CalculateButton>
      </CalculatorCard>
    </div>
  );
}
