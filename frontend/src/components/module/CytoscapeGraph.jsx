import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';

/**
 * Reusable Cytoscape graph visualization component.
 * Consolidates graph rendering logic from GraphTheory, Automata, AdjacencyMatrix.
 * 
 * @param {Array} elements - Cytoscape elements array [{data: {id, label, ...}}, ...]
 * @param {string} layout - Layout algorithm ('cose', 'grid', 'circle', 'breadthfirst', 'concentric')
 * @param {Array} stylesheet - Custom Cytoscape stylesheet (optional)
 * @param {Object} layoutOptions - Additional layout options (optional)
 * @param {string} className - Additional CSS classes
 * @param {string} height - Container height (default: '500px')
 */
export default function CytoscapeGraph({
  elements = [],
  layout = 'cose',
  stylesheet = null,
  layoutOptions = {},
  className = '',
  height = '500px',
}) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

  // Default beautiful stylesheet
  const defaultStylesheet = [
    {
      selector: 'node',
      style: {
        'background-color': '#4F46E5',
        'label': 'data(label)',
        'color': '#1E293B',
        'text-valign': 'center',
        'text-halign': 'center',
        'font-size': '14px',
        'font-weight': '600',
        'width': '40px',
        'height': '40px',
        'border-width': '2px',
        'border-color': '#312E81',
        'text-outline-width': '2px',
        'text-outline-color': '#FFFFFF',
      },
    },
    {
      selector: 'node:selected',
      style: {
        'background-color': '#818CF8',
        'border-color': '#4F46E5',
        'border-width': '3px',
      },
    },
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': '#94A3B8',
        'target-arrow-color': '#94A3B8',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'label': 'data(label)',
        'font-size': '12px',
        'color': '#475569',
        'text-background-color': '#FFFFFF',
        'text-background-opacity': 0.8,
        'text-background-padding': '3px',
        'text-background-shape': 'roundrectangle',
      },
    },
    {
      selector: 'edge:selected',
      style: {
        'line-color': '#4F46E5',
        'target-arrow-color': '#4F46E5',
        'width': 3,
      },
    },
    {
      selector: '.highlighted',
      style: {
        'background-color': '#10B981',
        'line-color': '#10B981',
        'target-arrow-color': '#10B981',
        'border-color': '#059669',
      },
    },
    {
      selector: '.start-node',
      style: {
        'background-color': '#22C55E',
        'border-color': '#16A34A',
        'border-width': '3px',
      },
    },
    {
      selector: '.accept-node',
      style: {
        'background-color': '#3B82F6',
        'border-color': '#2563EB',
        'border-width': '3px',
      },
    },
  ];

  // Default layout options
  const defaultLayoutOptions = {
    cose: {
      name: 'cose',
      animate: true,
      animationDuration: 500,
      nodeRepulsion: 8000,
      idealEdgeLength: 100,
      edgeElasticity: 100,
      nestingFactor: 5,
      gravity: 80,
      numIter: 1000,
      initialTemp: 200,
      coolingFactor: 0.95,
      minTemp: 1.0,
    },
    grid: {
      name: 'grid',
      animate: true,
      animationDuration: 500,
      avoidOverlap: true,
      padding: 30,
    },
    circle: {
      name: 'circle',
      animate: true,
      animationDuration: 500,
      avoidOverlap: true,
      padding: 30,
    },
    breadthfirst: {
      name: 'breadthfirst',
      animate: true,
      animationDuration: 500,
      directed: true,
      spacingFactor: 1.5,
      padding: 30,
    },
    concentric: {
      name: 'concentric',
      animate: true,
      animationDuration: 500,
      avoidOverlap: true,
      padding: 30,
    },
  };

  useEffect(() => {
    if (!containerRef.current || elements.length === 0) return;

    // Initialize Cytoscape
    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: stylesheet || defaultStylesheet,
      layout: { ...defaultLayoutOptions[layout], ...layoutOptions },
      minZoom: 0.3,
      maxZoom: 3,
      wheelSensitivity: 0.2,
    });

    cyRef.current = cy;

    // Fit graph to container
    cy.fit(50);

    // Cleanup on unmount
    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [elements, layout, stylesheet, layoutOptions]);

  // Handle empty state
  if (!elements || elements.length === 0) {
    return (
      <div
        className={`cytoscape-container flex items-center justify-center bg-slate-50 rounded-lg border border-slate-200 ${className}`}
        style={{ height }}
      >
        <p className="text-sm text-slate-500">No graph data to display</p>
      </div>
    );
  }

  return (
    <div className={`cytoscape-wrapper ${className}`}>
      <div
        ref={containerRef}
        className="cytoscape-container bg-white rounded-lg border border-slate-200"
        style={{ height, width: '100%' }}
      />
      
      {/* Zoom controls */}
      <div className="cytoscape-controls mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => cyRef.current?.fit(50)}
          className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          title="Fit to view"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 1.2)}
          className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          title="Zoom in"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => cyRef.current?.zoom(cyRef.current.zoom() / 1.2)}
          className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          title="Zoom out"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
        </button>
        <span className="text-xs text-slate-500 ml-2">
          Drag to pan • Scroll to zoom • Click nodes/edges to select
        </span>
      </div>
    </div>
  );
}

/**
 * Helper to convert adjacency list to Cytoscape elements.
 */
export function adjacencyListToElements(adjacencyList) {
  const elements = [];
  const nodes = new Set();

  // Add edges and collect nodes
  Object.entries(adjacencyList).forEach(([source, targets]) => {
    nodes.add(source);
    targets.forEach((target) => {
      nodes.add(target);
      elements.push({
        data: {
          id: `${source}-${target}`,
          source: String(source),
          target: String(target),
        },
      });
    });
  });

  // Add nodes
  nodes.forEach((node) => {
    elements.unshift({
      data: {
        id: String(node),
        label: String(node),
      },
    });
  });

  return elements;
}

/**
 * Helper to convert adjacency matrix to Cytoscape elements.
 */
export function adjacencyMatrixToElements(matrix, labels = null) {
  const elements = [];
  const n = matrix.length;

  // Add nodes
  for (let i = 0; i < n; i++) {
    elements.push({
      data: {
        id: String(i),
        label: labels ? labels[i] : String(i),
      },
    });
  }

  // Add edges
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (matrix[i][j]) {
        elements.push({
          data: {
            id: `${i}-${j}`,
            source: String(i),
            target: String(j),
            label: matrix[i][j] > 1 ? String(matrix[i][j]) : '',
          },
        });
      }
    }
  }

  return elements;
}
