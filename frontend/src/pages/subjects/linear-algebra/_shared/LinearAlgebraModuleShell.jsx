import React, { useState } from 'react';
import { useToast } from '../../../../components/Toast.jsx';
import { ModuleCard, ModulePage } from '../../../../components/module/ModuleLayout.jsx';
import ResultPanel from '../../../../components/module/ResultPanel.jsx';

function parseVector(value) {
  const parts = String(value)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
    .map(Number);
  if (!parts.length || parts.some((v) => !Number.isFinite(v))) {
    throw new Error('Vector must contain comma-separated numeric values');
  }
  return parts;
}

function parseMatrix(value) {
  const rows = String(value)
    .split(';')
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => row.split(',').map((v) => Number(v.trim())));

  if (!rows.length || rows.some((row) => row.some((v) => !Number.isFinite(v)))) {
    throw new Error('Matrix must use format: 1,2;3,4');
  }
  const width = rows[0].length;
  if (!width || rows.some((row) => row.length !== width)) {
    throw new Error('All matrix rows must have the same number of columns');
  }
  return rows;
}

function parseNumber(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    throw new Error('Numeric field contains invalid value');
  }
  return numeric;
}

function parseFieldValue(type, value) {
  if (type === 'vector') return parseVector(value);
  if (type === 'matrix') return parseMatrix(value);
  if (type === 'number') return parseNumber(value);
  return value;
}

export default function LinearAlgebraModuleShell({
  title,
  subtitle,
  intro,
  operationOptions,
  defaultOperation,
  fields,
  calculate,
}) {
  const [operation, setOperation] = useState(defaultOperation || operationOptions?.[0]?.value || '');
  const [formValues, setFormValues] = useState(
    Object.fromEntries((fields || []).map((field) => [field.key, field.defaultValue ?? '']))
  );
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useToast();

  function updateField(key, value) {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCalculate() {
    try {
      const payload = { operation };
      for (const field of fields || []) {
        if (field.showWhen && !field.showWhen.includes(operation)) continue;
        const rawValue = formValues[field.key];
        payload[field.key] = parseFieldValue(field.type || 'text', rawValue);
      }

      setLoading(true);
      const data = await calculate(payload);
      setResult(data?.result ?? data);
      showSuccess('Calculation complete');
    } catch (err) {
      showError(err.message || 'Failed to run calculation');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModulePage title={title} subtitle={subtitle}>
      <ModuleCard title="Concept" icon="fa-book-open">
        <div className="theory-intro">
          <p>{intro}</p>
        </div>
      </ModuleCard>

      <ModuleCard title="Calculator" icon="fa-calculator">
        <div className="form-group">
          <label htmlFor={`${title}-operation`}>Operation</label>
          <select
            id={`${title}-operation`}
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
          >
            {(operationOptions || []).map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {(fields || []).map((field) => {
          if (field.showWhen && !field.showWhen.includes(operation)) return null;
          const fieldId = `${title}-${field.key}`;
          const isMultiline = field.type === 'matrix';

          return (
            <div className="form-group" key={field.key}>
              <label htmlFor={fieldId}>{field.label}</label>
              {isMultiline ? (
                <textarea
                  id={fieldId}
                  rows={4}
                  value={formValues[field.key]}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  placeholder={field.placeholder}
                />
              ) : (
                <input
                  id={fieldId}
                  type={field.type === 'number' ? 'number' : 'text'}
                  value={formValues[field.key]}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  placeholder={field.placeholder}
                />
              )}
              {field.help ? <div className="form-hint">{field.help}</div> : null}
            </div>
          );
        })}

        <button type="button" className="btn btn-primary" onClick={handleCalculate} disabled={loading}>
          <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-play'}`}></i> {loading ? 'Calculating...' : 'Calculate'}
        </button>

        {result ? <ResultPanel title="Result" value={result} /> : null}
      </ModuleCard>
    </ModulePage>
  );
}
