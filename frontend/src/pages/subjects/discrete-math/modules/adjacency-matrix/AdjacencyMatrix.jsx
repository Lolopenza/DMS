import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { calcAdjacencyMatrix } from '../../api/adjacency-matrix.js';
import { useToast } from '../../../../../components/Toast.jsx';
import { ModuleCard, ModulePage } from '../../../../../components/module/ModuleLayout.jsx';

const DEFAULT_SIZE = 4;

function createMatrix(n, fill = 0) {
  return Array.from({ length: n }, () => Array(n).fill(fill));
}

function MatrixResult({ op, data }) {
  if (!data) return null;

  // Graph Info → key-value stats
  if (op === 'info') {
    const entries = [
      ['Vertices', data.num_vertices],
      ['Edges', data.num_edges],
      ['Directed', data.directed ? 'Yes' : 'No'],
      ['Weighted', data.weighted ? 'Yes' : 'No'],
    ];
    if (data.degrees) entries.push(['Degrees', data.degrees.join(', ')]);
    return (
      <table className="truth-table" style={{ maxWidth: '360px' }}>
        <tbody>
          {entries.map(([label, val]) => (
            <tr key={label}><td style={{ fontWeight: 600 }}>{label}</td><td>{String(val)}</td></tr>
          ))}
        </tbody>
      </table>
    );
  }

  // Validate → square / symmetric
  if (op === 'validate') {
    return (
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {[['Square', data.square], ['Symmetric', data.symmetric]].map(([label, val]) => (
          <div key={label} style={{
            padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 600,
            background: val ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
            color: val ? '#16a34a' : '#dc2626',
            border: `1px solid ${val ? '#86efac' : '#fca5a5'}`,
          }}>
            {label}: {val ? 'Yes ✓' : 'No ✗'}
          </div>
        ))}
      </div>
    );
  }

  // Degree Analysis (batch) → table per node
  if (op === 'batch_analysis' && Array.isArray(data)) {
    const isDireted = 'in_degree' in (data[0] || {});
    return (
      <table className="truth-table" style={{ maxWidth: '480px' }}>
        <thead>
          <tr>
            <th>Node</th>
            {isDireted ? <><th>In</th><th>Out</th><th>Total</th></> : <th>Degree</th>}
            <th>Neighbors</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.node}>
              <td>{row.node + 1}</td>
              {isDireted
                ? <><td>{row.in_degree}</td><td>{row.out_degree}</td><td>{row.total}</td></>
                : <td>{row.degree}</td>}
              <td style={{ fontFamily: 'var(--font-mono,monospace)', fontSize: '0.85rem' }}>
                {'{' + (row.neighbors ?? [...(row.out_neighbors ?? []), ...(row.in_neighbors ?? [])]).map(n => n + 1).join(', ') + '}'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // Edge List → table
  if (op === 'to_edge_list' && Array.isArray(data)) {
    return (
      <table className="truth-table" style={{ maxWidth: '300px' }}>
        <thead><tr><th>From</th><th>To</th><th>Weight</th></tr></thead>
        <tbody>
          {data.map(([u, v, w], i) => (
            <tr key={i}><td>{u + 1}</td><td>{v + 1}</td><td>{w}</td></tr>
          ))}
        </tbody>
      </table>
    );
  }

  // Adjacency List → node: [neighbors]
  if (op === 'adjacency_list' && typeof data === 'object' && !Array.isArray(data)) {
    return (
      <div style={{ fontFamily: 'var(--font-mono,monospace)', fontSize: '0.95rem', lineHeight: 1.7 }}>
        {Object.entries(data).map(([node, neighbors]) => (
          <div key={node}>
            <span style={{ color: 'var(--primary,#6366f1)', fontWeight: 600 }}>{Number(node) + 1}</span>
            {' → '}
            {Array.isArray(neighbors) && neighbors.length > 0
              ? neighbors.map(n => n + 1).join(', ')
              : '∅'}
          </div>
        ))}
      </div>
    );
  }

  // Fallback
  return (
    <pre style={{ background: 'var(--surface-100,#f8f9fa)', padding: '1rem', borderRadius: '8px', overflowX: 'auto', fontSize: '0.9rem' }}>
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

// Simple debounce hook
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function AdjacencyMatrix() {
  const { showSuccess, showError } = useToast();
  const cyRef = useRef(null);
  const cyInstance = useRef(null);

  const [size, setSize] = useState(DEFAULT_SIZE);
  const [matrix, setMatrix] = useState(createMatrix(DEFAULT_SIZE));
  const [directed, setDirected] = useState(false);
  const [weighted, setWeighted] = useState(false);
  const [result, setResult] = useState(null);
  const [loadingOp, setLoadingOp] = useState(null);

  // Debounce matrix/directed/weighted before rebuilding Cytoscape (avoids redraws while typing)
  const debouncedMatrix = useDebounce(matrix, 400);
  const debouncedDirected = useDebounce(directed, 400);
  const debouncedWeighted = useDebounce(weighted, 400);

  // Rebuild Cytoscape when debounced values change
  useEffect(() => {
    if (!window.cytoscape || !cyRef.current) return;
    if (cyInstance.current) cyInstance.current.destroy();

    const n = debouncedMatrix.length;
    const elements = [];
    for (let i = 0; i < n; i++) {
      elements.push({ data: { id: String(i + 1), label: String(i + 1) } });
    }
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (debouncedMatrix[i][j] && debouncedMatrix[i][j] !== 0) {
          if (!debouncedDirected && j <= i) continue;
          elements.push({ data: { id: `e${i}-${j}`, source: String(i + 1), target: String(j + 1), weight: debouncedMatrix[i][j] } });
        }
      }
    }

    cyInstance.current = window.cytoscape({
      container: cyRef.current,
      elements,
      style: [
        { selector: 'node', style: { 'background-color': '#6366f1', 'label': 'data(label)', 'color': '#fff', 'text-valign': 'center', 'font-size': '14px', 'width': '36px', 'height': '36px' } },
        { selector: 'edge', style: { 'line-color': '#a5b4fc', 'target-arrow-color': '#6366f1', 'target-arrow-shape': debouncedDirected ? 'triangle' : 'none', 'curve-style': 'bezier', 'label': debouncedWeighted ? 'data(weight)' : '', 'font-size': '11px', 'color': '#1e293b', 'text-background-opacity': 0, 'text-outline-color': '#fff', 'text-outline-width': 2 } },
      ],
      layout: { name: n <= 8 ? 'circle' : 'cose', animate: false },
      minZoom: 0.3,
      maxZoom: 3,
      wheelSensitivity: 0.3,
    });

    return () => {};
  }, [debouncedMatrix, debouncedDirected, debouncedWeighted]);

  function handleCellChange(i, j, val) {
    // Allow empty string while typing; clamp to integer on blur
    const newMatrix = matrix.map(row => [...row]);
    newMatrix[i][j] = val === '' || val === '-' ? val : parseInt(val, 10) || 0;
    if (!directed) newMatrix[j][i] = newMatrix[i][j];
    setMatrix(newMatrix);
  }

  function handleCellBlur(i, j) {
    // Finalise any incomplete value to 0 on blur
    const val = matrix[i][j];
    if (val === '' || val === '-') {
      const newMatrix = matrix.map(row => [...row]);
      newMatrix[i][j] = 0;
      if (!directed) newMatrix[j][i] = 0;
      setMatrix(newMatrix);
    }
  }

  function resizeMatrix(newSize) {
    setSize(newSize);
    setMatrix(prev => {
      const m = createMatrix(newSize);
      for (let i = 0; i < Math.min(newSize, prev.length); i++) {
        for (let j = 0; j < Math.min(newSize, prev[0].length); j++) {
          m[i][j] = prev[i][j];
        }
      }
      return m;
    });
  }

  // Map button ops to backend sub-routes and payloads
  const OPERATIONS = [
    { op: 'info',           label: 'Graph Info',       subPath: 'info',            buildPayload: () => ({ graph: { matrix, directed, weighted } }) },
    { op: 'batch_analysis', label: 'Degree Analysis',  subPath: 'batch_analysis',  buildPayload: () => ({ matrix, directed, weighted }) },
    { op: 'to_edge_list',   label: 'Edge List',        subPath: 'to_edge_list',    buildPayload: () => ({ matrix, directed, weighted }) },
    { op: 'adjacency_list', label: 'Adjacency List',   subPath: 'to_adjacency_list', buildPayload: () => ({ matrix, directed, weighted }) },
    { op: 'validate',       label: 'Validate',         subPath: 'validate',        buildPayload: () => ({ matrix, directed, weighted }) },
  ];

  async function handleAnalyze(op) {
    const opDef = OPERATIONS.find(o => o.op === op);
    if (!opDef) return;
    setLoadingOp(op);
    try {
      const data = await calcAdjacencyMatrix(opDef.subPath, opDef.buildPayload());
      setResult({ op, data: data.result ?? data });
      showSuccess(`${op} done`);
    } catch (err) {
      showError('Error: ' + err.message);
    } finally {
      setLoadingOp(null);
    }
  }

  return (
    <ModulePage
      title="Adjacency Matrix Calculator"
      subtitle="Edit, analyze, and visualize graphs using adjacency matrices"
    >

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Matrix editor */}
        <ModuleCard title="Matrix Editor" icon="fa-th">
            {/* Controls */}
            <div className="matrix-controls">
              <div className="form-group" style={{ margin: 0 }}>
                <label>Size (n): {size}</label>
                <input type="range" min="1" max="12" value={size} onChange={e => resizeMatrix(Number(e.target.value))} style={{ width: '100px', marginLeft: '0.5rem' }} />
              </div>
              <label className="matrix-label-row">
                <input type="checkbox" checked={directed} onChange={e => setDirected(e.target.checked)} />
                Directed
              </label>
              <label className="matrix-label-row">
                <input type="checkbox" checked={weighted} onChange={e => setWeighted(e.target.checked)} />
                Weighted
              </label>
              <button className="btn btn-outline" onClick={() => setMatrix(createMatrix(size))}>
                <i className="fas fa-sync"></i> Reset
              </button>
            </div>

            {/* Matrix grid — row/col headers + cells */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                {/* Column headers */}
                <thead>
                  <tr>
                    <th style={{ width: '28px' }}></th>
                    {matrix[0].map((_, j) => (
                      <th key={j} style={{
                        width: '52px', textAlign: 'center', padding: '2px 4px',
                        fontSize: '0.78rem', fontWeight: 700,
                        color: 'var(--primary,#6366f1)', opacity: 0.7,
                      }}>
                        {j + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrix.map((row, i) => (
                    <tr key={i}>
                      {/* Row header */}
                      <td style={{
                        textAlign: 'center', fontSize: '0.78rem', fontWeight: 700,
                        color: 'var(--primary,#6366f1)', opacity: 0.7, paddingRight: '4px',
                      }}>
                        {i + 1}
                      </td>
                      {row.map((cell, j) => {
                        const isDiag = i === j;
                        return (
                          <td key={j} style={{ padding: '2px' }}>
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="-?[0-9]*"
                              value={cell}
                              onChange={e => handleCellChange(i, j, e.target.value)}
                              onFocus={e => e.target.select()}
                              onBlur={() => handleCellBlur(i, j)}
                              disabled={!directed && isDiag}
                              style={{
                                width: '48px',
                                height: '38px',
                                textAlign: 'center',
                                border: isDiag
                                  ? '1.5px solid var(--gray-300,#cbd5e1)'
                                  : '1.5px solid var(--primary,#6366f1)',
                                borderRadius: '6px',
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                color: '#1e293b',
                                background: isDiag ? '#f1f5f9' : '#fff',
                                cursor: !directed && isDiag ? 'not-allowed' : 'text',
                                outline: 'none',
                                boxSizing: 'border-box',
                              }}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </ModuleCard>

        {/* Graph visualization */}
        <ModuleCard title="Graph" icon="fa-project-diagram">
            <div ref={cyRef} style={{ height: '320px', border: '1px solid #e0e7ef', borderRadius: '8px' }}></div>
        </ModuleCard>
      </div>

      {/* Analysis */}
      <div style={{ marginTop: '1.5rem' }}>
        <ModuleCard title="Analysis" icon="fa-chart-bar">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            {OPERATIONS.map(({ op, label }) => (
              <button key={op} className="btn btn-outline" disabled={loadingOp === op} onClick={() => handleAnalyze(op)}>
                {loadingOp === op ? <i className="fas fa-spinner fa-spin"></i> : null} {label}
              </button>
            ))}
          </div>
          {result && (
            <div className="result-container" tabIndex={0} aria-live="polite">
              <h3><i className="fas fa-check-circle"></i> {result.op}</h3>
              <MatrixResult op={result.op} data={result.data} />
            </div>
          )}
        </ModuleCard>
      </div>
    </ModulePage>
  );
}
