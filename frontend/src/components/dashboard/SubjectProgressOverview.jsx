import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader } from '../ui/index.js';
import { getLearningProgressSubjects } from '../../api.js';

export default function SubjectProgressOverview() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await getLearningProgressSubjects();
        if (!cancelled) setRows(Array.isArray(list) ? list : []);
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load progress');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card variant="elevated" padding="lg" className="mb-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <CardHeader title="Subject snapshot" subtitle="Adjusted BKT mastery averaged across modules in each subject." />
      </div>
      {error ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}
      <ul className="mt-5 space-y-4">
        {!rows.length && !error ? (
          <li className="text-sm dmc-subtitle py-4 text-center">Loading…</li>
        ) : null}
        {rows.map((row) => (
          <li key={row.subjectSlug}>
            <Link
              to={`/${row.subjectSlug}`}
              className="block rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition hover:border-indigo-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-indigo-700"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{row.displayName}</span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-300">{row.subjectMasteryPercent}%</span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Modules ≥80% adjusted: {row.completedModules}/{row.totalModules}
              </p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all"
                  style={{ width: `${Math.min(100, row.subjectMasteryPercent)}%` }}
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
        Uses the same reliability-adjusted Bayesian estimate as your practice mastery cards.
      </p>
    </Card>
  );
}
