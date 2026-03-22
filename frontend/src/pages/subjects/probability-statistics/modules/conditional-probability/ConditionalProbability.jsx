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

function toNumList(value, name) {
	const out = String(value)
		.split(',')
		.map((x) => Number(x.trim()))
		.filter((x) => Number.isFinite(x));
	if (!out.length) throw new Error(`${name}: enter comma-separated numbers`);
	return out;
}

export default function ConditionalProbability() {
	const { showSuccess, showError } = useToast();
	const [operation, setOperation] = useState('conditional');
	const [inputs, setInputs] = useState({
		joint: 0.12,
		condition: 0.3,
		priors: '0.7,0.3',
		likelihoods: '0.2,0.8',
	});
	const [result, setResult] = useState(null);
	const [loading, setLoading] = useState(false);

	const set = (key, value) => setInputs((prev) => ({ ...prev, [key]: value }));

	async function handleCalculate() {
		setLoading(true);
		try {
			const payload = { operation };
			if (operation === 'conditional') {
				payload.joint = toNum(inputs.joint, 'joint');
				payload.condition = toNum(inputs.condition, 'condition');
			} else {
				payload.priors = toNumList(inputs.priors, 'priors');
				payload.likelihoods = toNumList(inputs.likelihoods, 'likelihoods');
			}

			const data = await calcProbability(payload);
			setResult(data);
			showSuccess('Calculation complete');
		} catch (err) {
			showError('Error: ' + err.message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<ModulePage
			title="Conditional Probability"
			subtitle="Conditional probability and law of total probability"
		>
			<ModuleCard title="Conditional Models" icon="fa-diagram-project">
				<div className="form-container">
					<div className="form-group">
						<label htmlFor="condOp"><i className="fas fa-cog"></i> Operation</label>
						<select id="condOp" value={operation} onChange={(e) => { setOperation(e.target.value); setResult(null); }}>
							<option value="conditional">Conditional probability P(A|B)</option>
							<option value="total_probability">Law of total probability</option>
						</select>
					</div>

					{operation === 'conditional' && (
						<div className="form-row">
							<div className="form-group">
								<label>P(A ∩ B)</label>
								<input type="number" min="0" max="1" step="0.01" value={inputs.joint} onChange={(e) => set('joint', e.target.value)} />
							</div>
							<div className="form-group">
								<label>P(B)</label>
								<input type="number" min="0" max="1" step="0.01" value={inputs.condition} onChange={(e) => set('condition', e.target.value)} />
							</div>
						</div>
					)}

					{operation === 'total_probability' && (
						<>
							<div className="form-group">
								<label>Priors P(A_i)</label>
								<input type="text" value={inputs.priors} onChange={(e) => set('priors', e.target.value)} placeholder="0.7,0.3" />
							</div>
							<div className="form-group">
								<label>Likelihoods P(B|A_i)</label>
								<input type="text" value={inputs.likelihoods} onChange={(e) => set('likelihoods', e.target.value)} placeholder="0.2,0.8" />
							</div>
						</>
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
