import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, Button } from '../ui/index.js';

const STARTERS = [
  {
    subject: 'linear-algebra',
    slug: 'matrices',
    title: 'Matrices',
    blurb: 'Core matrix ops — foundation for ML & graphics.',
    icon: 'fa-border-all',
  },
  {
    subject: 'discrete-math',
    slug: 'set-theory',
    title: 'Set Theory',
    blurb: 'Sets, relations, and logic prep for CS proofs.',
    icon: 'fa-object-group',
  },
  {
    subject: 'algorithms',
    slug: 'sorting',
    title: 'Sorting',
    blurb: 'Classic algorithms with complexity intuition.',
    icon: 'fa-sort',
  },
];

export default function OnboardingWizard() {
  return (
    <Card variant="elevated" padding="lg" className="mb-8 border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 to-white dark:border-emerald-900/40 dark:from-emerald-950/30 dark:to-slate-950">
      <CardHeader
        title="Start your math foundation"
        subtitle="Complete a few calculator modules — your Bayesian mastery profile activates automatically from practice attempts."
      />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {STARTERS.map((m) => (
          <div
            key={`${m.subject}/${m.slug}`}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm dark:bg-emerald-500">
                <i className={`fas ${m.icon}`} />
              </span>
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{m.title}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{m.blurb}</p>
              </div>
            </div>
            <Link to={`/${m.subject}/${m.slug}`} className="mt-4">
              <Button variant="secondary" className="w-full">
                Open module
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </Card>
  );
}
