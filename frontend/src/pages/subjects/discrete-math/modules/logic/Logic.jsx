import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { calcLogic } from '../../api/logic.js';
import { useToast } from '../../../../../components/Toast.jsx';
import { ModuleCard, ModulePage } from '../../../../../components/module/ModuleLayout.jsx';
import ResultPanel from '../../../../../components/module/ResultPanel.jsx';

export default function Logic() {
  const { showSuccess, showError } = useToast();
  const [variables, setVariables] = useState('P,Q');
  const [exprType, setExprType] = useState('and');
  const [truthResult, setTruthResult] = useState(null);
  const [loadingTruth, setLoadingTruth] = useState(false);

  const PRESET_FORMULAS = {
    and: 'P & Q',
    or: 'P | Q',
    not: '~P',
  };

  async function handleTruthTable() {
    setLoadingTruth(true);
    try {
      const vars = variables.split(',').map(v => v.trim()).filter(Boolean);
      let formula = PRESET_FORMULAS[exprType] ?? 'P & Q';
      if (exprType !== 'not' && vars.length >= 2) {
        formula = formula.replaceAll('P', vars[0]).replaceAll('Q', vars[1]);
      } else if (vars.length >= 1) {
        formula = formula.replaceAll('P', vars[0]);
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
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell === true || cell === 'True' ? 'T' : cell === false || cell === 'False' ? 'F' : String(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <ModulePage
      title="Logic (Intro)"
      subtitle="Core logic operators and basic truth tables"
    >
      <ModuleCard title="Intro Scope" icon="fa-brain">
        <div className="theory-intro">
          <p>
            This intro module covers basic propositional evaluation with AND, OR, and NOT.
          </p>
          <p>
            To check logical equivalence or simplify Boolean algebra, please visit the Logic for IT track.
          </p>
        </div>
        <Link to="/it-logic" className="btn btn-outline btn-deep-dive">
          <i className="fas fa-arrow-right"></i> Explore deep logic tools in the Logic &amp; Computation track
        </Link>
      </ModuleCard>

      <ModuleCard title="Basic Truth Table" icon="fa-table">
        <div className="form-container">
          <div className="form-group">
            <label htmlFor="variables"><i className="fas fa-font"></i> Variables</label>
            <input type="text" id="variables" value={variables} onChange={e => setVariables(e.target.value)} placeholder="P,Q" />
            <div className="form-hint">Use one variable for NOT, two variables for AND/OR</div>
          </div>
          <div className="form-group">
            <label htmlFor="exprType"><i className="fas fa-code"></i> Basic Operator</label>
            <select id="exprType" value={exprType} onChange={e => setExprType(e.target.value)}>
              <option value="and">AND (P ∧ Q)</option>
              <option value="or">OR (P ∨ Q)</option>
              <option value="not">NOT (¬P)</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-primary" onClick={handleTruthTable} disabled={loadingTruth}>
              <i className={`fas ${loadingTruth ? 'fa-spinner fa-spin' : 'fa-table'}`}></i> {loadingTruth ? 'Generating…' : 'Generate Truth Table'}
            </button>
          </div>
        </div>
        {truthResult && (
          <ResultPanel
            title="Truth Table"
            value={truthResult}
            valueRenderer={() => <div id="tableResult">{renderTable(truthResult)}</div>}
          />
        )}
      </ModuleCard>

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
        </div>
      </ModuleCard>
    </ModulePage>
  );
}
