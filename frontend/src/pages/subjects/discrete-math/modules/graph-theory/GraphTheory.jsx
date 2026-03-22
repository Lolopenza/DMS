import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../../../../components/Toast.jsx';
import { ModuleCard, ModulePage } from '../../../../../components/module/ModuleLayout.jsx';
import ResultPanel from '../../../../../components/module/ResultPanel.jsx';

function GraphResult({ result }) {
  if (!result) return null;

  if (result.matrix && result.labels) {
    return (
      <div style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <h4 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Adjacency Matrix</h4>
          <table className="truth-table" style={{ maxWidth: '560px' }}>
            <thead>
              <tr>
                <th></th>
                {result.labels.map(label => <th key={`h-${label}`}>{label}</th>)}
              </tr>
            </thead>
            <tbody>
              {result.matrix.map((row, i) => (
                <tr key={`r-${result.labels[i]}`}>
                  <th>{result.labels[i]}</th>
                  {row.map((cell, j) => <td key={`c-${i}-${j}`}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h4 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Vertex Degrees</h4>
          <table className="truth-table" style={{ maxWidth: '280px' }}>
            <thead>
              <tr><th>Vertex</th><th>Degree</th></tr>
            </thead>
            <tbody>
              {result.degrees.map((item) => (
                <tr key={`d-${item.node}`}>
                  <td>{item.node}</td>
                  <td>{item.degree}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Fallback — pretty JSON
  return (
    <pre style={{ background: 'var(--surface-100,#f8f9fa)', padding: '1rem', borderRadius: '8px', overflowX: 'auto', fontSize: '0.9rem' }}>
      {JSON.stringify(result, null, 2)}
    </pre>
  );
}

const DEFAULT_ELEMENTS = [
  { data: { id: '1', label: '1' } },
  { data: { id: '2', label: '2' } },
  { data: { id: '3', label: '3' } },
  { data: { id: '4', label: '4' } },
  { data: { id: '1-2', source: '1', target: '2', weight: 1 } },
  { data: { id: '2-3', source: '2', target: '3', weight: 2 } },
  { data: { id: '3-4', source: '3', target: '4', weight: 1 } },
  { data: { id: '1-3', source: '1', target: '3', weight: 4 } },
];

export default function GraphTheory() {
  const { showSuccess, showError } = useToast();
  const cyRef = useRef(null);
  const cyInstance = useRef(null);

  const [directed, setDirected] = useState(false);
  const [result, setResult] = useState(null);

  // Edge input state for manual graph editing
  const [newEdgeSrc, setNewEdgeSrc] = useState('');
  const [newEdgeTgt, setNewEdgeTgt] = useState('');
  const [newEdgeWeight, setNewEdgeWeight] = useState(1);
  const [deleteId, setDeleteId] = useState('');

  useEffect(() => {
    if (!window.cytoscape || !cyRef.current) return;
    cyInstance.current = window.cytoscape({
      container: cyRef.current,
      elements: DEFAULT_ELEMENTS,
      style: [
        { selector: 'node', style: { 'background-color': '#6366f1', 'label': 'data(label)', 'color': '#fff', 'text-valign': 'center', 'font-size': '14px', 'width': '40px', 'height': '40px', 'border-width': 2, 'border-color': '#4f46e5' } },
        { selector: 'edge', style: { 'line-color': '#a5b4fc', 'target-arrow-color': '#6366f1', 'target-arrow-shape': directed ? 'triangle' : 'none', 'curve-style': 'bezier', 'label': 'data(weight)', 'font-size': '12px', 'color': '#1e293b', 'text-background-opacity': 0, 'text-outline-color': '#fff', 'text-outline-width': 2 } },
        { selector: '.highlighted', style: { 'background-color': '#f59e0b', 'line-color': '#f59e0b', 'target-arrow-color': '#f59e0b' } },
      ],
      layout: { name: 'cose', animate: false },
      minZoom: 0.3,
      maxZoom: 3,
      wheelSensitivity: 0.3,
    });
    return () => {
      cyInstance.current?.destroy();
    };
  }, []);

  function getGraphData() {
    if (!cyInstance.current) return { vertices: [], edges: [] };
    const vertices = cyInstance.current.nodes().map(n => n.id());
    const edges = cyInstance.current.edges().map(e => ({
      u: e.source().id(),
      v: e.target().id(),
      weight: e.data('weight') || 1,
    }));
    return { vertices, edges };
  }

  function addNode() {
    if (!cyInstance.current) return;
    const id = String(cyInstance.current.nodes().length + 1);
    cyInstance.current.add({ data: { id, label: id } });
    cyInstance.current.layout({ name: 'cose', animate: false }).run();
  }

  function addEdge() {
    if (!cyInstance.current || !newEdgeSrc || !newEdgeTgt) return;
    const id = `${newEdgeSrc}-${newEdgeTgt}-${Date.now()}`;
    if (cyInstance.current.getElementById(id).length) return;
    cyInstance.current.add({ data: { id, source: newEdgeSrc, target: newEdgeTgt, weight: Number(newEdgeWeight) } });
    setNewEdgeSrc(''); setNewEdgeTgt(''); setNewEdgeWeight(1);
  }

  function clearGraph() {
    cyInstance.current?.elements().remove();
    setResult(null);
  }

  function deleteElement() {
    if (!cyInstance.current || !deleteId.trim()) return;
    const el = cyInstance.current.getElementById(deleteId.trim());
    if (el.length) { el.remove(); setDeleteId(''); }
    else showError(`Element "${deleteId}" not found`);
  }

  function analyzeGraph() {
    const { vertices, edges } = getGraphData();
    if (!vertices.length) {
      showError('Add at least one node to analyze the graph');
      return;
    }

    const indexMap = new Map(vertices.map((v, i) => [v, i]));
    const matrix = Array.from({ length: vertices.length }, () =>
      Array.from({ length: vertices.length }, () => 0)
    );

    edges.forEach((edge) => {
      const i = indexMap.get(edge.u);
      const j = indexMap.get(edge.v);
      if (typeof i !== 'number' || typeof j !== 'number') return;
      matrix[i][j] += 1;
      if (!directed) {
        matrix[j][i] += 1;
      }
    });

    const degrees = vertices.map((node, idx) => {
      if (directed) {
        const outDegree = matrix[idx].reduce((sum, val) => sum + val, 0);
        const inDegree = matrix.reduce((sum, row) => sum + row[idx], 0);
        return { node, degree: `${inDegree} in / ${outDegree} out` };
      }
      const degree = matrix[idx].reduce((sum, val) => sum + val, 0);
      return { node, degree };
    });

    setResult({ labels: vertices, matrix, degrees });
    showSuccess('Adjacency matrix and degrees generated');
  }

  return (
    <ModulePage
      title="Graph Theory (Intro)"
      subtitle="Build graphs, inspect adjacency, and check basic properties"
    >

      <ModuleCard title="Deep Dive Connection" icon="fa-route">
          <p>
            This module focuses on graph structure, visual properties, adjacency, and degrees.
            To run search algorithms like DFS or BFS, please visit the Algorithms track.
          </p>
          <Link to="/algorithms/modules/graph-algorithms" className="btn btn-outline btn-deep-dive">
            <i className="fas fa-arrow-right"></i> Looking for DFS/BFS? Go to Graph Algorithms.
          </Link>
      </ModuleCard>

      <ModuleCard title="Graph Visualization" icon="fa-project-diagram">
          {/* Controls */}
          <div className="visualization-controls" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            <button className="btn btn-primary" onClick={addNode}><i className="fas fa-plus-circle"></i> Add Node</button>
            <button className="btn btn-outline" onClick={clearGraph}><i className="fas fa-trash"></i> Clear</button>
            <button className="btn btn-outline" title="Fit graph to view" onClick={() => cyInstance.current?.fit(undefined, 30)}>
              <i className="fas fa-compress-arrows-alt"></i> Fit
            </button>
            <button className="btn btn-outline" title="Reset zoom to 1:1"
              onClick={() => cyInstance.current?.zoom({ level: 1, renderedPosition: { x: cyRef.current.offsetWidth / 2, y: 200 } })}>
              <i className="fas fa-search"></i> 1:1
            </button>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem' }}>
              <input type="checkbox" checked={directed} onChange={e => setDirected(e.target.checked)} />
              Directed
            </label>
          </div>

          {/* Delete node/edge row */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Delete by ID</label>
              <input type="text" value={deleteId} onChange={e => setDeleteId(e.target.value)}
                placeholder="Node or edge ID" style={{ width: '140px' }}
                onKeyDown={e => e.key === 'Enter' && deleteElement()} />
            </div>
            <button className="btn btn-outline" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={deleteElement}>
              <i className="fas fa-minus-circle"></i> Delete
            </button>
          </div>

          {/* Add edge row */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>From</label>
              <input type="text" value={newEdgeSrc} onChange={e => setNewEdgeSrc(e.target.value)} placeholder="Node ID" style={{ width: '80px' }} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>To</label>
              <input type="text" value={newEdgeTgt} onChange={e => setNewEdgeTgt(e.target.value)} placeholder="Node ID" style={{ width: '80px' }} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Weight</label>
              <input type="number" value={newEdgeWeight} onChange={e => setNewEdgeWeight(e.target.value)} style={{ width: '70px' }} />
            </div>
            <button className="btn btn-primary" onClick={addEdge}><i className="fas fa-link"></i> Add Edge</button>
          </div>

          {/* Cytoscape container — wrapped via useRef */}
          <div ref={cyRef} style={{ height: '400px', border: '1px solid #e0e7ef', borderRadius: '8px', marginBottom: '1rem' }}></div>

          {/* Intro analysis controls */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
            <button className="btn btn-primary" onClick={analyzeGraph}>
              <i className="fas fa-table"></i> Generate Adjacency + Degrees
            </button>
          </div>

          {result && (
            <ResultPanel
              title="Result"
              value={result}
              valueRenderer={() => <GraphResult result={result} />}
            />
          )}
      </ModuleCard>
    </ModulePage>
  );
}
