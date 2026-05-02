import React from 'react';
import { Card, CardHeader } from '../../components/ui/index.js';

const JUPYTERLITE_EMBED_URL = 'https://jupyterlite.github.io/demo/lab/index.html';

export default function Sandbox() {
  return (
    <section className="min-h-screen bg-[var(--dmc-bg-page)] text-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Labs</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Sandbox (Beta)</h1>
          <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-400">
            JupyterLite runs inside this page. First load may take 10–15 seconds.
          </p>
        </header>

        <div className="mt-10">
          <Card variant="elevated" padding="lg">
            <CardHeader title="JupyterLite workspace" subtitle="Browser-based notebook environment." />
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
              Beta limitations: heavy ML packages may be unavailable in browser mode.
            </div>
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
              <iframe
                title="JupyterLite Sandbox"
                src={JUPYTERLITE_EMBED_URL}
                className="h-[75vh] w-full"
                loading="lazy"
              />
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
