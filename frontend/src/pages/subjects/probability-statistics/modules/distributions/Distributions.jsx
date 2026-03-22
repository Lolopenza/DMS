import React, { useState } from 'react';
import { calcProbability } from '../../../../../api.js';
import { useToast } from '../../../../../components/Toast.jsx';
import { ModuleCard, ModulePage } from '../../../../../components/module/ModuleLayout.jsx';
import ResultPanel from '../../../../../components/module/ResultPanel.jsx';

function toNum(value, name) {
	const n = Number(value);
	if (!Number.isFinite(n)) throw new Error(`${name}: invalid number`);
	return n;
}

export default function Distributions() {
	const { showSuccess, showError } = useToast();
	const [operation, setOperation] = useState('distribution_summary');
	const [inputs, setInputs] = useState({
		dist: 'binomial',
		n: 10,
		p: 0.4,
		k: 3,
		lambda_: 2.5,
	});
	const [result, setResult] = useState(null);
	const [loading, setLoading] = useState(false);

	const set = (key, value) => setInputs((prev) => ({ ...prev, [key]: value }));

	async function handleCalculate() {
		setLoading(true);
		try {
			const payload = { operation };

			if (operation === 'distribution_summary') {
				payload.dist = inputs.dist;
				payload.k = toNum(inputs.k, 'k');
				if (inputs.dist === 'binomial') {
					payload.n = toNum(inputs.n, 'n');
					payload.p = toNum(inputs.p, 'p');
				} else if (inputs.dist === 'poisson') {
					payload.lambda_ = toNum(inputs.lambda_, 'lambda_');
				} else {
					payload.p = toNum(inputs.p, 'p');
				}
			} else if (operation === 'binomial_pmf') {
				payload.n = toNum(inputs.n, 'n');
				payload.p = toNum(inputs.p, 'p');
				payload.k = toNum(inputs.k, 'k');
			} else if (operation === 'poisson_pmf') {
				payload.lambda_ = toNum(inputs.lambda_, 'lambda_');
				payload.k = toNum(inputs.k, 'k');
			} else if (operation === 'geometric_pmf') {
				payload.p = toNum(inputs.p, 'p');
				payload.k = toNum(inputs.k, 'k');
			}

			const data = await calcProbability(payload);
			setResult(data);
			showSuccess('Distribution calculation complete');
		} catch (err) {
			showError('Error: ' + err.message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<ModulePage
			title="Distributions"
			subtitle="PMF and summary metrics for common discrete distributions"
		>
			<ModuleCard title="Distribution Toolkit" icon="fa-chart-area">
				<div className="form-container">
					<div className="form-group">
						<label htmlFor="distOp"><i className="fas fa-cog"></i> Operation</label>
						<select id="distOp" value={operation} onChange={(e) => { setOperation(e.target.value); setResult(null); }}>
							<option value="distribution_summary">Distribution summary</option>
							<option value="binomial_pmf">Binomial PMF</option>
							<option value="poisson_pmf">Poisson PMF</option>
							<option value="geometric_pmf">Geometric PMF</option>
						</select>
					</div>

					{operation === 'distribution_summary' && (
						<div className="form-row">
							<div className="form-group">
								<label>Distribution</label>
								<select value={inputs.dist} onChange={(e) => set('dist', e.target.value)}>
									<option value="binomial">Binomial</option>
									<option value="poisson">Poisson</option>
									<option value="geometric">Geometric</option>
								</select>
							</div>
							{inputs.dist === 'binomial' && (
								<>
									<div className="form-group">
										<label>n</label>
										<input type="number" min="0" value={inputs.n} onChange={(e) => set('n', e.target.value)} />
									</div>
									<div className="form-group">
										<label>p</label>
										<input type="number" min="0" max="1" step="0.01" value={inputs.p} onChange={(e) => set('p', e.target.value)} />
									</div>
								</>
							)}
							{inputs.dist === 'poisson' && (
								<div className="form-group">
									<label>lambda</label>
									<input type="number" min="0" step="0.1" value={inputs.lambda_} onChange={(e) => set('lambda_', e.target.value)} />
								</div>
							)}
							{inputs.dist === 'geometric' && (
								<div className="form-group">
									<label>p</label>
									<input type="number" min="0" max="1" step="0.01" value={inputs.p} onChange={(e) => set('p', e.target.value)} />
								</div>
							)}
							<div className="form-group">
								<label>k (optional PMF point)</label>
								<input type="number" min="0" value={inputs.k} onChange={(e) => set('k', e.target.value)} />
							</div>
						</div>
					)}

					{(operation === 'binomial_pmf' || operation === 'poisson_pmf' || operation === 'geometric_pmf') && (
						<div className="form-row">
							{operation === 'binomial_pmf' && (
								<>
									<div className="form-group">
										<label>n</label>
										<input type="number" min="0" value={inputs.n} onChange={(e) => set('n', e.target.value)} />
									</div>
									<div className="form-group">
										<label>p</label>
										<input type="number" min="0" max="1" step="0.01" value={inputs.p} onChange={(e) => set('p', e.target.value)} />
									</div>
								</>
							)}

							{operation === 'poisson_pmf' && (
								<div className="form-group">
									<label>lambda</label>
									<input type="number" min="0" step="0.1" value={inputs.lambda_} onChange={(e) => set('lambda_', e.target.value)} />
								</div>
							)}

							{operation === 'geometric_pmf' && (
								<div className="form-group">
									<label>p</label>
									<input type="number" min="0" max="1" step="0.01" value={inputs.p} onChange={(e) => set('p', e.target.value)} />
								</div>
							)}

							<div className="form-group">
								<label>k</label>
								<input type="number" min="0" value={inputs.k} onChange={(e) => set('k', e.target.value)} />
							</div>
						</div>
					)}

					<button type="button" className="btn btn-primary" onClick={handleCalculate} disabled={loading}>
						<i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-calculator'}`}></i> {loading ? 'Calculating...' : 'Calculate'}
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
		</ModulePage>
	);
}
