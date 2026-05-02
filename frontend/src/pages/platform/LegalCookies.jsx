import React from 'react';
import { Card, CardHeader } from '../../components/ui/index.js';

export default function LegalCookies() {
  return (
    <section className="min-h-screen bg-[var(--dmc-bg-page)] text-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Legal</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Cookie Policy</h1>
          <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-400">
            Browser storage and technical cookies used by Math Lab Platform.
          </p>
        </header>

        <div className="mt-10">
          <Card variant="elevated" padding="lg">
            <CardHeader title="Cookie summary" subtitle="Technical storage and platform continuity." />
            <div className="mt-6 space-y-4 text-sm leading-7 text-slate-700 dark:text-slate-300">
              <p>
                Essential browser storage is used for technical platform behavior such as theme preference, chatbot widget
                state, and account session continuity.
              </p>
              <p>
                No advertising cookies are introduced in this wave. Additional analytics or tracking categories, if added,
                will be documented here before release.
              </p>
              <p>You can clear local data at any time using browser settings.</p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
