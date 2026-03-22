import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { calcProbability } from '../../api/probability.js';
import { useToast } from '../../../../../components/Toast.jsx';
import { ModuleCard, ModulePage } from '../../../../../components/module/ModuleLayout.jsx';
import ResultPanel from '../../../../../components/module/ResultPanel.jsx';

export default function Probability() {
  const { subject } = useParams();
  const { showSuccess, showError } = useToast();
  const isIntroModule = subject === 'discrete-math';

  const [inputs, setInputs] = useState({
    favorable: 3,
    total: 10,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  function set(key, val) {
    setInputs(prev => ({ ...prev, [key]: val }));
  }

  async function handleCalc() {
    setLoading(true);
    try {
      const payload = {
        operation: 'simple',
        favorable: Number(inputs.favorable),
        total: Number(inputs.total),
      };
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
      title={isIntroModule ? 'Probability (Intro) Calculator' : 'Probability Calculator'}
      subtitle={
        isIntroModule
          ? 'Build fundamentals here, then continue with the full Probability & Statistics track.'
          : 'Calculate basic and conditional probabilities, distributions.'
      }
    >

      {isIntroModule && (
        <ModuleCard title="Continue to Full Track" icon="fa-layer-group">
          <p>
            This module covers core ideas for quick practice. For a full track with dedicated
            probability sections, open Probability & Statistics.
          </p>
          <Link to="/probability-statistics" className="btn btn-outline btn-deep-dive">
            <i className="fas fa-arrow-right"></i> Open full Probability track
          </Link>
        </ModuleCard>
      )}

      <ModuleCard title="Probability Calculator" icon="fa-dice">
          <div className="form-container">
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
              <h4>Continue in Full Track</h4>
              <div className="formula">
                For Conditional Probability, Bayes' Theorem, and Distributions, please visit the full Probability &amp; Statistics track.
              </div>
            </div>
          </div>
      </ModuleCard>
    </ModulePage>
  );
}
