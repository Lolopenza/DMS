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

export default function BayesTheorem() {
	const { showSuccess, showError } = useToast();
	const [inputs, setInputs] = useState({
		prior: 0.01,
		true_pos: 0.95,
		false_pos: 0.08,
	});
	const [result, setResult] = useState(null);
	const [loading, setLoading] = useState(false);

	const set = (key, value) => setInputs((prev) => ({ ...prev, [key]: value }));

	async function handleCalculate() {
		setLoading(true);
		try {
			const payload = {
				operation: 'bayes',
				prior: toNum(inputs.prior, 'prior'),
				true_pos: toNum(inputs.true_pos, 'true_pos'),
				false_pos: toNum(inputs.false_pos, 'false_pos'),
			};
			const data = await calcProbability(payload);
			setResult(data);
			showSuccess('Bayes posterior computed');
		} catch (err) {
			showError('Error: ' + err.message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<ModulePage
			title="Bayes' Theorem"
			subtitle="Posterior inference using prior and evidence quality"
		>
			<ModuleCard title="Bayesian Inference" icon="fa-scale-balanced">
				<div className="form-container">
					<div className="form-row">
						<div className="form-group">
							<label>Prior P(H)</label>
							<input type="number" min="0" max="1" step="0.001" value={inputs.prior} onChange={(e) => set('prior', e.target.value)} />
						</div>
						<div className="form-group">
							<label>True Positive P(E|H)</label>
							<input type="number" min="0" max="1" step="0.001" value={inputs.true_pos} onChange={(e) => set('true_pos', e.target.value)} />
						</div>
						<div className="form-group">
							<label>False Positive P(E|¬H)</label>
							<input type="number" min="0" max="1" step="0.001" value={inputs.false_pos} onChange={(e) => set('false_pos', e.target.value)} />
						</div>
					</div>

					<button type="button" className="btn btn-primary" onClick={handleCalculate} disabled={loading}>
						<i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-calculator'}`}></i> {loading ? 'Calculating...' : 'Calculate posterior'}
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
