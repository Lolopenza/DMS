import React from 'react';
import { Card, CardHeader } from '../../components/ui/index.js';

export default function LegalPrivacy() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-950 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Legal</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Privacy Policy</h1>
          <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-400">
            How this educational platform handles user and interaction data.
          </p>
        </header>

        <div className="mt-10">
          <Card variant="elevated" padding="lg">
            <CardHeader title="Privacy summary" subtitle="Data processing and retention principles." />
            <div className="mt-6 space-y-4 text-sm leading-7 text-slate-700 dark:text-slate-300">
              <p>
                Account and learning-session data can be stored securely in the browser to provide continuity between visits
                and consistent user experience.
              </p>
              <p>
                This policy describes data processing principles, retention boundaries, and contact channels for privacy
                requests.
              </p>
              <p>We recommend avoiding sensitive personal data in educational free-text fields.</p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
