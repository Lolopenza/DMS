import React, { useState } from 'react';
import { calcLogic } from '../../../../../api.js';
import { useToast } from '../../../../../components/Toast.jsx';
import { ModuleCard, ModulePage } from '../../../../../components/module/ModuleLayout.jsx';
import ResultPanel from '../../../../../components/module/ResultPanel.jsx';

function parseVars(value) {
	const out = String(value).split(',').map((v) => v.trim()).filter(Boolean);
	if (!out.length) throw new Error('Enter at least one variable');
	return out;
}

export default function EquivalenceLaws() {
	const { showSuccess, showError } = useToast();
	const [operation, setOperation] = useState('equivalence');
	const [variables, setVariables] = useState('P,Q');
	const [formula1, setFormula1] = useState('P -> Q');
	const [formula2, setFormula2] = useState('~P | Q');
	const [result, setResult] = useState(null);
	const [loading, setLoading] = useState(false);

	async function handleCheck() {
		setLoading(true);
		try {
			const payload = {
				operation,
				variables: parseVars(variables),
				formula1,
				formula2,
			};
			const data = await calcLogic(payload);
			setResult(data.result ?? data);
			showSuccess('Check complete');
		} catch (err) {
			showError('Error: ' + err.message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<ModulePage
			title="Equivalence Laws"
			subtitle="Verify logical equivalence and implication validity"
		>
			<ModuleCard title="Law Verifier" icon="fa-equals">
				<div className="form-container">
					<div className="form-group">
						<label>Operation</label>
						<select value={operation} onChange={(e) => { setOperation(e.target.value); setResult(null); }}>
							<option value="equivalence">Equivalence (F1 ≡ F2)</option>
							<option value="implication">Implication validity (F1 ⇒ F2)</option>
						</select>
					</div>
					<div className="form-group">
						<label>Variables</label>
						<input type="text" value={variables} onChange={(e) => setVariables(e.target.value)} placeholder="P,Q" />
					</div>
					<div className="form-row">
						<div className="form-group">
							<label>Formula 1</label>
							<input type="text" value={formula1} onChange={(e) => setFormula1(e.target.value)} />
						</div>
						<div className="form-group">
							<label>Formula 2</label>
							<input type="text" value={formula2} onChange={(e) => setFormula2(e.target.value)} />
						</div>
					</div>
					<button type="button" className="btn btn-primary" onClick={handleCheck} disabled={loading}>
						<i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-balance-scale'}`}></i> {loading ? 'Checking...' : 'Check'}
					</button>
				</div>

				{result && (
					<ResultPanel
						value={typeof result === 'boolean' ? result : (result.valid ?? result)}
						fallbackData={result}
					/>
				)}
			</ModuleCard>
		</ModulePage>
	);
}
