import React, { useEffect, useRef, useState } from 'react';
import { calcGraphTheory } from '../api.js';
import { useToast } from '../components/Toast.jsx';

function GraphResult({ result, algorithm }) {
  if (!result) return null;

  // BFS / DFS / topological_sort → array of node IDs
  if (Array.isArray(result)) {
    return (
      <div className="explanation-box">
        <p style={{ margin: 0, fontFamily: 'var(--font-mono,monospace)', fontSize: '1rem' }}>
          {result.join(' → ')}
        </p>
      </div>
    );
  }

  // Dijkstra → { distances: {A:0, B:3}, predecessors: {B:'A'} }
  if (result.distances) {
    return (
      <table className="truth-table" style={{ maxWidth: '400px' }}>
        <thead><tr><th>Node</th><th>Distance</th><th>Via</th></tr></thead>
        <tbody>
          {Object.entries(result.distances).map(([node, dist]) => (
            <tr key={node}>
              <td>{node}</td>
              <td>{dist === Infinity || dist === null ? '∞' : dist}</td>
              <td>{result.predecessors?.[node] ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // Kruskal MST → { edges: [[u,v,w], ...], total_weight }
  if (result.edges && result.total_weight !== undefined) {
    return (
      <div>
        <table className="truth-table" style={{ maxWidth: '360px', marginBottom: '0.75rem' }}>
          <thead><tr><th>From</th><th>To</th><th>Weight</th></tr></thead>
          <tbody>
            {result.edges.map(([u, v, w], i) => (
              <tr key={i}><td>{u}</td><td>{v}</td><td>{w}</td></tr>
            ))}
          </tbody>
        </table>
        <p style={{ margin: 0, fontWeight: 600 }}>Total weight: {result.total_weight}</p>
      </div>
    );
  }

  // Connected components → array of arrays
  if (Array.isArray(result) && Array.isArray(result[0])) {
    return (
      <div>
        {result.map((comp, i) => (
          <div key={i} style={{ marginBottom: '0.4rem' }}>
            <span style={{ color: 'var(--primary,#6366f1)', fontWeight: 600 }}>Component {i + 1}:</span>{' '}
            {'{' + comp.join(', ') + '}'}
          </div>
        ))}
      </div>
    );
  }

  // Boolean results (has_cycle, is_connected, etc.)
  if (typeof result === 'boolean') {
    return <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>{result ? 'Yes ✓' : 'No ✗'}</p>;
  }

  // Fallback — pretty JSON
  return (
    <pre style={{ background: 'var(--surface-100,#f8f9fa)', padding: '1rem', borderRadius: '8px', overflowX: 'auto', fontSize: '0.9rem' }}>
      {JSON.stringify(result, null, 2)}
    </pre>
  );
}

const ALGORITHMS = [
  { value: 'bfs', label: 'BFS (Breadth-First Search)' },
  { value: 'dfs', label: 'DFS (Depth-First Search)' },
  { value: 'dijkstra', label: "Dijkstra's Shortest Path" },
  { value: 'mst_kruskal', label: "Kruskal's MST" },
  { value: 'is_connected', label: 'Check Connectivity' },
];

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

  const [algorithm, setAlgorithm] = useState('bfs');
  const [startNode, setStartNode] = useState('1');
  const [directed, setDirected] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

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
    const id = `${newEdgeSrc}-${newEdgeTgt}`;
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

  const ALGO_OP_MAP = {
    bfs: 'bfs',
    dfs: 'dfs',
    dijkstra: 'dijkstra',
    mst_kruskal: 'kruskal',
    is_connected: 'connected_components',
  };

  async function runAlgorithm() {
    setLoading(true);
    try {
      const { vertices, edges } = getGraphData();
      const operation = ALGO_OP_MAP[algorithm] ?? algorithm;
      const payload = {
        operation,
        graph: { vertices, edges, directed, weighted: true },
        start_node: startNode || (vertices[0] ?? '1'),
      };
      const data = await calcGraphTheory(payload);
      setResult(data);
      const resultData = data.result ?? data;
      const path = resultData.path ?? (Array.isArray(resultData) ? resultData : null);
      if (path && cyInstance.current) {
        cyInstance.current.elements().removeClass('highlighted');
        path.forEach(nodeId => {
          cyInstance.current.getElementById(String(nodeId)).addClass('highlighted');
        });
      }
      showSuccess(`${algorithm} completed`);
    } catch (err) {
      showError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="page-title">
        <h2>Graph Theory Calculator</h2>
        <p className="subtitle">Visualize graphs and run algorithms</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3><i className="fas fa-project-diagram"></i> Graph Visualization</h3>
        </div>
        <div className="card-body">
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

          {/* Algorithm controls */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="algorithm">Algorithm</label>
              <select id="algorithm" value={algorithm} onChange={e => setAlgorithm(e.target.value)}>
                {ALGORITHMS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="startNode">Start Node</label>
              <input type="text" id="startNode" value={startNode} onChange={e => setStartNode(e.target.value)} style={{ width: '80px' }} />
            </div>
            <button className="btn btn-primary" onClick={runAlgorithm} disabled={loading}>
              <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-play'}`}></i> {loading ? 'Running…' : 'Run'}
            </button>
          </div>

          {result && (
            <div className="result-container" tabIndex={0} aria-live="polite" style={{ marginTop: '1rem' }}>
              <h3><i className="fas fa-check-circle"></i> Result</h3>
              <GraphResult result={result.result ?? result} algorithm={algorithm} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
