import React, { useState } from 'react';
import MathResultBox from './MathResultBox.jsx';

/**
 * Renders algorithm execution steps in an expandable accordion format.
 * Each step shows the state, operation, and optional visualization.
 * 
 * @param {Array} steps - Array of step objects with structure:
 *   { step: number, description: string, state: any, operation: string, highlight: Array }
 * @param {string} title - Title for the step-by-step section
 */
export function StepByStepRenderer({ steps, title = 'Execution Steps' }) {
  const [expandedSteps, setExpandedSteps] = useState(new Set([0])); // First step expanded by default

  if (!steps || steps.length === 0) {
    return <p className="text-sm text-slate-500">No execution steps available</p>;
  }

  function toggleStep(index) {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  function expandAll() {
    setExpandedSteps(new Set(steps.map((_, i) => i)));
  }

  function collapseAll() {
    setExpandedSteps(new Set());
  }

  return (
    <div className="step-by-step-container space-y-4">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Expand All
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Steps accordion */}
      <div className="space-y-2">
        {steps.map((step, index) => {
          const isExpanded = expandedSteps.has(index);
          const isFirst = index === 0;
          const isLast = index === steps.length - 1;

          return (
            <div
              key={index}
              className={`border rounded-lg overflow-hidden transition-all ${
                isExpanded ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white'
              }`}
            >
              {/* Step header (always visible) */}
              <button
                type="button"
                onClick={() => toggleStep(index)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Step number badge */}
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                      isFirst
                        ? 'bg-green-100 text-green-700 border-2 border-green-300'
                        : isLast
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {step.step ?? index + 1}
                  </span>

                  {/* Step description */}
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {step.description || step.operation || `Step ${index + 1}`}
                    </p>
                    {step.operation && step.description && (
                      <p className="text-xs text-slate-500 mt-0.5">{step.operation}</p>
                    )}
                  </div>
                </div>

                {/* Expand/collapse icon */}
                <svg
                  className={`w-5 h-5 text-slate-400 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Step content (expandable) */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-slate-200">
                  {/* State visualization */}
                  {step.state && (
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-2">Current State:</p>
                      {Array.isArray(step.state) ? (
                        <ArrayVisualization
                          array={step.state}
                          highlight={step.highlight}
                        />
                      ) : typeof step.state === 'object' ? (
                        <pre className="text-xs bg-slate-100 rounded p-3 overflow-x-auto">
                          {JSON.stringify(step.state, null, 2)}
                        </pre>
                      ) : (
                        <p className="text-sm text-slate-700 font-mono">{String(step.state)}</p>
                      )}
                    </div>
                  )}

                  {/* Additional details */}
                  {step.details && (
                    <div className="text-sm text-slate-600 bg-white rounded-lg p-3 border border-slate-200">
                      {step.details}
                    </div>
                  )}

                  {/* Metrics (comparisons, swaps, etc.) */}
                  {step.metrics && (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(step.metrics).map(([key, value]) => (
                        <span
                          key={key}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-white border border-slate-200 rounded"
                        >
                          <span className="text-slate-500">{key}:</span>
                          <span className="text-slate-800 font-semibold">{value}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-800">Total Steps:</span> {steps.length}
        </p>
      </div>
    </div>
  );
}

/**
 * Visualizes an array with optional highlighting.
 */
function ArrayVisualization({ array, highlight = [] }) {
  const maxValue = Math.max(...array.map(Math.abs), 1);

  return (
    <div className="flex items-end gap-1 h-24 bg-white rounded-lg p-3 border border-slate-200">
      {array.map((value, index) => {
        const isHighlighted = highlight.includes(index);
        const height = `${(Math.abs(value) / maxValue) * 100}%`;

        return (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            {/* Bar */}
            <div className="w-full flex items-end justify-center" style={{ height: '80%' }}>
              <div
                className={`w-full rounded-t transition-all ${
                  isHighlighted
                    ? 'bg-indigo-500'
                    : 'bg-slate-300'
                }`}
                style={{ height }}
              />
            </div>
            {/* Value label */}
            <span
              className={`text-xs font-mono font-semibold ${
                isHighlighted ? 'text-indigo-700' : 'text-slate-600'
              }`}
            >
              {value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Complexity badge component for Big O notation.
 */
export function ComplexityBadge({ time, space, algorithm }) {
  if (!time && !space) return null;

  return (
    <div className="complexity-badge inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
      {time && (
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs font-medium text-slate-600">Time:</span>
          <span className="text-sm font-bold text-purple-700 font-mono">{time}</span>
        </div>
      )}
      {space && (
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
          <span className="text-xs font-medium text-slate-600">Space:</span>
          <span className="text-sm font-bold text-indigo-700 font-mono">{space}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Algorithm complexity data for common algorithms.
 */
export const ALGORITHM_COMPLEXITY = {
  'bubble-sort': { time: 'O(n²)', space: 'O(1)', best: 'O(n)', worst: 'O(n²)' },
  'merge-sort': { time: 'O(n log n)', space: 'O(n)', best: 'O(n log n)', worst: 'O(n log n)' },
  'quick-sort': { time: 'O(n log n)', space: 'O(log n)', best: 'O(n log n)', worst: 'O(n²)' },
  'insertion-sort': { time: 'O(n²)', space: 'O(1)', best: 'O(n)', worst: 'O(n²)' },
  'heap-sort': { time: 'O(n log n)', space: 'O(1)', best: 'O(n log n)', worst: 'O(n log n)' },
  'dijkstra': { time: 'O((V + E) log V)', space: 'O(V)', best: 'O((V + E) log V)', worst: 'O((V + E) log V)' },
  'bfs': { time: 'O(V + E)', space: 'O(V)', best: 'O(V + E)', worst: 'O(V + E)' },
  'dfs': { time: 'O(V + E)', space: 'O(V)', best: 'O(V + E)', worst: 'O(V + E)' },
  'binary-search': { time: 'O(log n)', space: 'O(1)', best: 'O(1)', worst: 'O(log n)' },
  'linear-search': { time: 'O(n)', space: 'O(1)', best: 'O(1)', worst: 'O(n)' },
};
