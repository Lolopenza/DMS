import React from 'react';
import { Button, Card } from './ui/index.js';

const WINDOW_OPTIONS = [7, 30, 90];

const FEATURE_CHIPS = [
  { icon: 'fa-bullseye', label: 'Topic accuracy' },
  { icon: 'fa-stopwatch', label: 'Solve time patterns' },
  { icon: 'fa-triangle-exclamation', label: 'Error categories' },
  { icon: 'fa-brain', label: 'ML baselines' },
];

export default function ColabExportCard({
  windowDays,
  setWindowDays,
  aiLessonMode,
  setAiLessonMode,
  onDownloadCsv,
  onDownloadNotebook,
  exporting,
  exportError,
  exportDone,
}) {
  return (
    <Card variant="elevated" padding="lg" className="mt-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
        <div className="relative flex-1 overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-6 dark:border-slate-700/80 dark:from-indigo-950/50 dark:via-slate-900 dark:to-violet-950/40">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-indigo-400/20 blur-2xl dark:bg-indigo-400/10"
            aria-hidden
          />
          <div className="relative flex gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-lg text-white shadow-lg shadow-indigo-600/25 dark:bg-indigo-500 dark:shadow-indigo-500/20">
              <i className="fas fa-flask" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                Self-service analytics
              </p>
              <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                Export to Colab
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Export your learning data and analyze your own progress: topic accuracy, solve time patterns,
                error categories, and simple ML baselines.
              </p>
            </div>
          </div>
          <div className="relative mt-5 flex flex-wrap gap-2">
            {FEATURE_CHIPS.map((c) => (
              <span
                key={c.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-xs font-medium text-slate-700 backdrop-blur-sm dark:border-slate-600/60 dark:bg-slate-900/50 dark:text-slate-200"
              >
                <i className={`fas ${c.icon} text-indigo-500 dark:text-indigo-400`} aria-hidden />
                {c.label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/50">
          <div className="border-l-4 border-indigo-500 pl-4 dark:border-indigo-400">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">What the Colab Starter is</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              A ready notebook with pre-built cells for loading your CSV, quick charts, and small ML baselines — so you
              don’t start from a blank page.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Time window</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Data included in the CSV and starter notebook.</p>
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Export time window">
            {WINDOW_OPTIONS.map((d) => {
              const active = windowDays === d;
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setWindowDays(d)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                    active
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 dark:bg-indigo-500'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {d} days
                </button>
              );
            })}
          </div>
        </div>

        <label
          htmlFor="colab-ai-lesson"
          className={`flex cursor-pointer gap-4 rounded-2xl border p-4 transition-colors ${
            aiLessonMode
              ? 'border-emerald-300/80 bg-emerald-50/60 ring-1 ring-emerald-200/80 dark:border-emerald-500/40 dark:bg-emerald-950/30 dark:ring-emerald-500/20'
              : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-slate-700'
          }`}
        >
          <input
            id="colab-ai-lesson"
            type="checkbox"
            className="mt-1 h-4 w-4 shrink-0 rounded border-slate-400 text-indigo-600 focus:ring-indigo-500 dark:border-slate-500 dark:bg-slate-900"
            checked={Boolean(aiLessonMode)}
            onChange={(e) => setAiLessonMode(e.target.checked)}
          />
          <span className="min-w-0">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <i className="fas fa-wand-magic-sparkles text-emerald-600 dark:text-emerald-400" aria-hidden />
              Generate with AI Lesson Mode
            </span>
            <span className="mt-1 block text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              When enabled, we add a short tutor section (metrics, pitfalls, discrete math → ML) generated from your
              stats. Turn it off for a slimmer starter without an extra AI call.
            </span>
          </span>
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onDownloadCsv} icon={<i className="fas fa-file-csv" />}>
            Download CSV
          </Button>
          <Button
            type="button"
            variant="primary"
            className="w-full sm:w-auto"
            onClick={onDownloadNotebook}
            loading={exporting}
            loadingLabel="Preparing notebook..."
            icon={!exporting ? <i className="fab fa-google" /> : null}
          >
            Explore in Google Colab
          </Button>
        </div>

        <div className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
          <i className="fas fa-shield-halved mt-0.5 shrink-0 text-indigo-500 dark:text-indigo-400" aria-hidden />
          <p>
            <span className="font-semibold text-slate-800 dark:text-slate-200">Privacy note:</span> this flow is
            CSV-first. Notebook files never include internal API keys or your auth tokens.
          </p>
        </div>

        {exportError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-200">
            {exportError}
          </div>
        ) : null}
        {exportDone ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-950/50 dark:text-emerald-100">
            Notebook downloaded. Open{' '}
            <a
              href="https://colab.research.google.com"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-emerald-700 underline decoration-emerald-400/80 underline-offset-2 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
            >
              colab.research.google.com
            </a>{' '}
            and use Upload notebook.
          </div>
        ) : null}
      </div>
    </Card>
  );
}
