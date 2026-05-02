/**
 * SubjectRouter.jsx
 * 
 * Dynamically routes to subject-specific modules using lazy loading.
 * Replaces the hardcoded MODULE_COMPONENTS enum in App.jsx
 * 
 * Usage:
 *   <Route path="/:subject/:module" element={<SubjectRouter />} />
 *   
 * Parameters:
 *   - :subject — subject slug (e.g., 'discrete-math')
 *   - :module — module slug (e.g., 'combinatorics')
 */

import React, { Suspense, useEffect, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { isSubjectImplemented, loadSubjectModule } from './subjectRegistry.js';
import { markModuleProgress } from '../../../pages/platform/moduleProgress.js';

// Placeholder while module loads
function ModuleLoader() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6 lg:px-8" aria-label="Loading module">
      <div
        className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-950 dark:shadow-none"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 dark:bg-indigo-500">
            <i className="fas fa-spinner fa-spin" />
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-500">
              Loading module
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">Preparing interactive workspace…</h2>
          </div>
        </div>

        <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900">
          <div className="h-full w-2/5 animate-pulse rounded-full bg-indigo-600/70 dark:bg-indigo-500/60" />
        </div>
      </div>
    </div>
  );
}

function ModuleLoadError({ subject, moduleSlug, error }) {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6 lg:px-8" aria-label="Module load error">
      <div
        className="rounded-3xl border border-amber-200 bg-white p-8 shadow-sm shadow-slate-200/40 dark:border-amber-500/30 dark:bg-slate-950 dark:shadow-none"
        role="alert"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-sm shadow-amber-500/20">
              <i className="fas fa-triangle-exclamation" />
            </span>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">
                Unable to open interactive calculator
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Please go back to the subject module list and try again.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
          <span className="font-semibold">Details:</span> {error || 'Unknown loading error.'}
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          {subject && moduleSlug ? (
            <Link
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
              to={`/${subject}`}
            >
              <i className="fas fa-arrow-left" /> Back to subject modules
            </Link>
          ) : null}
          {subject ? (
            <Link
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
              to={`/${subject}`}
            >
              <i className="fas fa-layer-group" /> Back to subject modules
            </Link>
          ) : null}
          <Link
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            to="/tracks"
          >
            <i className="fas fa-compass" /> Open all tracks
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SubjectRouter() {
  const { subject, module: moduleSlug } = useParams();
  const [ModuleComponent, setModuleComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    markModuleProgress(subject, moduleSlug);
  }, [subject, moduleSlug]);

  useEffect(() => {
    async function loadModuleComponent() {
      try {
        setLoading(true);
        setError(null);

        if (!isSubjectImplemented(subject)) {
          setError(`Subject not implemented: ${subject}`);
          setLoading(false);
          return;
        }

        const component = await loadSubjectModule(subject, moduleSlug);
        if (!component) {
          setError(`Module not found: ${moduleSlug}`);
          setLoading(false);
          return;
        }

        setModuleComponent(() => component);
        setLoading(false);
      } catch (err) {
        console.error('SubjectRouter error:', err);
        setError(`Failed to load module: ${err?.message || 'Unknown error'}`);
        setLoading(false);
      }
    }

    loadModuleComponent();
  }, [subject, moduleSlug]);

  if (error) {
    return <ModuleLoadError subject={subject} moduleSlug={moduleSlug} error={error} />;
  }

  if (loading || !ModuleComponent) {
    return <ModuleLoader />;
  }

  return <ModuleComponent />;
}
