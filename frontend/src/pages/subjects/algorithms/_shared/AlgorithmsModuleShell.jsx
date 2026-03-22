import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../../../components/Toast.jsx';
import { ModuleCard, ModulePage } from '../../../../components/module/ModuleLayout.jsx';
import ResultPanel from '../../../../components/module/ResultPanel';

function parseNumber(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    throw new Error('Numeric field contains invalid value');
  }
  return num;
}

function parseNumberArray(value) {
  const parts = String(value)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
    .map(Number);

  if (!parts.length || parts.some((v) => !Number.isFinite(v))) {
    throw new Error('Array must contain comma-separated numeric values');
  }
  return parts;
}

function parseFieldValue(type, value) {
  if (type === 'number') return parseNumber(value);
  if (type === 'number-array') return parseNumberArray(value);
  return value;
}

function safeParseArray(input) {
  if (typeof input !== 'string') return [];
  return input
    .split(',')
    .map((v) => Number(v.trim()))
    .filter((v) => Number.isFinite(v));
}

function ArrayBars({ values = [], label }) {
  if (!values.length) return null;
  const maxAbs = Math.max(...values.map((n) => Math.abs(n)), 1);
  return (
    <div className="algo-visual-group">
      <div className="algo-visual-label">{label}</div>
      <div className="algo-bars">
        {values.map((value, index) => {
          const width = `${Math.max((Math.abs(value) / maxAbs) * 100, 8)}%`;
          return (
            <div key={`${label}-${index}`} className="algo-bar-row">
              <span className="algo-bar-index">{index + 1}</span>
              <div className="algo-bar-track">
                <div className="algo-bar-fill" style={{ width }}></div>
              </div>
              <span className="algo-bar-value">{value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AlgorithmsVisualization({ result, payload }) {
  if (!result || typeof result !== 'object') return null;

  if (Array.isArray(result.sorted)) {
    const source = safeParseArray(payload?.array);
    return (
      <div className="algo-visualization">
        <h4>Visual View</h4>
        {source.length ? <ArrayBars values={source} label="Input array" /> : null}
        <ArrayBars values={result.sorted} label="Sorted array" />
      </div>
    );
  }

  if (Array.isArray(result.comparison)) {
    const max = Math.max(...result.comparison.map((item) => Number(item?.value) || 0), 1);
    return (
      <div className="algo-visualization">
        <h4>Complexity Comparison</h4>
        <div className="algo-bars">
          {result.comparison.map((item) => {
            const raw = Number(item?.value) || 0;
            const width = `${Math.max((raw / max) * 100, 10)}%`;
            return (
              <div key={item.type} className="algo-bar-row">
                <span className="algo-bar-index" style={{ width: '7rem' }}>{item.type}</span>
                <div className="algo-bar-track">
                  <div className="algo-bar-fill" style={{ width }}></div>
                </div>
                <span className="algo-bar-value">{raw}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (Array.isArray(result.traversal)) {
    return (
      <div className="algo-visualization">
        <h4>Traversal Order</h4>
        <div className="algo-flow">
          {result.traversal.map((node, index) => (
            <React.Fragment key={`${node}-${index}`}>
              <span className="algo-node">{node}</span>
              {index < result.traversal.length - 1 ? <i className="fas fa-arrow-right algo-arrow"></i> : null}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

const AlgorithmsModuleShell = ({
  title,
  subtitle,
  intro,
  operationOptions = [],
  defaultOperation = '',
  fields = [],
  crossLink = null,
  calculate,
}) => {
  const [operation, setOperation] = useState(defaultOperation || operationOptions[0]?.value || '');
  const [values, setValues] = useState(
    Object.fromEntries((fields || []).map((field) => [field.key, field.defaultValue ?? ''])),
  );
  const [result, setResult] = useState(null);
  const [lastPayload, setLastPayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useToast();

  const activeFields = fields.filter(
    (field) => !field.showWhen || field.showWhen.includes(operation),
  );

  const handleFieldChange = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleCalculate = async () => {
    try {
      setLoading(true);

      const payload = { operation };
      for (const field of fields || []) {
        if (field.showWhen && !field.showWhen.includes(operation)) continue;
        payload[field.key] = parseFieldValue(field.type || 'text', values[field.key]);
      }

      setLastPayload(payload);
      const res = await calculate(payload);
      setResult(res?.result ?? res);
      showSuccess('Calculation complete');
    } catch (err) {
      showError(err.message || 'Calculation failed');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModulePage title={title} subtitle={subtitle}>
      <ModuleCard title="Concept" icon="fa-book-open">
        <div className="theory-intro">
          <p>{intro}</p>
          {crossLink?.to && crossLink?.label ? (
            <div style={{ marginTop: '0.75rem' }}>
              <Link to={crossLink.to} className="btn btn-outline btn-deep-dive">
                <i className="fas fa-arrow-right"></i> {crossLink.label}
              </Link>
            </div>
          ) : null}
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
            {operationOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {activeFields.map((field) => {
          const fieldId = `${title}-${field.key}`;
          const isMultiline = field.type === 'textarea' || field.type === 'graph';
          const isSelect = field.type === 'select';
          return (
            <div className="form-group" key={field.key}>
              <label htmlFor={fieldId}>{field.label}</label>
              {isSelect ? (
                <select
                  id={fieldId}
                  value={values[field.key]}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                >
                  {(field.options || []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : isMultiline ? (
                <textarea
                  id={fieldId}
                  rows={field.rows || 3}
                  value={values[field.key]}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={field.placeholder || ''}
                />
              ) : (
                <input
                  id={fieldId}
                  type={field.type === 'number' ? 'number' : 'text'}
                  value={values[field.key]}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={field.placeholder || ''}
                />
              )}
              {field.hint ? <div className="form-hint">{field.hint}</div> : null}
            </div>
          );
        })}

        <button type="button" className="btn btn-primary" onClick={handleCalculate} disabled={loading}>
          <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-play'}`}></i> {loading ? 'Calculating...' : 'Calculate'}
        </button>

        {result ? <AlgorithmsVisualization result={result} payload={lastPayload} /> : null}
        {result ? <ResultPanel title="Result" value={result} /> : null}
      </ModuleCard>
    </ModulePage>
  );
};

export default AlgorithmsModuleShell;
