import React from 'react';
import AnimatedResult, { HighlightResult } from './AnimatedResult.jsx';

/**
 * Compact summary for graph statistics (vertices, edges, degree sequence).
 */
export default function GraphStatsViewer({ data }) {
  const degrees = Array.isArray(data?.degrees) ? data.degrees : [];

  return (
    <AnimatedResult variant="slideUp">
      <HighlightResult>
        <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-5 dark:border-indigo-800 dark:from-indigo-950/50 dark:to-purple-950/50">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Graph statistics</h3>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Vertices
              </dt>
              <dd className="mt-1 text-2xl font-bold text-indigo-800 dark:text-indigo-200">{data.num_vertices}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Edges
              </dt>
              <dd className="mt-1 text-2xl font-bold text-indigo-800 dark:text-indigo-200">{data.num_edges}</dd>
            </div>
          </dl>
          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Degree sequence
            </p>
            <p className="mt-1 font-mono text-sm text-slate-800 dark:text-slate-200">{degrees.join(', ')}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
            <span>
              <span className="font-medium text-slate-700 dark:text-slate-300">Directed:</span>{' '}
              {data.directed ? 'Yes' : 'No'}
            </span>
            <span>
              <span className="font-medium text-slate-700 dark:text-slate-300">Weighted:</span>{' '}
              {data.weighted ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </HighlightResult>
    </AnimatedResult>
  );
}
