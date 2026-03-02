import React, { useState } from 'react';
import { calcCombinatorics } from '../api.js';
import { useToast } from '../components/Toast.jsx';

const ADVANCED_OPS = ['pigeonhole', 'catalan', 'stirling', 'binomial'];

export default function Combinatorics() {
  const { showSuccess, showError } = useToast();

  // Basic counting state
  const [operation, setOperation] = useState('factorial');
  const [n, setN] = useState(5);
  const [r, setR] = useState(2);
  const [basicResult, setBasicResult] = useState(null);
  const [loadingBasic, setLoadingBasic] = useState(false);

  // Advanced counting state
  const [advOp, setAdvOp] = useState('pigeonhole');
  const [advInputs, setAdvInputs] = useState({ pigeons: 10, holes: 9, catalanN: 4, stirlingN: 5, stirlingK: 3, binomialN: 5, binomialK: 2 });
  const [advResult, setAdvResult] = useState(null);
  const [loadingAdv, setLoadingAdv] = useState(false);

  async function handleBasicCalc() {
    setLoadingBasic(true);
    try {
      const payload = { operation, n: Number(n) };
      if (operation !== 'factorial') payload.r = Number(r);
      const data = await calcCombinatorics(payload);
      let formula = '';
      if (operation === 'factorial') formula = `${n}! = `;
      else if (operation === 'permutation') formula = `P(${n}, ${r}) = `;
      else if (operation === 'combination') formula = `C(${n}, ${r}) = `;
      setBasicResult({ formula, value: data.result });
      showSuccess(`Calculated ${operation} successfully`);
    } catch (err) {
      showError('Calculation error: ' + err.message);
    } finally {
      setLoadingBasic(false);
    }
  }

  async function handleAdvancedCalc() {
    setLoadingAdv(true);
    try {
      const payload = { operation: advOp };
      if (advOp === 'pigeonhole') { payload.pigeons = Number(advInputs.pigeons); payload.holes = Number(advInputs.holes); }
      else if (advOp === 'catalan') { payload.n = Number(advInputs.catalanN); }
      else if (advOp === 'stirling') { payload.n = Number(advInputs.stirlingN); payload.k = Number(advInputs.stirlingK); }
      else if (advOp === 'binomial') { payload.n = Number(advInputs.binomialN); payload.k = Number(advInputs.binomialK); }
      const data = await calcCombinatorics(payload);
      setAdvResult(data.result);
      showSuccess(`${advOp} calculation completed`);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoadingAdv(false);
    }
  }

  function setAdv(key, val) {
    setAdvInputs(prev => ({ ...prev, [key]: val }));
  }

  return (
    <div className="container">
      <div className="page-title">
        <h2>Combinatorics Calculator</h2>
        <p className="subtitle">Calculate permutations, combinations, and solve counting problems</p>
      </div>

      {/* Basic Counting */}
      <div className="card">
        <div className="card-header">
          <h3><i className="fas fa-calculator"></i> Basic Counting</h3>
        </div>
        <div className="card-body">
          <div className="theory-intro">
            <p>Combinatorics studies ways to count finite discrete structures, providing formulas for permutations, combinations, and other counting problems.</p>
          </div>
          <div className="form-container">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="operation"><i className="fas fa-cog"></i> Operation</label>
                <select id="operation" value={operation} onChange={e => setOperation(e.target.value)}>
                  <option value="factorial">Factorial (n!)</option>
                  <option value="permutation">Permutation (nPr)</option>
                  <option value="combination">Combination (nCr)</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="n"><i className="fas fa-hashtag"></i> n value</label>
                <input type="number" id="n" min="0" max="170" value={n} onChange={e => setN(e.target.value)} />
                <div className="form-hint">Total number of elements (0-170)</div>
              </div>
              {operation !== 'factorial' && (
                <div className="form-group">
                  <label htmlFor="r"><i className="fas fa-hashtag"></i> r value</label>
                  <input type="number" id="r" min="0" max="170" value={r} onChange={e => setR(e.target.value)} />
                  <div className="form-hint">Number of elements to select (0-n)</div>
                </div>
              )}
            </div>
            <button type="button" className="btn btn-primary" onClick={handleBasicCalc} disabled={loadingBasic}>
              <i className={`fas ${loadingBasic ? 'fa-spinner fa-spin' : 'fa-calculator'}`}></i> {loadingBasic ? 'Calculating…' : 'Calculate'}
            </button>
          </div>
          {basicResult && (
            <div className="result-container" tabIndex={0} aria-live="polite">
              <h3><i className="fas fa-check-circle"></i> Result</h3>
              <div className="math-display">
                <strong>{basicResult.formula}</strong>{basicResult.value}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Counting */}
      <div className="card">
        <div className="card-header">
          <h3><i className="fas fa-sitemap"></i> Advanced Counting</h3>
        </div>
        <div className="card-body">
          <div className="theory-intro">
            <p>Advanced counting techniques help solve more complex counting problems.</p>
          </div>
          <div className="form-container">
            <div className="form-group">
              <label htmlFor="advOp"><i className="fas fa-cog"></i> Operation</label>
              <select id="advOp" value={advOp} onChange={e => { setAdvOp(e.target.value); setAdvResult(null); }}>
                <option value="pigeonhole">Pigeonhole Principle</option>
                <option value="catalan">Catalan Number</option>
                <option value="stirling">Stirling Number (2nd kind)</option>
                <option value="binomial">Binomial Coefficient</option>
              </select>
            </div>
            {advOp === 'pigeonhole' && (
              <div className="form-row">
                <div className="form-group">
                  <label>Number of pigeons</label>
                  <input type="number" min="1" value={advInputs.pigeons} onChange={e => setAdv('pigeons', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Number of holes</label>
                  <input type="number" min="1" value={advInputs.holes} onChange={e => setAdv('holes', e.target.value)} />
                </div>
              </div>
            )}
            {advOp === 'catalan' && (
              <div className="form-group">
                <label>n value</label>
                <input type="number" min="0" max="20" value={advInputs.catalanN} onChange={e => setAdv('catalanN', e.target.value)} />
              </div>
            )}
            {advOp === 'stirling' && (
              <div className="form-row">
                <div className="form-group">
                  <label>n value</label>
                  <input type="number" min="0" max="50" value={advInputs.stirlingN} onChange={e => setAdv('stirlingN', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>k value</label>
                  <input type="number" min="0" max="50" value={advInputs.stirlingK} onChange={e => setAdv('stirlingK', e.target.value)} />
                </div>
              </div>
            )}
            {advOp === 'binomial' && (
              <div className="form-row">
                <div className="form-group">
                  <label>n value</label>
                  <input type="number" min="0" max="170" value={advInputs.binomialN} onChange={e => setAdv('binomialN', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>k value</label>
                  <input type="number" min="0" max="170" value={advInputs.binomialK} onChange={e => setAdv('binomialK', e.target.value)} />
                </div>
              </div>
            )}
            <button type="button" className="btn btn-primary" onClick={handleAdvancedCalc} disabled={loadingAdv}>
              <i className={`fas ${loadingAdv ? 'fa-spinner fa-spin' : 'fa-calculator'}`}></i> {loadingAdv ? 'Calculating…' : 'Calculate'}
            </button>
          </div>
          {advResult !== null && (
            <div className="result-container" tabIndex={0} aria-live="polite">
              <h3><i className="fas fa-check-circle"></i> Result</h3>
              <div className="math-display">{advResult}</div>
            </div>
          )}
        </div>
      </div>

      {/* Formulas Reference */}
      <div className="card">
        <div className="card-header">
          <h3><i className="fas fa-book"></i> Formulas Reference</h3>
        </div>
        <div className="card-body">
          <div className="formulas-grid">
            <div className="formula-card">
              <h4>Factorial</h4>
              <div className="formula">n! = n × (n-1) × (n-2) × ... × 2 × 1</div>
              <p>The number of ways to arrange n distinct objects in a row.</p>
            </div>
            <div className="formula-card">
              <h4>Permutation</h4>
              <div className="formula">P(n,r) = n! / (n-r)!</div>
              <p>The number of ways to arrange r objects from n distinct objects, where order matters.</p>
            </div>
            <div className="formula-card">
              <h4>Combination</h4>
              <div className="formula">C(n,r) = n! / (r! × (n-r)!)</div>
              <p>The number of ways to select r objects from n distinct objects, where order doesn't matter.</p>
            </div>
            <div className="formula-card">
              <h4>Catalan Number</h4>
              <div className="formula">C<sub>n</sub> = (1/(n+1)) × C(2n,n)</div>
              <p>Appears in many counting problems like the number of valid parentheses expressions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
