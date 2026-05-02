import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader } from '../ui/index.js';

/** Mock cross-subject snapshot — swap with API later */
const MOCK_ROWS = [
  { slug: 'linear-algebra', label: 'Linear Algebra', mastery: 65 },
  { slug: 'discrete-math', label: 'Discrete Mathematics', mastery: 40 },
  { slug: 'algorithms', label: 'Algorithms & Data Structures', mastery: 22 },
  { slug: 'probability-statistics', label: 'Probability & Statistics', mastery: 12 },
];

export default function SubjectProgressOverview() {
  return (
    <Card variant="elevated" padding="lg" className="mb-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <CardHeader title="Subject snapshot" subtitle="Demo overview — tap a track to explore modules." />
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Mock data</span>
      </div>
      <ul className="mt-5 space-y-4">
        {MOCK_ROWS.map((row) => (
          <li key={row.slug}>
            <Link
              to={`/${row.slug}`}
              className="block rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition hover:border-indigo-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-indigo-700"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{row.label}</span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-300">{row.mastery}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all"
                  style={{ width: `${Math.min(100, row.mastery)}%` }}
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
        Tip: after core recommendation engine work, this strip can pull aggregated BKT by subject.
      </p>
    </Card>
  );
}
