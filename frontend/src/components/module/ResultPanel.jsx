import React from 'react';

function formatValue(value) {
  if (typeof value === 'undefined' || value === null) return '';
  if (typeof value === 'number') return Number.isFinite(value) ? value : String(value);
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

export default function ResultPanel({
  title = 'Result',
  value,
  valueRenderer,
  steps,
  explanation,
  fallbackData,
}) {
  const hasValue = typeof value !== 'undefined' && value !== null;
  const stepsArray = Array.isArray(steps)
    ? steps
    : typeof steps === 'string' && steps.trim()
      ? [steps]
      : [];

  if (!hasValue && !fallbackData) return null;

  return (
    <div className="result-container" tabIndex={0} aria-live="polite">
      <h3><i className="fas fa-check-circle"></i> {title}</h3>
      <div className="math-display">
        {valueRenderer ? valueRenderer(value) : formatValue(hasValue ? value : fallbackData)}
      </div>

      {stepsArray.length > 0 && (
        <div className="explanation-box" style={{ marginTop: '1rem' }}>
          <h4>Steps</h4>
          <ol style={{ margin: 0, paddingLeft: '1.2rem' }}>
            {stepsArray.map((s, i) => (
              <li key={i} style={{ marginBottom: '0.25rem', fontSize: '0.9rem' }}>{s}</li>
            ))}
          </ol>
        </div>
      )}

      {explanation && (
        <div className="explanation-box" style={{ marginTop: '1rem' }}>
          <h4>Explanation</h4>
          <div>{explanation}</div>
        </div>
      )}
    </div>
  );
}
