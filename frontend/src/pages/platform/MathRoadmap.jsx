import React from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../components/Toast.jsx';
import { SUBJECTS, HOME_PATH } from '../../routes.js';
import { Badge, Card, CardHeader, OpenCalculatorLink } from '../../components/ui/index.js';

const HERO_BTN =
  'inline-flex items-center justify-center gap-2.5 rounded-xl px-6 py-3 text-base font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-slate-500 dark:focus:ring-offset-slate-950';

const OUTLINE_ACTION_BTN =
  'inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-slate-500 dark:focus:ring-offset-slate-950 border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900';

const SUBJECT_ICON = {
  'discrete-math': 'fa-cubes',
  'linear-algebra': 'fa-vector-square',
  'probability-statistics': 'fa-chart-line',
  algorithms: 'fa-diagram-project',
  'it-logic': 'fa-microchip',
};

const GUIDANCE_STEPS = [
  {
    icon: 'fa-flag-checkered',
    title: 'Start with foundation',
    body: 'Master Discrete Mathematics to build core skills in logic, sets, and structures.',
    accent: 'from-indigo-500 to-violet-600',
  },
  {
    icon: 'fa-compass',
    title: 'Choose your specialization',
    body: 'ML → Linear Algebra + Probability. Systems → Algorithms. Logic-heavy work → IT Logic.',
    accent: 'from-violet-500 to-fuchsia-600',
  },
  {
    icon: 'fa-dumbbell',
    title: 'Practice actively',
    body: 'Use calculators to reinforce concepts and test understanding quickly.',
    accent: 'from-sky-500 to-indigo-600',
  },
  {
    icon: 'fa-hammer',
    title: 'Build projects',
    body: 'Apply concepts to real problems in your chosen specialization.',
    accent: 'from-emerald-500 to-teal-600',
  },
];

