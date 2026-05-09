import React from 'react';
import { Link } from 'react-router-dom';
import { USER_SANDBOX_PATH } from '../routes.js';
import { Card } from './ui/index.js';

export default function JupyterLiteSandboxCard() {
  return (
    <Card variant="elevated" padding="lg" className="mt-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="relative flex-1 overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6 dark:border-slate-700/80 dark:from-amber-950/35 dark:via-slate-900 dark:to-orange-950/30">
          <div
            className="pointer-events-none absolute -left-12 bottom-0 h-32 w-32 rounded-full bg-amber-400/15 blur-2xl dark:bg-amber-400/10"
            aria-hidden
          />
          <div className="relative flex gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-lg text-white shadow-lg shadow-amber-500/25 dark:bg-amber-600 dark:shadow-amber-600/20">
              <i className="fas fa-microchip" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">
                Beta · in-browser Python
              </p>
              <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Sandbox</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Runs Python in your browser (JupyterLite + Pyodide). Useful for quick experiments without leaving the
                portal.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-4">
          <div className="rounded-2xl border border-amber-200/90 bg-amber-50/80 px-4 py-3 text-xs leading-relaxed text-amber-950 dark:border-amber-500/25 dark:bg-amber-950/35 dark:text-amber-100/95">
            <p className="font-semibold text-amber-900 dark:text-amber-200">Beta limitations</p>
            <p className="mt-1 text-amber-900/90 dark:text-amber-100/90">
              First launch may take 10–15 seconds; heavy ML libraries may be unavailable. This is a public in-browser
              runtime, opened inside the portal for convenience.
            </p>
          </div>
          <Link
            to={USER_SANDBOX_PATH}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-white dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 dark:focus:ring-slate-500 dark:focus:ring-offset-slate-950 sm:w-auto"
          >
            <i className="fas fa-external-link-alt" aria-hidden />
            Open Sandbox in Portal
          </Link>
        </div>
      </div>
    </Card>
  );
}
