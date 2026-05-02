import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, Button } from '../ui/index.js';
import { getLearningJourneySnapshot } from '../../api.js';

export default function LearningJourneyCard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const j = await getLearningJourneySnapshot();
        if (!cancelled) setData(j);
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load journey');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const completed = data?.completedModules ?? 0;
  const total = data?.totalModules ?? 0;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const next = data?.nextModule;
  const href = next ? `/${next.subjectSlug}/${next.moduleSlug}` : '/tracks';

  return (
    <Card variant="elevated" padding="lg" className="mb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <CardHeader
          title="Your learning journey"
          subtitle="Your progress through the catalog — next step suggested from your BKT profile."
        />
      </div>

      {error ? (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
        {data?.currentGoal ?? (error ? 'Journey summary unavailable' : 'Loading your journey…')}
      </p>

      <div className="mt-4">
        <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
          <span>
            Progress {completed}/{total} modules
          </span>
          <span>{pct}%</span>
        </div>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Next up</p>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
            {next ? next.displayName : 'Pick a track, or open the Practice Lab'}
          </p>
        </div>
        <Link to={href}>
          <Button>{next ? 'Continue learning' : 'Browse tracks'}</Button>
        </Link>
      </div>
    </Card>
  );
}
