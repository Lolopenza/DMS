import React, { useState } from 'react';
import { calcLogic } from '../../../../../api.js';
import { useToast } from '../../../../../components/Toast.jsx';
import { ModuleCard, ModulePage } from '../../../../../components/module/ModuleLayout.jsx';

function parseVars(value) {
	const out = String(value).split(',').map((v) => v.trim()).filter(Boolean);
	if (!out.length) throw new Error('Enter at least one variable');
	return out;
}

function LogicTable({ headers = [], rows = [] }) {
	if (!headers.length || !rows.length) return null;
	return (
		<table className="truth-table">
			<thead>
				<tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr>
			</thead>
			<tbody>
				{rows.map((row, i) => (
					<tr key={i}>
						{row.map((cell, j) => (
							<td key={`${i}-${j}`}>{cell === true ? 'T' : cell === false ? 'F' : String(cell)}</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
}

export default function TruthTables() {
	const { showSuccess, showError } = useToast();
	const [formula, setFormula] = useState('(P | Q) & ~R');
	const [variables, setVariables] = useState('P,Q,R');
	const [result, setResult] = useState(null);
	const [loading, setLoading] = useState(false);

	async function handleBuild() {
		setLoading(true);
		try {
			const data = await calcLogic({
				operation: 'truth_table',
				formula,
				variables: parseVars(variables),
			});
			setResult(data.result ?? data);
			showSuccess('Truth table generated');
		} catch (err) {
			showError('Error: ' + err.message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<ModulePage
			title="Truth Tables"
			subtitle="Generate complete truth tables for compound formulas"
		>
			<ModuleCard title="Truth Table Builder" icon="fa-table">
				<div className="form-container">
					<div className="form-group">
						<label>Variables</label>
						<input type="text" value={variables} onChange={(e) => setVariables(e.target.value)} placeholder="P,Q,R" />
					</div>
					<div className="form-group">
						<label>Formula</label>
						<input type="text" value={formula} onChange={(e) => setFormula(e.target.value)} placeholder="(P | Q) & ~R" />
					</div>
					<button type="button" className="btn btn-primary" onClick={handleBuild} disabled={loading}>
						<i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-table'}`}></i> {loading ? 'Generating...' : 'Generate'}
					</button>
				</div>

				{result && (
					<div className="result-container" tabIndex={0} aria-live="polite">
						<h3><i className="fas fa-check-circle"></i> Result</h3>
						<p><strong>Class:</strong> {result.classification}</p>
						<LogicTable headers={result.headers} rows={result.table} />
					</div>
				)}
			</ModuleCard>
		</ModulePage>
	);
}
