import React from 'react';
import { Link } from 'react-router-dom';
import { USER_DASHBOARD_PATH } from '../../routes.js';
import { Card, CardHeader, Button } from '../../components/ui/index.js';

const ACHIEVEMENTS = [
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Complete your first interactive practice attempt.',
    icon: '🎯',
    earned: true,
    progress: null,
  },
  {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: 'Maintain a multi-day learning streak (demo).',
    icon: '⚔️',
    earned: true,
    progress: null,
  },
  {
    id: 'mastery-king',
    name: 'Mastery King',
    description: 'Reach advanced Bayesian mastery across modules.',
    icon: '👑',
    earned: false,
    progress: '5 / 10 modules',
  },
  {
    id: 'colab-analyst',
    name: 'Colab Analyst',
    description: 'Export analytics and run the Colab starter notebook.',
    icon: '📓',
    earned: false,
    progress: 'Locked — demo',
  },
];

export default function Achievements() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 px-4 py-10 text-slate-950 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Gamification</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Achievements</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Demo badges for defense presentation — backend persistence planned after adaptive core ships.
            </p>
          </div>
          <Link to={USER_DASHBOARD_PATH}>
            <Button variant="secondary">Back to dashboard</Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {ACHIEVEMENTS.map((a) => (
            <Card
              key={a.id}
              variant="elevated"
              padding="lg"
              className={
                a.earned
                  ? 'border-amber-200/80 bg-gradient-to-br from-amber-50/80 to-white dark:border-amber-900/40 dark:from-amber-950/25 dark:to-slate-950'
                  : 'opacity-90'
              }
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl" aria-hidden>
                  {a.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <CardHeader title={a.name} subtitle={a.description} />
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        a.earned
                          ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400'
                      }`}
                    >
                      {a.earned ? 'Earned' : 'Locked'}
                    </span>
                    {a.progress ? (
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{a.progress}</span>
                    ) : null}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
