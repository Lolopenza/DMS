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
    const sum = skills.reduce((acc, item) => acc + (Number(item?.pKnow) || 0), 0);
    return clampPercent(sum / skills.length);
  }, [skills]);

  const overall = masteryMeta(overallPercent);

  return (
    <section className="skill-mastery mb-8">
      <div className="dmc-card">
        <div className="dmc-card-header flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="dmc-title text-xl font-semibold">Skill Mastery Overview</h2>
            <p className="dmc-subtitle text-sm">Bayesian Knowledge Tracing across your math topics</p>
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
                const percent = clampPercent(Number(skill?.pKnow) || 0);
                const meta = masteryMeta(percent);
                const label = skill?.topicName || skill?.topicSlug || 'Unknown topic';
                return (
                  <article key={skill?.topicSlug || label} className="rounded-xl border border-slate-200 dmc-surface-soft p-4">
                    <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                      <h3 className="dmc-title text-sm font-semibold">{label}</h3>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium ${meta.badgeClass}`}>
                        <span>{meta.emoji}</span>
                        {meta.label}
                      </span>
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
                      <span>Mastery</span>
                      <span className="dmc-title font-semibold">{percent}%</span>
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
