import React, { useState } from 'react';
import { calcNumberTheory } from '../api.js';
import { useToast } from '../components/Toast.jsx';

const TWO_NUM_OPS = ['gcd', 'lcm'];
const SINGLE_NUM_OPS = ['divisors', 'factorize', 'totient', 'is_prime', 'prime_sieve'];

export default function NumberTheory() {
  const { showSuccess, showError } = useToast();

  const [operation, setOperation] = useState('gcd');
  const [a, setA] = useState(24);
  const [b, setB] = useState(36);
  const [n, setN] = useState(36);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Modular arithmetic
  const [modA, setModA] = useState(17);
  const [modB, setModB] = useState(5);
  const [modM, setModM] = useState(12);
  const [modOp, setModOp] = useState('mod_add');
  const [modResult, setModResult] = useState(null);
  const [loadingMod, setLoadingMod] = useState(false);

  const isTwoNum = TWO_NUM_OPS.includes(operation);

  async function handleCalc() {
    setLoading(true);
    try {
      const payload = { operation };
      if (isTwoNum) { payload.a = Number(a); payload.b = Number(b); }
      else { payload.n = Number(n); }
      const data = await calcNumberTheory(payload);
      setResult(data);
      showSuccess(`${operation} calculated`);
    } catch (err) {
      showError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleModCalc() {
    setLoadingMod(true);
    try {
      let payload;
      if (modOp === 'mod_pow') {
        payload = { operation: 'mod_exp', base: Number(modA), exponent: Number(modB), modulus: Number(modM) };
      } else if (modOp === 'mod_inv') {
        payload = { operation: 'mod_inv', a: Number(modA), m: Number(modM) };
      } else {
        const aVal = Number(modA); const bVal = Number(modB); const mVal = Number(modM);
        let res;
        if (modOp === 'mod_add') res = ((aVal + bVal) % mVal + mVal) % mVal;
        else if (modOp === 'mod_sub') res = ((aVal - bVal) % mVal + mVal) % mVal;
        else res = ((aVal * bVal) % mVal + mVal) % mVal;
        setModResult({ result: res });
        showSuccess('Modular operation done');
        return;
      }
      const data = await calcNumberTheory(payload);
      setModResult(data);
      showSuccess('Modular operation done');
    } catch (err) {
      showError('Error: ' + err.message);
    } finally {
      setLoadingMod(false);
    }
  }

  return (
    <div className="container">
      <div className="page-title">
        <h2>Number Theory Calculator</h2>
        <p className="subtitle">Explore prime numbers, GCD, LCM, and modular arithmetic</p>
      </div>

      {/* Divisibility */}
      <div className="card">
        <div className="card-header">
          <h3><i className="fas fa-superscript"></i> Divisibility Properties</h3>
        </div>
        <div className="card-body">
          <div className="theory-intro">
            <p>Number theory studies the properties and relationships of integers, with divisibility being a fundamental concept.</p>
          </div>
          <div className="form-container">
            <div className="form-group">
              <label htmlFor="operation"><i className="fas fa-cog"></i> Operation</label>
              <select id="operation" value={operation} onChange={e => { setOperation(e.target.value); setResult(null); }}>
                <option value="gcd">Greatest Common Divisor (GCD)</option>
                <option value="lcm">Least Common Multiple (LCM)</option>
                <option value="divisors">Find All Divisors</option>
                <option value="factorize">Prime Factorization</option>
                <option value="totient">Euler's Totient Function</option>
                <option value="is_prime">Prime Check (is_prime)</option>
              </select>
            </div>
            {isTwoNum ? (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="a">First Number</label>
                  <input type="number" id="a" min="1" value={a} onChange={e => setA(e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="b">Second Number</label>
                  <input type="number" id="b" min="1" value={b} onChange={e => setB(e.target.value)} />
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label htmlFor="n">Number</label>
                <input type="number" id="n" min="1" value={n} onChange={e => setN(e.target.value)} />
              </div>
            )}
            <button type="button" className="btn btn-primary" onClick={handleCalc} disabled={loading}>
              <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-calculator'}`}></i> {loading ? 'Calculating…' : 'Calculate'}
            </button>
          </div>
          {result && (
            <div className="result-container" tabIndex={0} aria-live="polite">
              <h3><i className="fas fa-check-circle"></i> Result</h3>
              <div className="math-display">
                {typeof result.result !== 'undefined' ? String(result.result) : JSON.stringify(result)}
              </div>
              {result.explanation && (
                <div className="explanation-box">
                  <h4>Explanation</h4>
                  <div>{result.explanation}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modular Arithmetic */}
      <div className="card">
        <div className="card-header">
          <h3><i className="fas fa-redo"></i> Modular Arithmetic</h3>
        </div>
        <div className="card-body">
          <div className="theory-intro">
            <p>Modular arithmetic (clock arithmetic) deals with integer operations where numbers wrap around after reaching a modulus.</p>
          </div>
          <div className="form-container">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="modOp">Operation</label>
                <select id="modOp" value={modOp} onChange={e => setModOp(e.target.value)}>
                  <option value="mod_add">Addition (a + b) mod m</option>
                  <option value="mod_sub">Subtraction (a - b) mod m</option>
                  <option value="mod_mul">Multiplication (a × b) mod m</option>
                  <option value="mod_pow">Power (a^b) mod m</option>
                  <option value="mod_inv">Modular Inverse</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="modA">a</label>
                <input type="number" id="modA" value={modA} onChange={e => setModA(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="modB">b</label>
                <input type="number" id="modB" value={modB} onChange={e => setModB(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="modM">m (modulus)</label>
                <input type="number" id="modM" min="2" value={modM} onChange={e => setModM(e.target.value)} />
              </div>
            </div>
            <button type="button" className="btn btn-primary" onClick={handleModCalc} disabled={loadingMod}>
              <i className={`fas ${loadingMod ? 'fa-spinner fa-spin' : 'fa-calculator'}`}></i> {loadingMod ? 'Calculating…' : 'Calculate'}
            </button>
          </div>
          {modResult && (
            <div className="result-container" tabIndex={0} aria-live="polite">
              <h3><i className="fas fa-check-circle"></i> Result</h3>
              <div className="math-display">
                {typeof modResult.result !== 'undefined' ? String(modResult.result) : JSON.stringify(modResult)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
