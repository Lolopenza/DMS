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

export default function ProbabilityBasics() {
	const { showSuccess, showError } = useToast();
	const [operation, setOperation] = useState('simple');
	const [inputs, setInputs] = useState({
		favorable: 3,
		total: 10,
		pA: 0.6,
		pB: 0.5,
		pAandB: 0.3,
		pEvent: 0.2,
	});
	const [result, setResult] = useState(null);
	const [loading, setLoading] = useState(false);

	const set = (key, value) => setInputs((prev) => ({ ...prev, [key]: value }));

	async function handleCalculate() {
		setLoading(true);
		try {
			const payload = { operation };
			if (operation === 'simple') {
				payload.favorable = toNum(inputs.favorable, 'favorable');
				payload.total = toNum(inputs.total, 'total');
			} else if (operation === 'union' || operation === 'independence_check') {
				payload.pA = toNum(inputs.pA, 'pA');
				payload.pB = toNum(inputs.pB, 'pB');
				payload.pAandB = toNum(inputs.pAandB, 'pAandB');
			} else if (operation === 'complement') {
				payload.pEvent = toNum(inputs.pEvent, 'pEvent');
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
			title="Probability Basics"
			subtitle="Foundations: simple, union, complement, independence"
		>
			<ModuleCard title="Core Probability" icon="fa-dice">
				<div className="form-container">
					<div className="form-group">
						<label htmlFor="op"><i className="fas fa-cog"></i> Operation</label>
						<select id="op" value={operation} onChange={(e) => { setOperation(e.target.value); setResult(null); }}>
							<option value="simple">Simple probability P = favorable / total</option>
							<option value="union">Union: P(A ∪ B)</option>
							<option value="complement">Complement: P(A')</option>
							<option value="independence_check">Independence check</option>
						</select>
					</div>

					{operation === 'simple' && (
						<div className="form-row">
							<div className="form-group">
								<label>Favorable outcomes</label>
								<input type="number" min="0" value={inputs.favorable} onChange={(e) => set('favorable', e.target.value)} />
							</div>
							<div className="form-group">
								<label>Total outcomes</label>
								<input type="number" min="1" value={inputs.total} onChange={(e) => set('total', e.target.value)} />
							</div>
						</div>
					)}

					{(operation === 'union' || operation === 'independence_check') && (
						<div className="form-row">
							<div className="form-group">
								<label>P(A)</label>
								<input type="number" min="0" max="1" step="0.01" value={inputs.pA} onChange={(e) => set('pA', e.target.value)} />
							</div>
							<div className="form-group">
								<label>P(B)</label>
								<input type="number" min="0" max="1" step="0.01" value={inputs.pB} onChange={(e) => set('pB', e.target.value)} />
							</div>
							<div className="form-group">
								<label>P(A ∩ B)</label>
								<input type="number" min="0" max="1" step="0.01" value={inputs.pAandB} onChange={(e) => set('pAandB', e.target.value)} />
							</div>
						</div>
					)}

					{operation === 'complement' && (
						<div className="form-group">
							<label>P(A)</label>
							<input type="number" min="0" max="1" step="0.01" value={inputs.pEvent} onChange={(e) => set('pEvent', e.target.value)} />
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
