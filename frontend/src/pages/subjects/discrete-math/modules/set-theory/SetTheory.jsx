import React, { useState, useMemo } from 'react';
import { calcSetTheory } from '../../api/set-theory.js';
import { useToast } from '../../../../../components/Toast.jsx';
import { ModuleCard, ModulePage } from '../../../../../components/module/ModuleLayout.jsx';

const SET_OPS = [
  { op: 'union', label: 'A ∪ B' },
  { op: 'intersection', label: 'A ∩ B' },
  { op: 'difference', label: 'A \\ B' },
  { op: 'symmetric', label: 'A △ B' },
  { op: 'complement', label: 'Aᶜ' },
  { op: 'cartesian', label: 'A × B' },
  { op: 'power', label: '𝒫(A)' },
];

const SET_PROPS = [
  { prop: 'empty', label: 'Empty?' },
  { prop: 'finite', label: 'Finite?' },
  { prop: 'infinite', label: 'Infinite?' },
  { prop: 'cardinality', label: 'Cardinality' },
];

const SET_RELS = [
  { rel: 'relation_reflexive', label: 'Reflexive?' },
  { rel: 'relation_symmetric', label: 'Symmetric?' },
  { rel: 'relation_antisymmetric', label: 'Antisymmetric?' },
  { rel: 'relation_transitive', label: 'Transitive?' },
  { rel: 'relation_inverse', label: 'Inverse' },
  { rel: 'relation_reflexive_closure', label: 'Reflexive Closure' },
  { rel: 'relation_symmetric_closure', label: 'Symmetric Closure' },
  { rel: 'relation_transitive_closure', label: 'Transitive Closure' },
];

function parseSet(str) {
  return str.split(',').map(s => s.trim()).filter(Boolean);
}

// ── Venn Diagram (SVG, client-side) ─────────────────────────────────────────

function VennDiagram({ setA, setB, universe, highlight }) {
  const W = 373, H = 200;
  const cx1 = 133, cx2 = 240, cy = 100, r = 80;

  const sA = new Set(setA);
  const sB = new Set(setB);
  const sU = new Set(universe.length ? universe : [...sA, ...sB]);

  const onlyA   = [...sA].filter(x => !sB.has(x));
  const both    = [...sA].filter(x => sB.has(x));
  const onlyB   = [...sB].filter(x => !sA.has(x));
  const outside = [...sU].filter(x => !sA.has(x) && !sB.has(x));

  // Which regions to highlight based on last operation
  const hl = {
    union:        { a: true,  ab: true,  b: true  },
    intersection: { a: false, ab: true,  b: false },
    difference:   { a: true,  ab: false, b: false },
    symmetric:    { a: true,  ab: false, b: true  },
    complement:   { a: false, ab: false, b: false, out: true },
  }[highlight] ?? {};

  const regionColor = (active) =>
    active ? 'rgba(99,102,241,0.45)' : 'rgba(99,102,241,0.08)';

  // Clip path IDs
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }} aria-label="Venn diagram">
      <defs>
        <clipPath id="venn-clip-a"><circle cx={cx1} cy={cy} r={r} /></clipPath>
        <clipPath id="venn-clip-b"><circle cx={cx2} cy={cy} r={r} /></clipPath>
        {/* Universe rect */}
        <clipPath id="venn-clip-u"><rect x={4} y={4} width={W-8} height={H-8} rx={10} /></clipPath>
      </defs>

      {/* Universe border */}
      <rect x={4} y={4} width={W-8} height={H-8} rx={10}
        fill={hl.out ? 'rgba(99,102,241,0.18)' : 'rgba(99,102,241,0.03)'}
        stroke="rgba(99,102,241,0.3)" strokeWidth={1.5} />
      <text x={14} y={22} fontSize={11} fill="rgba(99,102,241,0.6)" fontWeight={600}>U</text>

      {/* Circle A fill — only-A region */}
      <circle cx={cx1} cy={cy} r={r} fill={regionColor(hl.a)} />

      {/* Circle B fill — only-B region */}
      <circle cx={cx2} cy={cy} r={r} fill={regionColor(hl.b)} />

      {/* Intersection overlay */}
      <circle cx={cx2} cy={cy} r={r} fill={regionColor(hl.ab)} clipPath="url(#venn-clip-a)" />

      {/* Circle borders */}
      <circle cx={cx1} cy={cy} r={r} fill="none" stroke="#6366f1" strokeWidth={2} />
      <circle cx={cx2} cy={cy} r={r} fill="none" stroke="#6366f1" strokeWidth={2} />

      {/* Labels A / B */}
      <text x={cx1 - 51} y={cy - r + 17} fontSize={15} fontWeight={800} fill="#a78bfa" textAnchor="middle">A</text>
      <text x={cx2 + 51} y={cy - r + 17} fontSize={15} fontWeight={800} fill="#a78bfa" textAnchor="middle">B</text>

      {/* Elements — only A */}
      {onlyA.slice(0, 6).map((el, i) => (
        <text key={el} x={cx1 - 35} y={cy - 18 + i * 15} fontSize={11} textAnchor="middle"
          fill="#e0e7ff" fontWeight={600}>{el}</text>
      ))}
      {/* Elements — intersection */}
      {both.slice(0, 5).map((el, i) => (
        <text key={el} x={(cx1 + cx2) / 2} y={cy - 16 + i * 15} fontSize={11} textAnchor="middle"
          fill="#e0e7ff" fontWeight={600}>{el}</text>
      ))}
      {/* Elements — only B */}
      {onlyB.slice(0, 6).map((el, i) => (
        <text key={el} x={cx2 + 35} y={cy - 18 + i * 15} fontSize={11} textAnchor="middle"
          fill="#e0e7ff" fontWeight={600}>{el}</text>
      ))}
      {/* Elements — outside (universe only) */}
      {outside.slice(0, 5).map((el, i) => (
        <text key={el} x={16 + i * 44} y={H - 10} fontSize={10} textAnchor="middle"
          fill="#94a3b8">{el}</text>
      ))}
    </svg>
  );
}

