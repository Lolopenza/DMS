import React from 'react';

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
    <div className="dmc-card mt-6">
      <div className="dmc-card-header flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-semibold dmc-title">Export to Colab</h3>
      </div>
      <div className="dmc-card-body space-y-3">
        <p className="text-sm dmc-subtitle">
          Export your learning data and analyze your own progress: topic accuracy, solve time patterns,
          error categories, and simple ML baselines.
        </p>
        <div className="rounded-lg border border-slate-200 dmc-surface-soft px-3 py-2 text-xs dmc-subtitle">
          <strong className="dmc-title">What Colab Starter does:</strong> it gives you a ready notebook with
          pre-built cells for loading CSV, quick charts, and starter ML examples, so you do not start from an empty file.
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <label htmlFor="export-window" className="text-sm dmc-subtitle">Window</label>
          <select
            id="export-window"
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800"
            value={windowDays}
            onChange={(e) => setWindowDays(Number(e.target.value))}
          >
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
          </select>
        </div>
        <label htmlFor="colab-ai-lesson" className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 dmc-surface-soft px-3 py-2">
          <input
            id="colab-ai-lesson"
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-400"
            checked={Boolean(aiLessonMode)}
            onChange={(e) => setAiLessonMode(e.target.checked)}
          />
          <span className="min-w-0">
            <span className="block text-sm font-medium dmc-title">Generate with AI Lesson Mode</span>
            <span className="mt-0.5 block text-xs dmc-subtitle">
              When on, the notebook includes an extra tutor section (metrics, pitfalls, discrete math → ML) generated from your summary.
              Turn off for a slimmer starter without calling the AI.
            </span>
          </span>
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          <button type="button" className="dmc-button-secondary" onClick={onDownloadCsv}>
            Download CSV
          </button>
          <button type="button" className="dmc-button-primary" onClick={onDownloadNotebook} disabled={exporting}>
            {exporting ? 'Preparing notebook...' : 'Explore in Google Colab'}
          </button>
        </div>
        <div className="rounded-lg border border-slate-200 dmc-surface-soft px-3 py-2 text-xs dmc-subtitle">
          Privacy contract: this flow is CSV-first. We do not include internal API keys or your auth token in notebook files.
        </div>
        {exportError ? (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">{exportError}</div>
        ) : null}
        {exportDone ? (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 text-sm">
            Notebook downloaded. Open{' '}
            <a href="https://colab.research.google.com" target="_blank" rel="noreferrer" className="underline">
              colab.research.google.com
            </a>{' '}
            and use Upload notebook.
          </div>
        ) : null}
      </div>
    </div>
  );
}
