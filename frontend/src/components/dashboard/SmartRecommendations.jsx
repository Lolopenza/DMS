import React from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { getLearningRecommendations } from '../../api.js';
import { getCatalogSubject } from '../../catalog/subjectCatalog.js';
import { Card, CardHeader, Button } from '../ui/index.js';

function subjectLabel(slug) {
  return getCatalogSubject(slug)?.label || slug;
}

function difficultyBadge(level) {
  const l = String(level || '').toLowerCase();
  if (l === 'beginner')
    return 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100';
  if (l === 'advanced')
    return 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100';
  return 'border-indigo-200 bg-indigo-50 text-indigo-900 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-100';
}

export default function SmartRecommendations() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await getLearningRecommendations();
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || 'Could not load recommendations');
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card variant="elevated" padding="lg" className="mb-8 border-indigo-200/60 dark:border-indigo-900/40">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <CardHeader
          title={
            <span className="inline-flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-300" aria-hidden>
                ✨
              </span>
              AI recommendations
            </span>
          }
          subtitle="Prioritizes your weak spots (low mastery + low accuracy), then fresh catalog modules. Each card explains why it was picked."
        />
      </div>

      {loading && (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
              <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="mt-4 h-16 rounded bg-slate-100 dark:bg-slate-900" />
              <div className="mt-4 h-9 rounded bg-slate-100 dark:bg-slate-900" />
            </div>
          ))}
        </div>
      )}

      {!loading && error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-100">
          {error}
        </div>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
          Keep practicing — recommendations appear once the system has enough signal to pick strong next steps.
        </p>
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {items.map((rec) => {
            const href = `/${rec.subject}/${rec.moduleSlug}`;
            return (
              <div
                key={`${rec.subject}-${rec.moduleSlug}`}
                className="group flex flex-col rounded-2xl border border-indigo-100 bg-gradient-to-b from-white to-indigo-50/40 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-indigo-900/50 dark:from-slate-950 dark:to-indigo-950/20"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    {subjectLabel(rec.subject)}
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${difficultyBadge(rec.difficultyLevel)}`}
                  >
                    {rec.difficultyLevel || 'General'}
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">{rec.moduleName}</h3>
                <div className="mt-2 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300 [&_p]:mb-2 [&_p:last-child]:mb-0">
                  <ReactMarkdown>{rec.reason || ''}</ReactMarkdown>
                </div>
                <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                  ~{rec.estimatedMinutes} min session
                  {rec.prerequisitesMet === false ? ' · prerequisites building' : ''}
                </p>
                <Link to={href} className="mt-4">
                  <Button className="w-full" variant="primary">
                    Start learning
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      ) : null}
    </Card>
  );
}
