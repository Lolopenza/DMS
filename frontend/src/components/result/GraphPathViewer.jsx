import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import CytoscapeComponent from 'react-cytoscapejs';
import { Network, Route, Play, Pause, RotateCcw } from 'lucide-react';
import AnimatedResult from './AnimatedResult.jsx';

/**
 * Graph visualization with path highlighting and traversal animation.
 * Uses Cytoscape.js for rendering.
 *
 * @param {Array<{source: string, target: string, weight?: number}>} edges - Graph edges
 * @param {string[]} path - Highlighted path (node ids in order)
 * @param {string[]} visitedOrder - BFS/DFS traversal order
 * @param {'bfs'|'dfs'|'dijkstra'|'mst'|'info'} operation
 * @param {object} stats - Additional statistics
 * @param {boolean} directed - Whether graph is directed
 */
export default function GraphPathViewer({
  edges = [],
  path = [],
  visitedOrder = [],
  operation = 'info',
  stats = {},
  directed = false,
}) {
  const cyRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const animationRef = useRef(null);

  const nodes = extractNodes(edges);
  const elements = buildElements(nodes, edges, path, visitedOrder, animationStep, isAnimating);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, []);

  const startAnimation = () => {
    if (visitedOrder.length === 0) return;

    setIsAnimating(true);
    setAnimationStep(0);
    let step = 0;

    animationRef.current = setInterval(() => {
      step++;
      if (step >= visitedOrder.length) {
        clearInterval(animationRef.current);
        setIsAnimating(false);
      } else {
        setAnimationStep(step);
      }
    }, 800);
  };

  const stopAnimation = () => {
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }
    setIsAnimating(false);
  };

  const resetAnimation = () => {
    stopAnimation();
    setAnimationStep(0);
  };

  const stylesheet = [
    {
      selector: 'node',
      style: {
        'background-color': '#e2e8f0',
        label: 'data(label)',
        'text-valign': 'center',
        'text-halign': 'center',
        'font-size': '12px',
        'font-weight': 'bold',
        color: '#334155',
        width: 36,
        height: 36,
        'border-width': 2,
        'border-color': '#94a3b8',
      },
    },
    {
      selector: 'node.visited',
      style: {
        'background-color': '#818cf8',
        'border-color': '#4f46e5',
        color: '#ffffff',
      },
    },
    {
      selector: 'node.current',
      style: {
        'background-color': '#fbbf24',
        'border-color': '#d97706',
        color: '#1e293b',
        width: 42,
        height: 42,
      },
    },
    {
      selector: 'node.path',
      style: {
        'background-color': '#10b981',
        'border-color': '#059669',
        color: '#ffffff',
      },
    },
    {
      selector: 'node.start',
      style: {
        'background-color': '#3b82f6',
        'border-color': '#2563eb',
        color: '#ffffff',
      },
    },
    {
      selector: 'node.end',
      style: {
        'background-color': '#ef4444',
        'border-color': '#dc2626',
        color: '#ffffff',
      },
    },
    {
      selector: 'edge',
      style: {
        width: 2,
        'line-color': '#cbd5e1',
        'target-arrow-color': '#cbd5e1',
        'target-arrow-shape': directed ? 'triangle' : 'none',
        'curve-style': 'bezier',
        label: 'data(weight)',
        'font-size': '10px',
        color: '#64748b',
        'text-background-color': '#ffffff',
        'text-background-opacity': 0.8,
        'text-background-padding': '2px',
      },
    },
    {
      selector: 'edge.path',
      style: {
        width: 4,
        'line-color': '#10b981',
        'target-arrow-color': '#10b981',
      },
    },
    {
      selector: 'edge.visited',
      style: {
        width: 3,
        'line-color': '#818cf8',
        'target-arrow-color': '#818cf8',
      },
    },
  ];

  return (
    <AnimatedResult variant="slideUp" className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              {getOperationTitle(operation)}
            </h3>
          </div>

          {visitedOrder.length > 0 && (
            <div className="flex items-center gap-2">
              {!isAnimating ? (
                <button
                  onClick={startAnimation}
                  className="flex items-center gap-1 rounded-lg bg-indigo-100 px-3 py-1.5 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900"
                >
                  <Play className="h-4 w-4" />
                  Animate
                </button>
              ) : (
                <button
                  onClick={stopAnimation}
                  className="flex items-center gap-1 rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:hover:bg-amber-900"
                >
                  <Pause className="h-4 w-4" />
                  Pause
                </button>
              )}
              <button
                onClick={resetAnimation}
                className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>
          )}
        </div>

        <div className="h-64 overflow-hidden rounded-lg border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
          <CytoscapeComponent
            elements={elements}
            stylesheet={stylesheet}
            layout={{ name: 'cose', animate: false }}
            style={{ width: '100%', height: '100%' }}
            cy={(cy) => {
              cyRef.current = cy;
            }}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Legend />
        </div>
      </div>

      {(path.length > 0 || Object.keys(stats).length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950"
        >
          {path.length > 0 && (
            <div className="mb-4">
              <div className="mb-2 flex items-center gap-2">
                <Route className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Path
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {path.map((node, idx) => (
                  <React.Fragment key={idx}>
                    <span className="rounded-lg bg-emerald-100 px-2 py-1 font-mono text-sm font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                      {node}
                    </span>
                    {idx < path.length - 1 && (
                      <span className="text-slate-400">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {visitedOrder.length > 0 && (
            <div className="mb-4">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Traversal Order
              </span>
              <div className="mt-1 flex flex-wrap items-center gap-1">
                {visitedOrder.map((node, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`rounded px-2 py-0.5 font-mono text-xs ${
                      idx <= animationStep && isAnimating
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {idx + 1}. {node}
                  </motion.span>
                ))}
              </div>
            </div>
          )}

          {Object.keys(stats).length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {Object.entries(stats).map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900"
                >
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {formatStatKey(key)}
                  </span>
                  <div className="mt-1 text-lg font-bold text-indigo-700 dark:text-indigo-300">
                    {formatStatValue(value)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatedResult>
  );
}

function getOperationTitle(operation) {
  const titles = {
    bfs: 'Breadth-First Search',
    dfs: 'Depth-First Search',
    dijkstra: 'Dijkstra\'s Shortest Path',
    mst: 'Minimum Spanning Tree',
    info: 'Graph Visualization',
    adjacency_matrix: 'Adjacency Matrix',
  };
  return titles[operation] || 'Graph Analysis';
}

function extractNodes(edges) {
  const nodeSet = new Set();
  edges.forEach((e) => {
    if (e.source) nodeSet.add(String(e.source));
    if (e.target) nodeSet.add(String(e.target));
  });
  return Array.from(nodeSet);
}

function buildElements(nodes, edges, path, visitedOrder, animationStep, isAnimating) {
  const pathSet = new Set(path.map(String));
  const visitedSet = new Set(
    isAnimating ? visitedOrder.slice(0, animationStep + 1).map(String) : []
  );
  const currentNode = isAnimating ? visitedOrder[animationStep] : null;

  const nodeElements = nodes.map((id) => {
    let classes = [];
    if (String(id) === currentNode) {
      classes.push('current');
    } else if (pathSet.has(String(id))) {
      classes.push('path');
      if (path[0] === id) classes.push('start');
      if (path[path.length - 1] === id) classes.push('end');
    } else if (visitedSet.has(String(id))) {
      classes.push('visited');
    }

    return {
      data: { id: String(id), label: String(id) },
      classes: classes.join(' '),
    };
  });

  const pathEdges = new Set();
  for (let i = 0; i < path.length - 1; i++) {
    pathEdges.add(`${path[i]}-${path[i + 1]}`);
    pathEdges.add(`${path[i + 1]}-${path[i]}`);
  }

  const edgeElements = edges.map((e, idx) => {
    const source = String(e.source);
    const target = String(e.target);
    const edgeKey1 = `${source}-${target}`;
    const edgeKey2 = `${target}-${source}`;
    let classes = [];

    if (pathEdges.has(edgeKey1) || pathEdges.has(edgeKey2)) {
      classes.push('path');
    }

    return {
      data: {
        id: `e${idx}`,
        source,
        target,
        weight: e.weight !== undefined ? e.weight : '',
      },
      classes: classes.join(' '),
    };
  });

  return [...nodeElements, ...edgeElements];
}

function Legend() {
  const items = [
    { color: 'bg-slate-300', label: 'Unvisited' },
    { color: 'bg-indigo-500', label: 'Visited' },
    { color: 'bg-amber-400', label: 'Current' },
    { color: 'bg-emerald-500', label: 'Path' },
  ];

  return (
    <>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className={`h-3 w-3 rounded-full ${item.color}`} />
          <span className="text-xs text-slate-600 dark:text-slate-400">
            {item.label}
          </span>
        </div>
      ))}
    </>
  );
}

function formatStatKey(key) {
  return key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
}

function formatStatValue(value) {
  if (typeof value === 'number') {
    return Number.isInteger(value) ? value : value.toFixed(2);
  }
  if (Array.isArray(value)) {
    return value.join(' → ');
  }
  return String(value);
}
