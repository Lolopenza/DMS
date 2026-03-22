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

export default function PropositionalLogic() {
	const { showSuccess, showError } = useToast();
	const [formula, setFormula] = useState('(P -> Q) & P');
	const [variables, setVariables] = useState('P,Q');
	const [result, setResult] = useState(null);
	const [loading, setLoading] = useState(false);

	async function handleAnalyze() {
		setLoading(true);
		try {
			const data = await calcLogic({
				operation: 'formula_analysis',
				formula,
				variables: parseVars(variables),
			});
			setResult(data.result ?? data);
			showSuccess('Formula analysis complete');
		} catch (err) {
			showError('Error: ' + err.message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<ModulePage
			title="Propositional Logic"
			subtitle="Core operators, classification, and truth-profile analysis"
		>
			<ModuleCard title="Formula Analysis" icon="fa-brain">
				<div className="form-container">
					<div className="form-group">
						<label>Variables</label>
						<input type="text" value={variables} onChange={(e) => setVariables(e.target.value)} placeholder="P,Q,R" />
					</div>
					<div className="form-group">
						<label>Formula</label>
						<input type="text" value={formula} onChange={(e) => setFormula(e.target.value)} placeholder="(P -> Q) & P" />
						<div className="form-hint">{'Supported ops: & | ~ -> <-> ^ and unicode variants'}</div>
					</div>
					<button type="button" className="btn btn-primary" onClick={handleAnalyze} disabled={loading}>
						<i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-microscope'}`}></i> {loading ? 'Analyzing...' : 'Analyze formula'}
					</button>
				</div>

				{result && (
					<ResultPanel
						value={result.classification || result}
						fallbackData={result}
						steps={`True rows: ${result.true_rows ?? 'n/a'}, False rows: ${result.false_rows ?? 'n/a'}`}
					/>
				)}
			</ModuleCard>
		</ModulePage>
	);
}
