import React, { useState } from 'react';
import { calcLogic } from '../../api/logic.js';
import { useToast } from '../../../../../components/Toast.jsx';
import { ModuleCard, ModulePage } from '../../../../../components/module/ModuleLayout.jsx';

export default function Logic() {
  const { showSuccess, showError } = useToast();

  const [variables, setVariables] = useState('P,Q');
  const [exprType, setExprType] = useState('and');
  const [customExpr, setCustomExpr] = useState('');
  const [truthResult, setTruthResult] = useState(null);

  const [expr1, setExpr1] = useState('P → Q');
  const [expr2, setExpr2] = useState('¬P ∨ Q');
  const [eqVars, setEqVars] = useState('P,Q');
  const [eqResult, setEqResult] = useState(null);
  const [loadingTruth, setLoadingTruth] = useState(false);
  const [loadingEq, setLoadingEq] = useState(false);

  // Map friendly op names to backend formula strings
  const PRESET_FORMULAS = {
    and: 'P & Q',
    or: 'P | Q',
    implies: 'P -> Q',
    iff: 'P <-> Q',
    xor: 'P ^ Q',
    nand: '~(P & Q)',
    nor: '~(P | Q)',
  };

  async function handleTruthTable() {
    setLoadingTruth(true);
    try {
      const vars = variables.split(',').map(v => v.trim()).filter(Boolean);
      let formula = exprType === 'custom' ? customExpr : PRESET_FORMULAS[exprType] ?? exprType;
      if (exprType !== 'custom' && vars.length >= 2) {
        formula = formula.replaceAll('P', vars[0]).replaceAll('Q', vars[1]);
      }
      const data = await calcLogic({ operation: 'truth_table', variables: vars, formula });
      setTruthResult(data.result ?? data);
      showSuccess('Truth table generated');
    } catch (err) {
      showError('Error: ' + err.message);
    } finally {
      setLoadingTruth(false);
    }
  }

  async function handleEquivalence() {
    setLoadingEq(true);
    try {
      const data = await calcLogic({
        operation: 'equivalence',
        formula1: expr1,
        formula2: expr2,
        variables: eqVars.split(',').map(v => v.trim()).filter(Boolean),
      });
      setEqResult(data.result ?? data);
      showSuccess('Equivalence check done');
    } catch (err) {
      showError('Error: ' + err.message);
    } finally {
      setLoadingEq(false);
    }
  }

  const LOGIC_SYMBOLS = [
    { sym: '∧', title: 'AND' },
    { sym: '∨', title: 'OR' },
    { sym: '¬', title: 'NOT' },
    { sym: '→', title: 'IMPLIES' },
    { sym: '↔', title: 'IFF' },
    { sym: '⊕', title: 'XOR' },
  ];

  function insertSymbol(sym) {
    const input = document.getElementById('customExpr');
    if (!input) { setCustomExpr(prev => prev + sym); return; }
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const newVal = customExpr.slice(0, start) + sym + customExpr.slice(end);
    setCustomExpr(newVal);
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start + sym.length, start + sym.length);
    });
  }

  function renderTable(result) {
    if (!result || !result.table) return null;
    const headers = result.headers || [];
    const rows = result.table || [];
    return (
      <table className="truth-table">
        <thead>
          <tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>{row.map((cell, j) => <td key={j}>{cell === true || cell === 'True' ? 'T' : cell === false || cell === 'False' ? 'F' : String(cell)}</td>)}</tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <ModulePage
      title="Logic Calculator"
      subtitle="Generate truth tables and evaluate logical expressions"
    >

      {/* Truth Table */}
      <ModuleCard title="Truth Table Generator" icon="fa-table">
          <div className="theory-intro">
            <p>A truth table shows all possible combinations of input values and the resulting output for a logical expression.</p>
          </div>
          <div className="form-container">
            <div className="form-group">
              <label htmlFor="variables"><i className="fas fa-font"></i> Variables</label>
              <input type="text" id="variables" value={variables} onChange={e => setVariables(e.target.value)} placeholder="P,Q" />
              <div className="form-hint">Enter variable names separated by commas</div>
            </div>
            <div className="form-group">
              <label htmlFor="exprType"><i className="fas fa-code"></i> Logical Operation</label>
              <select id="exprType" value={exprType} onChange={e => setExprType(e.target.value)}>
                <option value="and">Conjunction (AND)</option>
                <option value="or">Disjunction (OR)</option>
                <option value="implies">Implication (→)</option>
                <option value="iff">Biconditional (↔)</option>
                <option value="xor">Exclusive OR (⊕)</option>
                <option value="nand">NAND</option>
                <option value="nor">NOR</option>
                <option value="custom">Custom Expression</option>
              </select>
            </div>
            {exprType === 'custom' && (
              <div className="form-group">
                <label htmlFor="customExpr"><i className="fas fa-edit"></i> Custom Expression</label>
                <div className="symbol-insert-bar">
                  {LOGIC_SYMBOLS.map(({ sym, title }) => (
                    <button key={sym} type="button" className="symbol-btn" title={title} onClick={() => insertSymbol(sym)}>
                      {sym}
                    </button>
                  ))}
                </div>
                <input type="text" id="customExpr" value={customExpr} onChange={e => setCustomExpr(e.target.value)} placeholder="P ∧ (Q ∨ ¬P)" />
                <div className="form-hint">Click symbols above or type manually</div>
              </div>
            )}
            <div className="form-actions">
              <button type="button" className="btn btn-primary" onClick={handleTruthTable} disabled={loadingTruth}>
                <i className={`fas ${loadingTruth ? 'fa-spinner fa-spin' : 'fa-table'}`}></i> {loadingTruth ? 'Generating…' : 'Generate Truth Table'}
              </button>
            </div>
          </div>
          {truthResult && (
            <div className="result-container" tabIndex={0} aria-live="polite">
              <h3><i className="fas fa-check-circle"></i> Truth Table</h3>
              <div id="tableResult">{renderTable(truthResult)}</div>
              {truthResult.analysis && (
                <div className="explanation-box">
                  <h4>Expression Analysis</h4>
                  <div>{truthResult.analysis}</div>
                </div>
              )}
            </div>
          )}
      </ModuleCard>

      {/* Equivalence Checker */}
      <ModuleCard title="Logical Equivalence Checker" icon="fa-calculator">
          <div className="theory-intro">
            <p>Check if two logical expressions are equivalent by comparing their truth tables.</p>
          </div>
          <div className="form-container">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="expr1"><i className="fas fa-edit"></i> Expression 1</label>
                <input type="text" id="expr1" value={expr1} onChange={e => setExpr1(e.target.value)} placeholder="P → Q" />
              </div>
              <div className="form-group">
                <label htmlFor="expr2"><i className="fas fa-edit"></i> Expression 2</label>
                <input type="text" id="expr2" value={expr2} onChange={e => setExpr2(e.target.value)} placeholder="¬P ∨ Q" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="eqVars"><i className="fas fa-font"></i> Variables</label>
              <input type="text" id="eqVars" value={eqVars} onChange={e => setEqVars(e.target.value)} placeholder="P,Q" />
              <div className="form-hint">Enter variables separated by commas</div>
            </div>
            <button type="button" className="btn btn-primary" onClick={handleEquivalence} disabled={loadingEq}>
              <i className={`fas ${loadingEq ? 'fa-spinner fa-spin' : 'fa-equals'}`}></i> {loadingEq ? 'Checking…' : 'Check Equivalence'}
            </button>
          </div>
          {eqResult && (
            <div className="result-container" tabIndex={0} aria-live="polite">
              <h3><i className="fas fa-check-circle"></i> Equivalence Result</h3>
              <div>{typeof eqResult.equivalent !== 'undefined'
                ? (eqResult.equivalent ? '✓ The expressions are logically equivalent.' : '✗ The expressions are NOT logically equivalent.')
                : typeof eqResult === 'boolean'
                  ? (eqResult ? '✓ Equivalent.' : '✗ Not equivalent.')
                  : JSON.stringify(eqResult)
              }</div>
            </div>
          )}
      </ModuleCard>

      {/* Logic Reference */}
      <ModuleCard title="Logic Reference" icon="fa-book">
          <div className="reference-grid">
            <div className="reference-item">
              <h4>Negation (NOT)</h4>
              <table className="mini-table">
                <thead><tr><th>P</th><th>¬P</th></tr></thead>
                <tbody>
                  <tr><td>T</td><td>F</td></tr>
                  <tr><td>F</td><td>T</td></tr>
                </tbody>
              </table>
            </div>
            <div className="reference-item">
              <h4>Conjunction (AND)</h4>
              <table className="mini-table">
                <thead><tr><th>P</th><th>Q</th><th>P ∧ Q</th></tr></thead>
                <tbody>
                  <tr><td>T</td><td>T</td><td>T</td></tr>
                  <tr><td>T</td><td>F</td><td>F</td></tr>
                  <tr><td>F</td><td>T</td><td>F</td></tr>
                  <tr><td>F</td><td>F</td><td>F</td></tr>
                </tbody>
              </table>
            </div>
            <div className="reference-item">
              <h4>Disjunction (OR)</h4>
              <table className="mini-table">
                <thead><tr><th>P</th><th>Q</th><th>P ∨ Q</th></tr></thead>
                <tbody>
                  <tr><td>T</td><td>T</td><td>T</td></tr>
                  <tr><td>T</td><td>F</td><td>T</td></tr>
                  <tr><td>F</td><td>T</td><td>T</td></tr>
                  <tr><td>F</td><td>F</td><td>F</td></tr>
                </tbody>
              </table>
            </div>
            <div className="reference-item">
              <h4>Implication</h4>
              <table className="mini-table">
                <thead><tr><th>P</th><th>Q</th><th>P → Q</th></tr></thead>
                <tbody>
                  <tr><td>T</td><td>T</td><td>T</td></tr>
                  <tr><td>T</td><td>F</td><td>F</td></tr>
                  <tr><td>F</td><td>T</td><td>T</td></tr>
                  <tr><td>F</td><td>F</td><td>T</td></tr>
                </tbody>
              </table>
            </div>
          </div>
      </ModuleCard>
    </ModulePage>
  );
}
