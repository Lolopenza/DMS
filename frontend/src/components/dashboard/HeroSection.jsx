import React from 'react';
import { Link } from 'react-router-dom';
import { USER_ACHIEVEMENTS_PATH } from '../../routes.js';

/** Demo-only streak / daily goal — backend hooks planned later */
const MOCK_STREAK = { days: 5, active: true };
const MOCK_DAILY_GOAL = { completed: 3, target: 5 };

const MOCK_ACHIEVEMENTS = [
  { id: 'first-steps', name: 'First Steps', icon: '🎯', earned: true },
  { id: 'week-warrior', name: 'Week Warrior', icon: '⚔️', earned: true },
  { id: 'mastery-king', name: 'Mastery King', icon: '👑', earned: false },
];

function CircularGoal({ completed, target }) {
  const pct = target > 0 ? Math.min(100, Math.round((completed / target) * 100)) : 0;
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div
      className="relative flex h-[92px] w-[92px] items-center justify-center"
      title={`Daily goal: ${completed}/${target} practice items`}
    >
      <svg className="-rotate-90" width="92" height="92" viewBox="0 0 92 92" aria-hidden>
        <circle cx="46" cy="46" r={r} fill="none" className="stroke-slate-200 dark:stroke-slate-700" strokeWidth="10" />
        <circle
          cx="46"
          cy="46"
          r={r}
          fill="none"
          className="stroke-indigo-500 transition-[stroke-dashoffset] duration-500"
          strokeWidth="10"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{completed}</span>
        <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">of {target}</span>
      </div>
    </div>
  );
}

export default function HeroSection({ displayName, tier }) {
  const tierLabel =
    tier === 'beginner' ? 'Getting started' : tier === 'active' ? 'Active learner' : 'Advanced';

  return (
    <div className="mb-8 space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-6 shadow-lg shadow-indigo-500/10 dark:border-indigo-900/50 dark:from-indigo-950/40 dark:via-slate-950 dark:to-violet-950/30 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/10" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600/90 dark:text-indigo-300">
              Your learning hub
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Welcome back, {displayName}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Adaptive recommendations below reflect your Bayesian mastery profile — pick a module and learn by doing with
              instant feedback.
            </p>
            <div className="mt-4 inline-flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-indigo-200 bg-white/80 px-3 py-1 text-xs font-semibold text-indigo-800 shadow-sm dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-100">
                {tierLabel}
              </span>
              <Link
                to={USER_ACHIEVEMENTS_PATH}
                className="text-xs font-semibold text-indigo-700 underline-offset-4 hover:underline dark:text-indigo-300"
              >
                View achievements
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 lg:justify-end">
            <div
              className="flex items-center gap-3 rounded-2xl border border-orange-200 bg-white/90 px-4 py-3 shadow-sm dark:border-orange-900/40 dark:bg-slate-900/80"
              title="Demo streak — future backend: activity log"
            >
              <span className="text-3xl" aria-hidden>
                {MOCK_STREAK.active ? '🔥' : '💤'}
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Streak
                </p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{MOCK_STREAK.days} days</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
              <CircularGoal completed={MOCK_DAILY_GOAL.completed} target={MOCK_DAILY_GOAL.target} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Daily goal
                </p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Practice items today (demo)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-6 flex flex-wrap items-center gap-2 border-t border-indigo-100/80 pt-6 dark:border-indigo-900/50">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Badges (demo)
          </span>
          {MOCK_ACHIEVEMENTS.map((a) => (
            <span
              key={a.id}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                a.earned
                  ? 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-100'
                  : 'border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-900'
              }`}
              title={a.name}
            >
              <span aria-hidden>{a.icon}</span>
              {a.name}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}
