import React from 'react';
import { Card, CardHeader } from '../../components/ui/index.js';

export default function LegalTerms() {
  return (
    <section className="min-h-screen bg-[var(--dmc-bg-page)] text-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Legal</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Terms of Use</h1>
          <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-400">
            Current platform usage terms for the Math Lab environment.
          </p>
        </header>

        <div className="mt-10">
          <Card variant="elevated" padding="lg">
            <CardHeader title="Terms summary" subtitle="High-level terms for platform usage." />
            <div className="mt-6 space-y-4 text-sm leading-7 text-slate-700 dark:text-slate-300">
              <p>
                Math Lab Platform provides educational content, calculators, and roadmap workflows for study purposes.
                Users must not misuse the service for harmful, illegal, or abusive activities.
              </p>
              <p>
                The platform is continuously improved to keep content quality, reliability, and navigation consistency at a
                production level.
              </p>
              <p>
                By using this environment, you agree that educational outputs are supportive materials and should be
                validated for critical assessments.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
