import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, Button } from '../ui/index.js';

/** Mock journey — replace with API when backend tracking lands */
const MOCK_JOURNEY = {
  currentGoal: 'Master Linear Algebra fundamentals',
  completedModules: 5,
  totalModules: 8,
  nextModule: {
    name: 'Eigenvalues & Eigenvectors',
    slug: 'eigenvalues',
    subject: 'linear-algebra',
  },
};

export default function LearningJourneyCard() {
  const pct =
    MOCK_JOURNEY.totalModules > 0
      ? Math.round((MOCK_JOURNEY.completedModules / MOCK_JOURNEY.totalModules) * 100)
      : 0;
  const href = `/${MOCK_JOURNEY.nextModule.subject}/${MOCK_JOURNEY.nextModule.slug}`;

  return (
    <Card variant="elevated" padding="lg" className="mb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <CardHeader
          title="Your learning journey"
          subtitle="Demo roadmap card — shows milestone pacing for defense UI (hardcoded)."
        />
        <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-800 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-100">
          Mock data
        </span>
      </div>

      <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{MOCK_JOURNEY.currentGoal}</p>

      <div className="mt-4">
        <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
          <span>
            Progress {MOCK_JOURNEY.completedModules}/{MOCK_JOURNEY.totalModules} modules
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
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{MOCK_JOURNEY.nextModule.name}</p>
        </div>
        <Link to={href}>
          <Button>Continue learning</Button>
        </Link>
      </div>
    </Card>
  );
}
