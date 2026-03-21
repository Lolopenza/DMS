import React, { useState } from 'react';
import { calcProbability } from '../../api/probability.js';
import { useToast } from '../../../../../components/Toast.jsx';
import { ModuleCard, ModulePage } from '../../../../../components/module/ModuleLayout.jsx';
import ResultPanel from '../../../../../components/module/ResultPanel.jsx';

export default function Probability() {
  const { showSuccess, showError } = useToast();

  const [operation, setOperation] = useState('simple');
  const [inputs, setInputs] = useState({
    favorable: 3, total: 10,
    pA: 0.4, pB: 0.3, pAandB: 0.1,
    pEvent: 0.3, trials: 10, successes: 4,
    n: 10, p: 0.5, k: 3,
    prior: 0.01, true_pos: 0.9, false_pos: 0.1,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  function set(key, val) {
    setInputs(prev => ({ ...prev, [key]: val }));
  }

  async function handleCalc() {
    setLoading(true);
    try {
      const payload = { operation };
      if (operation === 'simple') {
        payload.favorable = Number(inputs.favorable);
        payload.total = Number(inputs.total);
      } else if (operation === 'conditional') {
        payload.joint = Number(inputs.pAandB);
        payload.condition = Number(inputs.pB);
      } else if (operation === 'binomial_pmf') {
        payload.n = Number(inputs.n);
        payload.p = Number(inputs.p);
        payload.k = Number(inputs.k);
      } else if (operation === 'bayes') {
        payload.prior = Number(inputs.prior);
        payload.true_pos = Number(inputs.true_pos);
        payload.false_pos = Number(inputs.false_pos);
      }
      const data = await calcProbability(payload);
      setResult(data);
      showSuccess('Probability calculated');
    } catch (err) {
      showError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModulePage
      title="Probability Calculator"
      subtitle="Calculate basic and conditional probabilities, distributions"
    >

      <ModuleCard title="Probability Calculator" icon="fa-dice">
          <div className="form-container">
            <div className="form-group">
              <label htmlFor="probOp"><i className="fas fa-cog"></i> Type</label>
              <select id="probOp" value={operation} onChange={e => { setOperation(e.target.value); setResult(null); }}>
                <option value="simple">Basic Probability P = favorable/total</option>
                <option value="conditional">Conditional P(A|B)</option>
                <option value="binomial_pmf">Binomial Distribution P(X=k)</option>
                <option value="bayes">Bayes' Theorem</option>
              </select>
            </div>

            {operation === 'simple' && (
              <div className="form-row">
                <div className="form-group">
                  <label>Favorable outcomes</label>
                  <input type="number" min="0" value={inputs.favorable} onChange={e => set('favorable', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Total outcomes</label>
                  <input type="number" min="1" value={inputs.total} onChange={e => set('total', e.target.value)} />
                </div>
              </div>
            )}

            {operation === 'conditional' && (
              <div className="form-row">
                <div className="form-group">
                  <label>P(A)</label>
                  <input type="number" min="0" max="1" step="0.01" value={inputs.pA} onChange={e => set('pA', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>P(B)</label>
                  <input type="number" min="0" max="1" step="0.01" value={inputs.pB} onChange={e => set('pB', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>P(A ∩ B)</label>
                  <input type="number" min="0" max="1" step="0.01" value={inputs.pAandB} onChange={e => set('pAandB', e.target.value)} />
                </div>
              </div>
            )}

            {operation === 'binomial_pmf' && (
              <div className="form-row">
                <div className="form-group">
                  <label>n (trials)</label>
                  <input type="number" min="1" value={inputs.n} onChange={e => set('n', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>p (success prob)</label>
                  <input type="number" min="0" max="1" step="0.01" value={inputs.p} onChange={e => set('p', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>k (successes)</label>
                  <input type="number" min="0" value={inputs.k} onChange={e => set('k', e.target.value)} />
                </div>
              </div>
            )}

            {operation === 'bayes' && (
              <div className="form-row">
                <div className="form-group">
                  <label>Prior P(H)</label>
                  <input type="number" min="0" max="1" step="0.01" value={inputs.prior} onChange={e => set('prior', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>True Positive P(E|H)</label>
                  <input type="number" min="0" max="1" step="0.01" value={inputs.true_pos} onChange={e => set('true_pos', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>False Positive P(E|¬H)</label>
                  <input type="number" min="0" max="1" step="0.01" value={inputs.false_pos} onChange={e => set('false_pos', e.target.value)} />
                </div>
              </div>
            )}

            <button type="button" className="btn btn-primary" onClick={handleCalc} disabled={loading}>
              <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-calculator'}`}></i> {loading ? 'Calculating…' : 'Calculate'}
            </button>
          </div>

          {result && (
            <ResultPanel
              value={result.result}
              fallbackData={result}
              valueRenderer={(val) => (typeof val === 'number' ? val.toFixed(6) : String(val))}
              steps={result.steps}
            />
          )}
      </ModuleCard>

      {/* Reference */}
      <ModuleCard title="Probability Formulas" icon="fa-book">
          <div className="formulas-grid">
            <div className="formula-card">
              <h4>Basic Probability</h4>
              <div className="formula">P(A) = favorable / total</div>
            </div>
            <div className="formula-card">
              <h4>Conditional Probability</h4>
              <div className="formula">P(A|B) = P(A ∩ B) / P(B)</div>
            </div>
            <div className="formula-card">
              <h4>Binomial Distribution</h4>
              <div className="formula">P(X=k) = C(n,k) · p^k · (1-p)^(n-k)</div>
            </div>
            <div className="formula-card">
              <h4>Complement Rule</h4>
              <div className="formula">P(A') = 1 - P(A)</div>
            </div>
          </div>
      </ModuleCard>
    </ModulePage>
  );
}
