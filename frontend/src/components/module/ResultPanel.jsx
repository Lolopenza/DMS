import React, { useEffect, useMemo, useRef, useState } from 'react';

function formatValue(value) {
  if (typeof value === 'undefined' || value === null) return '';
  if (typeof value === 'number') return Number.isFinite(value) ? value : String(value);
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  if (typeof value === 'string') return value;
  return JSON.stringify(value, null, 2);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function renderPretty(value) {
  if (Array.isArray(value)) {
    if (value.length > 0 && value.every((row) => Array.isArray(row))) {
      return (
        <div className="table-responsive">
          <table className="table table-sm table-bordered mb-0" style={{ maxWidth: 'fit-content' }}>
            <tbody>
              {value.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} style={{ minWidth: '3rem', textAlign: 'center' }}>
                      {formatValue(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {value.map((item, index) => (
          <span key={index} className="badge bg-light text-dark border">
            {formatValue(item)}
          </span>
        ))}
      </div>
    );
  }

  if (isPlainObject(value)) {
    return (
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        {Object.entries(value).map(([key, nestedValue]) => (
          <div key={key}>
            <div style={{ fontWeight: 700, marginBottom: '0.15rem' }}>{key}</div>
            <div>{renderPretty(nestedValue)}</div>
          </div>
        ))}
      </div>
    );
  }

  return <span>{formatValue(value)}</span>;
}

export default function ResultPanel({
  title = 'Result',
  value,
  valueRenderer,
  steps,
  explanation,
  fallbackData,
}) {
  const [copyStatus, setCopyStatus] = useState('idle');
  const resetTimerRef = useRef(null);
  const hasValue = typeof value !== 'undefined' && value !== null;
  const resolvedValue = hasValue ? value : fallbackData;
  const stepsArray = Array.isArray(steps)
    ? steps
    : typeof steps === 'string' && steps.trim()
      ? [steps]
      : [];

  const copyText = useMemo(() => formatValue(resolvedValue), [resolvedValue]);

  function scheduleReset() {
    if (resetTimerRef.current) {
      window.clearTimeout(resetTimerRef.current);
    }
    resetTimerRef.current = window.setTimeout(() => {
      setCopyStatus('idle');
      resetTimerRef.current = null;
    }, 2000);
  }

  async function handleCopy() {
    if (!copyText) return;
    try {
      if (!navigator?.clipboard?.writeText) {
        throw new Error('Clipboard API is unavailable in this browser');
      }
      await navigator.clipboard.writeText(copyText);
      setCopyStatus('success');
      scheduleReset();
    } catch {
      setCopyStatus('error');
      scheduleReset();
    }
  }

  useEffect(() => () => {
    if (resetTimerRef.current) {
      window.clearTimeout(resetTimerRef.current);
    }
  }, []);

  if (!hasValue && !fallbackData) return null;

  return (
    <div className="result-container" tabIndex={0} aria-live="polite">
      <div className="result-heading-row">
        <h3><i className="fas fa-check-circle"></i> {title}</h3>
        <button
          type="button"
          className={`result-copy-btn ${copyStatus === 'success' ? 'is-success' : ''} ${copyStatus === 'error' ? 'is-error' : ''}`}
          onClick={handleCopy}
          aria-label={copyStatus === 'success' ? 'Result copied' : 'Copy result to clipboard'}
          title={copyStatus === 'success' ? 'Copied' : 'Copy result'}
        >
          <i className={`fas ${copyStatus === 'success' ? 'fa-check' : 'fa-copy'}`}></i>
        </button>
      </div>
      {copyStatus === 'error' ? (
        <div className="result-copy-feedback" role="status">
          Clipboard is unavailable. Please copy manually.
        </div>
      ) : null}
      <div className="math-display">
        {valueRenderer ? valueRenderer(value) : renderPretty(resolvedValue)}
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
