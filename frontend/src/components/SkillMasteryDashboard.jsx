import React, { useEffect, useMemo, useState } from 'react';
import { getUserSkills } from '../api.js';

function clampPercent(value) {
  const normalized = Number.isFinite(value) ? value : 0;
  return Math.max(0, Math.min(100, Math.round(normalized * 100)));
}

function masteryMeta(percent) {
  if (percent < 40) {
    return {
      label: 'Beginner',
      emoji: '🌱',
      badgeClass: 'skill-mastery-badge skill-mastery-badge-beginner bg-emerald-50 text-emerald-700 border-emerald-200',
      barClass: 'bg-emerald-500',
    };
  }
  if (percent <= 70) {
    return {
      label: 'Learning',
      emoji: '📈',
      badgeClass: 'skill-mastery-badge skill-mastery-badge-learning bg-indigo-50 text-indigo-700 border-indigo-200',
      barClass: 'bg-indigo-500',
    };
  }
  return {
    label: 'Master',
    emoji: '🏆',
    badgeClass: 'skill-mastery-badge skill-mastery-badge-master bg-amber-50 text-amber-700 border-amber-200',
    barClass: 'bg-amber-500',
  };
}

function confidenceMeta(totalAttempts) {
  const n = Number.isFinite(totalAttempts) ? totalAttempts : 0;
  if (n < 3) return { label: 'Low confidence', cls: 'text-amber-700 bg-amber-50 border-amber-200' };
  if (n < 8) return { label: 'Medium confidence', cls: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
  return { label: 'High confidence', cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
}

export default function SkillMasteryDashboard() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function loadSkills() {
      setLoading(true);
      setError('');
      try {
        const data = await getUserSkills();
        if (!active) return;
        setSkills(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!active) return;
        setError(err?.message || 'Failed to load mastery data');
        setSkills([]);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadSkills();
    return () => {
      active = false;
    };
  }, []);

  const overallPercent = useMemo(() => {
    if (!skills.length) return 0;
    const weighted = skills.reduce((acc, item) => {
      const attempts = Math.max(0, Number(item?.totalAttempts) || 0);
      const reliability = Math.min(1, attempts / 8); // damp noisy values for small N
      const baseline = 0.25; // BKT prior
      const pKnow = Number(item?.pKnow) || 0;
      const adjusted = baseline + (pKnow - baseline) * reliability;
      return {
        valueSum: acc.valueSum + adjusted * Math.max(1, attempts),
        weightSum: acc.weightSum + Math.max(1, attempts),
      };
    }, { valueSum: 0, weightSum: 0 });
    return clampPercent(weighted.weightSum ? (weighted.valueSum / weighted.weightSum) : 0);
  }, [skills]);

  const overall = masteryMeta(overallPercent);

  return (
    <section className="skill-mastery mb-8">
      <div className="dmc-card">
        <div className="dmc-card-header flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="dmc-title text-xl font-semibold">Skill Mastery Overview</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="dmc-subtitle text-sm">Bayesian Knowledge Tracing across your math topics</p>
              <span
                className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-slate-300 text-slate-500 text-xs font-semibold cursor-help"
                title="Adjusted mastery is reliability-aware: with few attempts, the score stays closer to the BKT prior (0.25). As attempts grow, it approaches raw pKnow."
                aria-label="How adjusted mastery is calculated"
              >
                i
              </span>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dmc-surface-soft">
            <span className="text-sm">{overall.emoji}</span>
            <span className="dmc-subtitle text-xs font-medium">Overall Avg Mastery</span>
            <span className="dmc-title text-sm font-bold">{overallPercent}%</span>
          </div>
        </div>

        <div className="dmc-card-body">
          {loading && (
            <div className="grid gap-3">
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="rounded-xl border border-slate-100 p-4 animate-pulse">
                  <div className="h-4 w-44 rounded bg-slate-200 mb-3" />
                  <div className="h-2.5 w-full rounded bg-slate-200 mb-2" />
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
            <div className="rounded-xl border border-slate-200 dmc-surface-soft px-4 py-6 text-center">
              <p className="dmc-title font-medium">No mastery data yet</p>
              <p className="dmc-subtitle text-sm mt-1">Solve a few practice problems to build your skill profile.</p>
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
                const confidence = confidenceMeta(attempts);
                const label = skill?.topicName || skill?.topicSlug || 'Unknown topic';
                const rawPercent = clampPercent(pKnow);
                const accuracy = attempts > 0 ? Math.round((correctAttempts / attempts) * 100) : 0;
                return (
                  <article key={skill?.topicSlug || label} className="rounded-xl border border-slate-200 dmc-surface-soft p-4">
                    <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                      <h3 className="dmc-title text-sm font-semibold">{label}</h3>
                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium ${meta.badgeClass}`}>
                          <span>{meta.emoji}</span>
                          {meta.label}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full border text-xs font-medium ${confidence.cls}`}>
                          {confidence.label}
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${meta.barClass} transition-all duration-500`}
                        style={{ width: `${percent}%` }}
                        role="progressbar"
                        aria-valuenow={percent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${label} mastery`}
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs dmc-subtitle">
                      <span>Mastery (adjusted)</span>
                      <span className="dmc-title font-semibold">{percent}%</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs dmc-subtitle">
                      <span title="Model-only estimate of how stable your knowledge is, before reliability adjustment.">
                        Base knowledge estimate
                      </span>
                      <span className="dmc-title font-semibold">{rawPercent}%</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs dmc-subtitle">
                      <span>Attempts / Accuracy</span>
                      <span className="dmc-title font-semibold">{attempts} / {accuracy}%</span>
                    </div>
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
