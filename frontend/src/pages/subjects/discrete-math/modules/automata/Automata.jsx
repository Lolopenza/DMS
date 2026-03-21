import React, { useState, useMemo, useRef, useEffect } from 'react';
import { calcAutomata } from '../../api/automata.js';
import { useToast } from '../../../../../components/Toast.jsx';
import { ModuleCard, ModulePage } from '../../../../../components/module/ModuleLayout.jsx';

// ── Transition table helpers ─────────────────────────────────────────────────

function buildEmptyTable(stateList, symbolList) {
  const t = {};
  stateList.forEach(s => {
    t[s] = {};
    symbolList.forEach(sym => { t[s][sym] = ''; });
  });
  return t;
}

function tableToTransitions(table, isNFA) {
  const obj = {};
  Object.entries(table).forEach(([state, row]) => {
    const filled = Object.entries(row).filter(([, v]) => v.trim() !== '');
    if (filled.length === 0) return;
    obj[state] = {};
    filled.forEach(([sym, val]) => {
      obj[state][sym] = isNFA
        ? val.split(',').map(s => s.trim()).filter(Boolean)
        : val.trim();
    });
  });
  return obj;
}

// ── Result renderer ──────────────────────────────────────────────────────────

function AutomataResult({ result, inputString }) {
  if (!result) return null;

  const accepted = result.accepted;
  const trace = result.trace ?? result.path ?? null;
  const finalStates = result.final_states ?? null;

  return (
    <div className="result-container" tabIndex={0} aria-live="polite">
      {/* Accept / Reject banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '1rem',
        background: accepted ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
        border: `1.5px solid ${accepted ? '#86efac' : '#fca5a5'}`,
      }}>
        <span style={{ fontSize: '1.8rem' }}>{accepted ? '✓' : '✗'}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: accepted ? '#16a34a' : '#dc2626' }}>
            String &ldquo;{inputString}&rdquo; {accepted ? 'ACCEPTED' : 'REJECTED'}
          </div>
          {finalStates && (
            <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.2rem' }}>
              Final states: {finalStates.join(', ')}
            </div>
          )}
        </div>
      </div>

      {/* Trace */}
      {trace && Array.isArray(trace) && trace.length > 0 && (
        <div className="explanation-box">
          <h4 style={{ marginBottom: '0.75rem' }}>Execution Trace</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.25rem' }}>
            {trace.map((state, i) => (
              <React.Fragment key={i}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  minWidth: '36px', height: '36px', padding: '0 0.5rem',
                  borderRadius: '50%', fontWeight: 600, fontSize: '0.9rem',
                  background: state === '∅' ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)',
                  color: state === '∅' ? '#dc2626' : 'var(--primary,#6366f1)',
                  border: `1.5px solid ${state === '∅' ? '#fca5a5' : '#a5b4fc'}`,
                }}>
                  {state}
                </span>
                {i < trace.length - 1 && (
                  <span style={{ color: 'var(--gray-400,#94a3b8)', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                    {inputString[i] ? `—${inputString[i]}→` : '→'}
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function Automata() {
  const { showSuccess, showError } = useToast();
  const cyRef = useRef(null);
  const cyInstance = useRef(null);

  const [type, setType] = useState('dfa');
  const [statesRaw, setStatesRaw] = useState('q0,q1,q2');
  const [alphabetRaw, setAlphabetRaw] = useState('a,b');
  const [startState, setStartState] = useState('q0');
  const [acceptStates, setAcceptStates] = useState('q2');
  const [inputString, setInputString] = useState('ab');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Transition table state: { [state]: { [symbol]: string } }
  const [transTable, setTransTable] = useState({ q0: { a: 'q1', b: '' }, q1: { a: '', b: 'q2' }, q2: { a: 'q0', b: '' } });

  const stateList = useMemo(
    () => statesRaw.split(',').map(s => s.trim()).filter(Boolean),
    [statesRaw],
  );
  const symbolList = useMemo(
    () => alphabetRaw.split(',').map(s => s.trim()).filter(Boolean),
    [alphabetRaw],
  );

  // Rebuild table when states/alphabet change — preserve existing values
  function rebuildTable(newStates, newSymbols) {
    setTransTable(prev => {
      const next = {};
      newStates.forEach(s => {
        next[s] = {};
        newSymbols.forEach(sym => {
          next[s][sym] = prev[s]?.[sym] ?? '';
        });
      });
      return next;
    });
  }

  function handleStatesChange(val) {
    setStatesRaw(val);
    const newStates = val.split(',').map(s => s.trim()).filter(Boolean);
    rebuildTable(newStates, symbolList);
    setResult(null);
  }

  function handleAlphabetChange(val) {
    setAlphabetRaw(val);
    const newSymbols = val.split(',').map(s => s.trim()).filter(Boolean);
    rebuildTable(stateList, newSymbols);
    setResult(null);
  }

  function handleCellChange(state, symbol, val) {
    setTransTable(prev => ({
      ...prev,
      [state]: { ...prev[state], [symbol]: val },
    }));
    setResult(null);
  }

  const isNFA = type === 'nfa';
  const acceptList = useMemo(
    () => acceptStates.split(',').map(s => s.trim()).filter(Boolean),
    [acceptStates],
  );

  // Rebuild Cytoscape state diagram whenever automaton definition changes
  useEffect(() => {
    if (!window.cytoscape || !cyRef.current) return;
    if (cyInstance.current) cyInstance.current.destroy();

    const elements = [];
    stateList.forEach(s => {
      const isStart = s === startState.trim();
      const isAccept = acceptList.includes(s);
      elements.push({
        data: { id: s, label: s, isStart, isAccept },
        classes: [isStart ? 'start-node' : '', isAccept ? 'accept-node' : ''].join(' ').trim(),
      });
    });

    // Group edges by (source, target) to merge labels
    const edgeMap = {};
    Object.entries(transTable).forEach(([state, row]) => {
      Object.entries(row).forEach(([sym, val]) => {
        const targets = isNFA
          ? val.split(',').map(s => s.trim()).filter(Boolean)
          : val.trim() ? [val.trim()] : [];
        targets.forEach(tgt => {
          if (!stateList.includes(tgt)) return;
          const key = `${state}__${tgt}`;
          if (!edgeMap[key]) edgeMap[key] = { src: state, tgt, syms: [] };
          edgeMap[key].syms.push(sym);
        });
      });
    });

    Object.entries(edgeMap).forEach(([key, { src, tgt, syms }]) => {
      elements.push({
        data: { id: `e_${key}`, source: src, target: tgt, label: syms.join(',') },
      });
    });

    cyInstance.current = window.cytoscape({
      container: cyRef.current,
      elements,
      style: [
        { selector: 'node', style: {
          'background-color': '#6366f1', 'label': 'data(label)',
          'color': '#fff', 'text-valign': 'center', 'font-size': '13px',
          'width': '44px', 'height': '44px',
          'border-width': 2, 'border-color': '#4f46e5',
        }},
        { selector: 'node.accept-node', style: {
          'border-width': 4, 'border-color': '#22c55e',
        }},
        { selector: 'node.start-node', style: {
          'background-color': '#8b5cf6',
        }},
        { selector: 'edge', style: {
          'line-color': '#a5b4fc', 'target-arrow-color': '#6366f1',
          'target-arrow-shape': 'triangle', 'curve-style': 'bezier',
          'label': 'data(label)', 'font-size': '12px',
          'color': '#1e293b', 'text-background-opacity': 0,
          'text-outline-color': '#fff', 'text-outline-width': 2,
        }},
      ],
      layout: { name: stateList.length <= 6 ? 'circle' : 'cose', animate: false },
      minZoom: 0.3, maxZoom: 3, wheelSensitivity: 0.3,
    });
    return () => {};
  }, [stateList, symbolList, transTable, startState, acceptList, isNFA]);

  async function handleSimulate() {
    setLoading(true);
    try {
      const operation = isNFA ? 'nfa_process' : 'dfa_process';
      const automatonKey = isNFA ? 'nfa' : 'dfa';
      const automatonData = {
        states: stateList,
        alphabet: symbolList,
        transitions: tableToTransitions(transTable, isNFA),
        start_state: startState.trim(),
        accept_states: acceptList,
      };
      const data = await calcAutomata({
        operation,
        [automatonKey]: automatonData,
        input_string: inputString,
      });
      setResult(data.result ?? data);
      showSuccess('Simulation complete');
    } catch (err) {
      showError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModulePage
      title="Automata Calculator"
      subtitle="Simulate DFA and NFA — check string acceptance"
    >

      <ModuleCard title="Automaton Simulator" icon="fa-cogs">

          {/* Type selector */}
          <div className="form-group" style={{ maxWidth: '360px', marginBottom: '1.25rem' }}>
            <label htmlFor="type">Type</label>
            <select id="type" value={type} onChange={e => { setType(e.target.value); setResult(null); }}>
              <option value="dfa">DFA — Deterministic Finite Automaton</option>
              <option value="nfa">NFA — Nondeterministic Finite Automaton</option>
            </select>
          </div>

          {/* States + Alphabet row */}
          <div className="form-row" style={{ marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label htmlFor="states">
                <i className="fas fa-circle" style={{ fontSize: '0.7rem', marginRight: '0.4rem' }}></i>
                States
              </label>
              <input
                type="text" id="states"
                value={statesRaw}
                onChange={e => handleStatesChange(e.target.value)}
                placeholder="q0, q1, q2"
              />
              <div className="form-hint">Comma-separated, e.g. q0,q1,q2</div>
            </div>
            <div className="form-group">
              <label htmlFor="alphabet">
                <i className="fas fa-font" style={{ fontSize: '0.75rem', marginRight: '0.4rem' }}></i>
                Alphabet
              </label>
              <input
                type="text" id="alphabet"
                value={alphabetRaw}
                onChange={e => handleAlphabetChange(e.target.value)}
                placeholder="a, b"
              />
              <div className="form-hint">Comma-separated, e.g. a,b</div>
            </div>
          </div>

          {/* Transition table */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label>
              <i className="fas fa-table" style={{ marginRight: '0.4rem' }}></i>
              Transition Table
              {isNFA && <span style={{ fontSize: '0.8rem', opacity: 0.7, marginLeft: '0.5rem' }}>(NFA: comma-separate multiple states)</span>}
            </label>
            <div style={{ overflowX: 'auto', marginTop: '0.5rem' }}>
              <table className="automata-table">
                <thead>
                  <tr>
                    <th className="delta-header">δ (state \ input)</th>
                    {symbolList.map(sym => (
                      <th key={sym} className="symbol-header">{sym}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stateList.map((state, i) => {
                    const isStart = state === startState.trim();
                    const isAccept = acceptList.includes(state);
                    return (
                      <tr key={state} style={{ background: i % 2 === 0 ? 'var(--surface-100,#f8fafc)' : 'var(--surface-0,#fff)' }}>
                        <td className="state-cell">
                          {isStart && <span title="Start state" style={{ marginRight: '4px', color: '#22c55e' }}>→</span>}
                          {isAccept
                            ? <span title="Accept state" style={{ border: '2px solid currentColor', borderRadius: '50%', padding: '0 4px', display: 'inline-block' }}>{state}</span>
                            : state}
                        </td>
                        {symbolList.map(sym => (
                          <td key={sym} className="input-cell">
                            <input
                              type="text"
                              className="trans-input"
                              value={transTable[state]?.[sym] ?? ''}
                              onChange={e => handleCellChange(state, sym, e.target.value)}
                              onFocus={e => e.target.select()}
                              placeholder="—"
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Start + Accept + Input row */}
          <div className="form-row" style={{ marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label htmlFor="startState">
                <span style={{ color: '#22c55e', marginRight: '0.3rem' }}>→</span>
                Start State
              </label>
              <input
                type="text" id="startState"
                value={startState}
                onChange={e => { setStartState(e.target.value); setResult(null); }}
                placeholder="q0"
                style={{ maxWidth: '120px' }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="acceptStates">
                <span style={{ marginRight: '0.3rem' }}>◎</span>
                Accept States
              </label>
              <input
                type="text" id="acceptStates"
                value={acceptStates}
                onChange={e => { setAcceptStates(e.target.value); setResult(null); }}
                placeholder="q2"
              />
              <div className="form-hint">Comma-separated</div>
            </div>
            <div className="form-group">
              <label htmlFor="inputString">
                <i className="fas fa-keyboard" style={{ marginRight: '0.4rem' }}></i>
                Input String
              </label>
              <input
                type="text" id="inputString"
                value={inputString}
                onChange={e => { setInputString(e.target.value); setResult(null); }}
                placeholder="ab"
                style={{ maxWidth: '160px', fontFamily: 'var(--font-mono,monospace)', letterSpacing: '0.1em' }}
              />
            </div>
          </div>

          <button type="button" className="btn btn-primary" onClick={handleSimulate} disabled={loading}>
            <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-play'}`}></i> {loading ? 'Simulating…' : 'Simulate'}
          </button>

          <AutomataResult result={result} inputString={inputString} />
      </ModuleCard>

      {/* State Diagram */}
      <div style={{ marginTop: '1.5rem' }}>
        <ModuleCard title="State Diagram" icon="fa-project-diagram">
          <div ref={cyRef} style={{ height: '320px', border: '1px solid #e0e7ef', borderRadius: '8px' }}></div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', opacity: 0.7, display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', background: '#8b5cf6', marginRight: 5, verticalAlign: 'middle' }}></span>Start state</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', background: '#6366f1', border: '3px solid #22c55e', marginRight: 5, verticalAlign: 'middle' }}></span>Accept state</span>
          </div>
        </ModuleCard>
      </div>

      {/* Legend */}
      <div style={{ marginTop: '1.5rem' }}>
        <ModuleCard title="Notation Guide" icon="fa-book">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.9rem' }}>
            <div>
              <span style={{ color: '#22c55e', fontWeight: 700, marginRight: '0.4rem' }}>→ q0</span>
              Start state
            </div>
            <div>
              <span style={{ border: '2px solid var(--primary,#6366f1)', borderRadius: '50%', padding: '0 5px', fontWeight: 700, marginRight: '0.4rem', color: 'var(--primary,#6366f1)' }}>q2</span>
              Accept state (double circle)
            </div>
            <div>
              <span style={{ fontFamily: 'monospace', marginRight: '0.4rem', color: '#94a3b8' }}>—</span>
              No transition (empty cell = dead/reject)
            </div>
            {type === 'nfa' && (
              <div>
                <span style={{ fontFamily: 'monospace', marginRight: '0.4rem', color: 'var(--primary,#6366f1)' }}>q1,q2</span>
                NFA: multiple target states (comma-separated in cell)
              </div>
            )}
          </div>
        </ModuleCard>
      </div>
    </ModulePage>
  );
}