function formatSetResult(val) {
  if (Array.isArray(val)) {
    // Array of pairs (relation result) → {(a,b), (c,d)}
    if (val.length > 0 && Array.isArray(val[0])) {
      return '{' + val.map(p => `(${p.join(', ')})`).join(', ') + '}';
    }
    // Regular set → {1, 2, 3}
    return '{' + val.join(', ') + '}';
  }
  if (typeof val === 'boolean') return val ? 'True ✓' : 'False ✗';
  return String(val);
}

function ResultBox({ result }) {
  if (!result) return null;
  const val = result.result;
  const display = typeof val !== 'undefined' ? formatSetResult(val) : JSON.stringify(result);
  const rawSteps = result.steps ?? [];
  const steps = rawSteps
    .filter((s, i, arr) => arr.indexOf(s) === i)
    // Remove "operation_name: True/False/[...]" summary lines — already shown in result
    .filter(s => !/^[a-z_]+:\s*(True|False|\[)/i.test(s));
  return (
    <div className="result-container" tabIndex={0} aria-live="polite">
      <div className="math-display" style={{ fontSize: '1.15rem', letterSpacing: '0.01em' }}>
        {display}
      </div>
      {steps.length > 0 && (
        <div className="explanation-box" style={{ marginTop: '1rem' }}>
          <h4>Steps</h4>
          <ol style={{ margin: 0, paddingLeft: '1.2rem' }}>
            {steps.map((s, i) => <li key={i} style={{ marginBottom: '0.25rem', fontSize: '0.9rem' }}>{s}</li>)}
          </ol>
        </div>
      )}
    </div>
  );
}

export default function SetTheory() {
  const { showSuccess, showError } = useToast();

  const [setA, setSetA] = useState('1,2,3');
  const [setB, setSetB] = useState('2,3,4');
  const [universe, setUniverse] = useState('1,2,3,4,5');
  const [opsResult, setOpsResult] = useState(null);
  const [lastOp, setLastOp] = useState(null);

  const [setC, setSetC] = useState('1,2,3');
  const [propsResult, setPropsResult] = useState(null);
  const [loadingOp, setLoadingOp] = useState(null);

  const [relation, setRelation] = useState('(1,2),(2,3)');
  const [relUniverse, setRelUniverse] = useState('1,2,3');
  const [relResult, setRelResult] = useState(null);

  async function doSetOp(op) {
    setLoadingOp(op);
    try {
      const data = await calcSetTheory({
        operation: op,
        setA: parseSet(setA),
        setB: parseSet(setB),
        universe: parseSet(universe),
      });
      setOpsResult(data);
      setLastOp(op);
      showSuccess(`${op} calculated`);
    } catch (err) { showError(err.message); }
    finally { setLoadingOp(null); }
  }

  async function doSetProp(prop) {
    setLoadingOp(prop);
    try {
      const data = await calcSetTheory({ operation: prop, setA: parseSet(setC) });
      setPropsResult(data);
      showSuccess(`${prop} evaluated`);
    } catch (err) { showError(err.message); }
    finally { setLoadingOp(null); }
  }

  function parseRelation(str) {
    const pairs = [];
    const matches = str.match(/\(([^)]+)\)/g) || [];
    matches.forEach(m => {
      const inner = m.slice(1, -1).split(',').map(s => s.trim());
      if (inner.length === 2) pairs.push(inner);
    });
    return pairs;
  }

  async function doRelation(rel) {
    setLoadingOp(rel);
    try {
      const data = await calcSetTheory({ operation: rel, relation: parseRelation(relation), universe: parseSet(relUniverse) });
      setRelResult(data);
      showSuccess(`${rel} evaluated`);
    } catch (err) { showError(err.message); }
    finally { setLoadingOp(null); }
  }

  return (
    <ModulePage
      title="Set Theory Calculator"
      subtitle="Perform advanced set operations, properties, relations, and visualizations"
    >

      {/* Set Operations */}
      <div style={{ marginBottom: '1.5rem' }}>
        <ModuleCard title="Set Operations">
          {/* Inputs row */}
          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="setA">
                <span style={{ color: '#6366f1', fontWeight: 700, marginRight: '0.3rem' }}>A</span> Set A
              </label>
              <input type="text" id="setA" className="form-control" value={setA}
                onChange={e => { setSetA(e.target.value); setLastOp(null); }} placeholder="e.g. 1,2,3" />
            </div>
            <div className="form-group">
              <label htmlFor="setB">
                <span style={{ color: '#6366f1', fontWeight: 700, marginRight: '0.3rem' }}>B</span> Set B
              </label>
              <input type="text" id="setB" className="form-control" value={setB}
                onChange={e => { setSetB(e.target.value); setLastOp(null); }} placeholder="e.g. 2,3,4" />
            </div>
            <div className="form-group">
              <label htmlFor="universe">Universe U</label>
              <input type="text" id="universe" className="form-control" value={universe}
                onChange={e => setUniverse(e.target.value)} placeholder="e.g. 1,2,3,4,5" />
            </div>
          </div>

          {/* Operation buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', margin: '1rem 0' }}>
            {SET_OPS.map(({ op, label }) => (
              <button key={op} type="button"
                className="btn btn-outline"
                style={lastOp === op
                  ? { background: 'var(--primary,#6366f1)', color: '#fff', borderColor: 'var(--primary,#6366f1)' }
                  : {}}
                disabled={loadingOp === op}
                onClick={() => doSetOp(op)}>
                {loadingOp === op ? <i className="fas fa-spinner fa-spin"></i> : null} {label}
              </button>
            ))}
            <button type="button" className="btn btn-outline"
              onClick={() => { setOpsResult(null); setLastOp(null); setSetA('1,2,3'); setSetB('2,3,4'); setUniverse('1,2,3,4,5'); }}>
              Reset
            </button>
          </div>

          {/* Venn diagram — constrained width */}
          <div style={{
            background: 'var(--surface-100,#f8fafc)',
            border: '1px solid var(--border-color,#e2e8f0)',
            borderRadius: '12px',
            padding: '1rem 1rem 0.75rem',
            marginBottom: '0.5rem',
            maxWidth: '800px',
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-500,#64748b)', marginBottom: '0.5rem', textAlign: 'center' }}>
              Venn Diagram{lastOp ? ` — ${lastOp}` : ''}
            </div>
            <VennDiagram
              setA={parseSet(setA)}
              setB={parseSet(setB)}
              universe={parseSet(universe)}
              highlight={lastOp}
            />
          </div>

          {/* Result below diagram */}
          <ResultBox result={opsResult} />
        </ModuleCard>
      </div>

      {/* Set Properties */}
      <div style={{ marginBottom: '1.5rem' }}>
        <ModuleCard title="Set Properties">
          <div className="form-group">
            <label htmlFor="setC">Set</label>
            <input type="text" id="setC" className="form-control" value={setC} onChange={e => setSetC(e.target.value)} placeholder="e.g. 1,2,3" />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
            {SET_PROPS.map(({ prop, label }) => (
              <button key={prop} type="button" className="btn btn-outline"
                style={{ borderColor: 'var(--success,#22c55e)', color: 'var(--success,#22c55e)' }}
                disabled={loadingOp === prop}
                onClick={() => doSetProp(prop)}>
                {loadingOp === prop ? <i className="fas fa-spinner fa-spin"></i> : null} {label}
              </button>
            ))}
            <button type="button" className="btn btn-outline" onClick={() => { setPropsResult(null); setSetC('1,2,3'); }}>Reset</button>
          </div>
          <ResultBox result={propsResult} />
        </ModuleCard>
      </div>

      {/* Set Relations */}
      <ModuleCard title="Relations">
          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="relation">Relation (list of pairs)</label>
              <input type="text" id="relation" className="form-control" value={relation} onChange={e => setRelation(e.target.value)} placeholder="e.g. (1,2),(2,3)" />
            </div>
            <div className="form-group">
              <label htmlFor="relUniverse">Universe</label>
              <input type="text" id="relUniverse" className="form-control" value={relUniverse} onChange={e => setRelUniverse(e.target.value)} placeholder="e.g. 1,2,3" />
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
            {SET_RELS.map(({ rel, label }) => (
              <button key={rel} type="button" className="btn btn-outline"
                style={{ borderColor: '#38bdf8', color: '#38bdf8' }}
                disabled={loadingOp === rel}
                onClick={() => doRelation(rel)}>
                {loadingOp === rel ? <i className="fas fa-spinner fa-spin"></i> : null} {label}
              </button>
            ))}
            <button type="button" className="btn btn-outline" onClick={() => { setRelResult(null); setRelation('(1,2),(2,3)'); setRelUniverse('1,2,3'); }}>Reset</button>
          </div>
          <ResultBox result={relResult} />
      </ModuleCard>
    </ModulePage>
  );
}