function SubjectTrackCard({ subject, tier }) {
  const icon = SUBJECT_ICON[subject.slug] || 'fa-book';
  const isFoundation = tier === 'foundation';

  return (
    <div
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white dark:bg-slate-900 ${
        isFoundation
          ? 'border-indigo-200/80 dark:border-indigo-500/25'
          : 'border-emerald-200/70 dark:border-emerald-500/20'
      }`}
    >
      <div
        className={`h-1 w-full bg-gradient-to-r ${
          isFoundation ? 'from-indigo-500 via-violet-500 to-indigo-400' : 'from-emerald-500 via-teal-500 to-emerald-400'
        }`}
        aria-hidden
      />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md ${
              isFoundation
                ? 'bg-indigo-600 shadow-indigo-500/25 dark:bg-indigo-500'
                : 'bg-emerald-600 shadow-emerald-500/25 dark:bg-emerald-500'
            }`}
          >
            <i className={`fas ${icon}`} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">{subject.label}</p>
              <Badge tone="neutral">{isFoundation ? 'Foundation' : 'Specialized'}</Badge>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{subject.goal}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {subject.features?.calculator ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200">
              <i className={`fas fa-calculator ${isFoundation ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
              Calculator
            </span>
          ) : null}
          {subject.features?.roadmap ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200">
              <i className="fas fa-map text-sky-600 dark:text-sky-400" />
              Roadmap
            </span>
          ) : null}
        </div>

        <div className="mt-6 grid flex-1 gap-2 border-t border-slate-100 pt-5 dark:border-slate-800">
          {subject.calculatorPath ? <OpenCalculatorLink to={subject.calculatorPath} /> : null}
          {subject.features?.roadmap ? (
            <Link to={`/${subject.slug}/roadmap`} className={OUTLINE_ACTION_BTN}>
              <i className="fas fa-map" aria-hidden />
              View roadmap
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function MathRoadmap() {
  const { showSuccess } = useToast();

  function share() {
    if (navigator.share) {
      navigator.share({ title: 'Math Learning Roadmap', url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showSuccess('Link copied to clipboard!');
    }
  }

  const foundationSubjects = SUBJECTS.filter((s) => s.classification === 'foundation');
  const specializedSubjects = SUBJECTS.filter((s) => s.classification === 'specialized');

  return (
    <section className="min-h-screen bg-[var(--dmc-bg-page)] text-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-indigo-50 via-white to-violet-50 px-6 py-10 shadow-sm dark:border-slate-800 dark:from-indigo-950/40 dark:via-slate-900 dark:to-violet-950/35 sm:px-10 sm:py-12">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/10"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-violet-400/15 blur-3xl dark:bg-violet-500/10"
            aria-hidden
          />
          <div className="relative mx-auto max-w-3xl text-center">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-400">
              Platform roadmap
            </p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl md:text-5xl">
              Complete Math Learning Roadmap
            </h1>
            <p className="mt-5 text-base leading-relaxed text-slate-600 dark:text-slate-400">
              Build foundations first, then specialize by track. Jump straight into calculators when you need practice.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to={HOME_PATH}
                className={`${HERO_BTN} border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900`}
              >
                <i className="fas fa-arrow-left" aria-hidden />
                Back to home
              </Link>
              <button
                type="button"
                className={`${HERO_BTN} bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white`}
                onClick={share}
              >
                <i className="fas fa-share-nodes" aria-hidden />
                Share
              </button>
            </div>
          </div>
        </header>

        <section className="mt-10">
          <Card variant="elevated" padding="lg" className="overflow-hidden">
            <CardHeader title="Learning structure" subtitle="Two tiers: foundation, then specialization." />
            <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Start with the foundation tier (core math for CS). When you’re comfortable, add specialized domains based on
              your goals.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="relative rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/90 to-white p-5 dark:border-indigo-500/20 dark:from-indigo-950/40 dark:to-slate-900">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white dark:bg-indigo-500">
                    1
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Foundation</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Core structures &amp; reasoning for CS</p>
                  </div>
                </div>
              </div>
              <div className="relative rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 to-white p-5 dark:border-emerald-500/20 dark:from-emerald-950/35 dark:to-slate-900">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white dark:bg-emerald-500">
                    2
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Specialization</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Depth by career goal — ML, systems, logic</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 hidden justify-center sm:flex" aria-hidden>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500">
                <span className="h-px w-8 bg-gradient-to-r from-transparent to-slate-300 dark:to-slate-600" />
                <i className="fas fa-arrow-right text-indigo-500 dark:text-indigo-400" />
                <span className="h-px w-8 bg-gradient-to-l from-transparent to-slate-300 dark:to-slate-600" />
              </div>
            </div>
          </Card>
        </section>

        <section className="mt-10 space-y-8">
          <div>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 dark:bg-indigo-500">
                  <i className="fas fa-layer-group" aria-hidden />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">Foundation tier</h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Essential mathematics for Computer Science.</p>
                </div>
              </div>
              <Badge tone="success">Start here</Badge>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {foundationSubjects.map((subject) => (
                <SubjectTrackCard key={subject.slug} subject={subject} tier="foundation" />
              ))}
            </div>
          </div>

          <div>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 dark:bg-emerald-500">
                  <i className="fas fa-graduation-cap" aria-hidden />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">Specialized domains</h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Deepen your expertise in specific areas.</p>
                </div>
              </div>
              <Badge tone="warning">Pick by goals</Badge>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {specializedSubjects.map((subject) => (
                <SubjectTrackCard key={subject.slug} subject={subject} tier="specialized" />
              ))}
            </div>
          </div>

          <Card variant="elevated" padding="lg">
            <CardHeader title="Your learning path" subtitle="Practical guidance for sequencing." />
            <ol className="relative mt-8 space-y-0">
              {GUIDANCE_STEPS.map((step, idx) => (
                <li key={step.title} className="relative flex gap-4 pb-10 last:pb-0">
                  {idx < GUIDANCE_STEPS.length - 1 ? (
                    <div
                      className="absolute left-[1.15rem] top-10 bottom-0 w-px bg-gradient-to-b from-slate-200 via-slate-200 to-transparent dark:from-slate-700 dark:via-slate-700"
                      aria-hidden
                    />
                  ) : null}
                  <div className="relative z-[1] flex shrink-0 flex-col items-center">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-sm text-white shadow-md ${step.accent}`}
                    >
                      <i className={`fas ${step.icon}`} aria-hidden />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/50">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{step.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </section>
      </div>
    </section>
  );
}
