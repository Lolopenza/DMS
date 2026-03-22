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

export default function BooleanAlgebra() {
	const { showSuccess, showError } = useToast();
	const [variables, setVariables] = useState('P,Q,R');
	const [formula, setFormula] = useState('(P -> Q) & (Q -> R)');
	const [result, setResult] = useState(null);
	const [loading, setLoading] = useState(false);

	async function handleNormalize() {
		setLoading(true);
		try {
			const data = await calcLogic({
				operation: 'normal_forms',
				variables: parseVars(variables),
				formula,
			});
			setResult(data.result ?? data);
			showSuccess('Normal forms generated');
		} catch (err) {
			showError('Error: ' + err.message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<ModulePage
			title="Boolean Algebra"
			subtitle="Compute canonical and simplified normal forms"
		>
			<ModuleCard title="CNF / DNF Generator" icon="fa-code-branch">
				<div className="form-container">
					<div className="form-group">
						<label>Variables</label>
						<input type="text" value={variables} onChange={(e) => setVariables(e.target.value)} placeholder="P,Q,R" />
					</div>
					<div className="form-group">
						<label>Formula</label>
						<input type="text" value={formula} onChange={(e) => setFormula(e.target.value)} placeholder="(P -> Q) & (Q -> R)" />
					</div>
					<button type="button" className="btn btn-primary" onClick={handleNormalize} disabled={loading}>
						<i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-filter'}`}></i> {loading ? 'Computing...' : 'Build CNF/DNF'}
					</button>
				</div>

				{result && (
					<ResultPanel
						value={result.classification || result}
						fallbackData={result}
						steps={`DNF: ${result.dnf || 'n/a'} | CNF: ${result.cnf || 'n/a'}`}
					/>
				)}
			</ModuleCard>
		</ModulePage>
	);
}
