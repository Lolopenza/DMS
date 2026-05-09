import React, { useMemo } from 'react';
import { clampPercent, computeOverallPercent } from '../utils/skillMetrics.js';
import { getPracticeTopicLabel } from '../catalog/practiceTopicRegistry.js';

function prettifySlug(slug) {
  if (!slug) return '';
  return String(slug)
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function masteryMeta(percent) {
  if (percent < 40) {
    return {
      label: 'Getting started',
      emoji: '🌱',
      badgeClass: 'skill-mastery-badge skill-mastery-badge-beginner bg-emerald-50 text-emerald-700 border-emerald-200',
      barClass: 'bg-emerald-500',
    };
  }
  if (percent <= 70) {
    return {
      label: 'Building skill',
      emoji: '📈',
      badgeClass: 'skill-mastery-badge skill-mastery-badge-learning bg-indigo-50 text-indigo-700 border-indigo-200',
      barClass: 'bg-indigo-500',
    };
  }
  return {
    label: 'Strong',
    emoji: '🏆',
    badgeClass: 'skill-mastery-badge skill-mastery-badge-master bg-amber-50 text-amber-700 border-amber-200',
    barClass: 'bg-amber-500',
  };
}

function confidenceCopy(totalAttempts) {
  const n = Number.isFinite(totalAttempts) ? totalAttempts : 0;
  if (n < 3) return 'Early estimate — a few more practice items make this steadier.';
  if (n < 8) return 'Estimate is stabilizing as you keep practicing.';
  return null;
}

export default function SkillMasteryDashboard({ skills = [], loading = false, error = '' }) {
  const overallPercent = useMemo(() => computeOverallPercent(skills), [skills]);

  const overall = masteryMeta(overallPercent);

  return (
    <section className="skill-mastery mb-8">
      <div className="dmc-card">
        <div className="dmc-card-header flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="dmc-title text-xl font-semibold">Topic strength</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="dmc-subtitle text-sm">
                One score per topic from your practice — it moves as you solve more problems.
              </p>
              <span
                className="inline-flex h-5 w-5 cursor-help items-center justify-center rounded-full border border-slate-300 text-xs font-semibold text-slate-500"
                title="We blend a knowledge estimate with how much evidence we have. Very few attempts pull the score toward a neutral starting point so one lucky guess doesn’t jump you to 100%."
                aria-label="How topic strength is estimated"
              >
                i
              </span>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 dmc-surface-soft">
            <span className="text-sm">{overall.emoji}</span>
            <span className="dmc-subtitle text-xs font-medium">Across topics</span>
            <span className="dmc-title text-sm font-bold">{overallPercent}%</span>
          </div>
        </div>

        <div className="dmc-card-body">
          {loading && (
            <div className="grid gap-3">
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="animate-pulse rounded-xl border border-slate-100 p-4">
                  <div className="mb-3 h-4 w-44 rounded bg-slate-200" />
                  <div className="mb-2 h-2.5 w-full rounded bg-slate-200" />
                  <div className="h-3 w-24 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && skills.length === 0 && (
            <div className="rounded-xl border border-slate-200 px-4 py-6 text-center dmc-surface-soft">
              <p className="dmc-title font-medium">No topic data yet</p>
              <p className="dmc-subtitle mt-1 text-sm">Solve a few practice problems to see your strengths here.</p>
            </div>
          )}

          {!loading && !error && skills.length > 0 && (
            <div className="grid gap-3">
              {skills.map((skill) => {
                const pKnow = Number(skill?.pKnow) || 0;
                const attempts = Math.max(0, Number(skill?.totalAttempts) || 0);
                const correctAttempts = Math.max(0, Number(skill?.correctAttempts) || 0);
                const reliability = Math.min(1, attempts / 8);
                const adjustedPknow = 0.25 + (pKnow - 0.25) * reliability;
                const percent = clampPercent(adjustedPknow);
                const meta = masteryMeta(percent);
                const slug = skill?.topicSlug || '';
                const label =
                  skill?.topicName
                  || getPracticeTopicLabel(slug)
                  || (slug ? prettifySlug(slug) : 'Unknown topic');
                const rawPercent = clampPercent(pKnow);
                const accuracy = attempts > 0 ? Math.round((correctAttempts / attempts) * 100) : 0;
                const calibrating = confidenceCopy(attempts);
                const triesWord = attempts === 1 ? 'try' : 'tries';

                return (
                  <article key={skill?.topicSlug || label} className="rounded-xl border border-slate-200 p-4 dmc-surface-soft">
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="dmc-title text-sm font-semibold">{label}</h3>
                        {calibrating ? (
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{calibrating}</p>
                        ) : null}
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${meta.badgeClass}`}
                      >
                        <span>{meta.emoji}</span>
                        {meta.label}
                      </span>
                    </div>

                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full ${meta.barClass} transition-all duration-500`}
                        style={{ width: `${percent}%` }}
                        role="progressbar"
                        aria-valuenow={percent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${label} estimated mastery`}
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                      <span className="dmc-subtitle">Estimated mastery</span>
                      <span className="dmc-title font-semibold">{percent}%</span>
                    </div>

                    <p className="mt-2 text-xs dmc-subtitle">
                      <span className="dmc-title font-medium text-slate-700 dark:text-slate-300">
                        {attempts} practice {triesWord}
                      </span>
                      {attempts > 0 ? (
                        <>
                          {' · '}
                          <span>{accuracy}% correct on this topic</span>
                        </>
                      ) : (
                        <span> · Answer a prompt to start tracking</span>
                      )}
                    </p>

                    <details className="group mt-3 rounded-lg border border-slate-200/80 bg-white/50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950/40">
                      <summary className="cursor-pointer list-none font-medium text-slate-600 marker:hidden dark:text-slate-400 [&::-webkit-details-marker]:hidden">
                        <span className="inline-flex items-center gap-1.5">
                          <i className="fas fa-chevron-right text-[0.65rem] transition-transform group-open:rotate-90" aria-hidden />
                          Model details
                        </span>
                      </summary>
                      <dl className="mt-3 space-y-2 border-t border-slate-200 pt-3 text-slate-600 dark:border-slate-700 dark:text-slate-400">
                        <div className="flex justify-between gap-4">
                          <dt className="shrink-0">Raw model probability (pKnow)</dt>
                          <dd className="font-mono text-slate-800 dark:text-slate-200">{rawPercent}%</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="shrink-0">Reliability weight</dt>
                          <dd className="font-mono text-slate-800 dark:text-slate-200">{Math.round(reliability * 100)}%</dd>
                        </div>
                        <p className="pt-1 leading-relaxed text-[0.7rem] text-slate-500 dark:text-slate-500">
                          The headline score blends this with how much you’ve practiced so sparse data doesn’t swing the
                          bar too far.
                        </p>
                      </dl>
                    </details>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
