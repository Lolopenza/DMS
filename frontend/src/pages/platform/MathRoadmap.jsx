import React from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../components/Toast.jsx';
import { SUBJECTS, HOME_PATH } from '../../routes.js';
import { Badge, Button, Card, CardHeader } from '../../components/ui/index.js';

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

  const foundationSubjects = SUBJECTS.filter(s => s.classification === 'foundation');
  const specializedSubjects = SUBJECTS.filter(s => s.classification === 'specialized');

  return (
    <section className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-950 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Platform roadmap
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Complete Math Learning Roadmap</h1>
          <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-400">
            Build foundations first, then specialize by track. Jump straight into calculators when you need practice.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to={HOME_PATH}>
              <Button size="lg" variant="outline">
                <i className="fas fa-arrow-left" /> Back to home
              </Button>
            </Link>
            <Button size="lg" variant="secondary" onClick={share}>
              <i className="fas fa-share-nodes" /> Share
            </Button>
          </div>
        </header>

        <section className="mt-10">
          <Card variant="elevated" padding="lg">
            <CardHeader title="Learning structure" subtitle="Two tiers: foundation, then specialization." />
            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Start with the foundation tier (core math for CS). When you’re comfortable, add specialized domains based on your goals.
            </p>
          </Card>
        </section>

        <section className="mt-10 space-y-5">
          <Card variant="elevated" padding="lg">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  <i className="fas fa-layer-group mr-2 text-indigo-600 dark:text-indigo-400" />
                  Foundation tier
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Essential mathematics for Computer Science.</p>
              </div>
              <Badge tone="success">Start here</Badge>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {foundationSubjects.map((subject) => (
                <Card key={subject.slug} variant="outline" padding="lg" className="h-full">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{subject.label}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">{subject.goal}</p>
                    </div>
                    <Badge tone="neutral">Foundation</Badge>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {subject.features?.calculator ? (
                      <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                        <i className="fas fa-calculator text-indigo-600 dark:text-indigo-400" /> Calculator
                      </span>
                    ) : null}
                    {subject.features?.roadmap ? (
                      <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                        <i className="fas fa-map text-indigo-600 dark:text-indigo-400" /> Roadmap
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-6 grid gap-2">
                    {subject.calculatorPath ? (
                      <Link to={subject.calculatorPath}>
                        <Button className="w-full">
                          <i className="fas fa-calculator" /> Open calculator
                        </Button>
                      </Link>
                    ) : null}
                    {subject.features?.roadmap ? (
                      <Link to={`/${subject.slug}/roadmap`}>
                        <Button className="w-full" variant="outline">
                          <i className="fas fa-map" /> View roadmap
                        </Button>
                      </Link>
                    ) : null}
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          <Card variant="elevated" padding="lg">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  <i className="fas fa-graduation-cap mr-2 text-indigo-600 dark:text-indigo-400" />
                  Specialized domains
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Deepen your expertise in specific areas.</p>
              </div>
              <Badge tone="warning">Pick by goals</Badge>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {specializedSubjects.map((subject) => (
                <Card key={subject.slug} variant="outline" padding="lg" className="h-full">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{subject.label}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">{subject.goal}</p>
                    </div>
                    <Badge tone="neutral">Specialized</Badge>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {subject.features?.calculator ? (
                      <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                        <i className="fas fa-calculator text-indigo-600 dark:text-indigo-400" /> Calculator
                      </span>
                    ) : null}
                    {subject.features?.roadmap ? (
                      <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                        <i className="fas fa-map text-indigo-600 dark:text-indigo-400" /> Roadmap
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-6 grid gap-2">
                    {subject.calculatorPath ? (
                      <Link to={subject.calculatorPath}>
                        <Button className="w-full">
                          <i className="fas fa-calculator" /> Open calculator
                        </Button>
                      </Link>
                    ) : null}
                    {subject.features?.roadmap ? (
                      <Link to={`/${subject.slug}/roadmap`}>
                        <Button className="w-full" variant="outline">
                          <i className="fas fa-map" /> View roadmap
                        </Button>
                      </Link>
                    ) : null}
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          <Card variant="elevated" padding="lg">
            <CardHeader title="Your learning path" subtitle="Practical guidance for sequencing." />
            <ul className="mt-6 space-y-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
              <li className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                <span className="font-semibold text-slate-900 dark:text-slate-100">Start with foundation:</span>{' '}
                Master Discrete Mathematics to build core skills in logic, sets, and structures.
              </li>
              <li className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                <span className="font-semibold text-slate-900 dark:text-slate-100">Choose your specialization:</span>{' '}
                ML → Linear Algebra + Probability. Systems → Algorithms. Logic-heavy work → IT Logic.
              </li>
              <li className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                <span className="font-semibold text-slate-900 dark:text-slate-100">Practice actively:</span>{' '}
                Use calculators to reinforce concepts and test understanding quickly.
              </li>
              <li className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                <span className="font-semibold text-slate-900 dark:text-slate-100">Build projects:</span>{' '}
                Apply concepts to real problems in your chosen specialization.
              </li>
            </ul>
          </Card>
        </section>
      </div>
    </section>
  );
}
