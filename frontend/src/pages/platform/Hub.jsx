import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TRACKS_PATH, getSubjectCatalog, getTrackCardBlurb } from '../../routes.js';
import { Badge, Button, Card, CardHeader } from '../../components/ui/index.js';

const VALUE_PILLARS = [
  {
    icon: 'fa-graduation-cap',
    title: 'Structured learning path',
    text: 'Move from fundamentals to practical exercises through topic-aligned track navigation.',
  },
  {
    icon: 'fa-robot',
    title: 'Math Lab AI assistant',
    text: 'Get contextual hints and explanations directly inside modules and learning scenarios.',
  },
  {
    icon: 'fa-chart-line',
    title: 'Progress-oriented workflow',
    text: 'Combine calculator practice, roadmap milestones, and account-driven continuation points.',
  },
];

const TRUST_METRICS = [
  { value: '7+', label: 'Discrete intro modules available now' },
  { value: '5', label: 'Active learning tracks' },
  { value: '100+', label: 'Automated checks in math-engine baseline' },
];

const FAQ_ITEMS = [
  {
    question: 'What is already available today?',
    answer: 'All five core tracks are active with subject-first routing and calculator workspaces.',
  },
  {
    question: 'Is account/auth fully backend-connected?',
    answer: 'Account, profile, and settings flows are available with secure session continuity for learning workflows.',
  },
  {
    question: 'Can we add new subjects without major rewrites?',
    answer: 'Yes. The platform uses route metadata and reusable templates to scale tracks incrementally.',
  },
];

export default function Hub() {
  const tracks = getSubjectCatalog();
  const activeTrack = tracks.find((track) => track.status === 'active' && track.subjectPath);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const trackCards = useMemo(
    () =>
      tracks.map((track) => ({
        ...track,
        href: track.subjectPath || `/${track.slug}`,
      })),
    [tracks],
  );

  return (
    <section className="min-h-screen bg-[var(--dmc-bg-page)] text-[var(--dmc-text-primary)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--dmc-text-subtle)]">
            Math Lab Platform
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--dmc-text-primary)] sm:text-5xl">
            Choose a track. Practice instantly.
          </h1>
          <p className="mt-5 text-base leading-7 text-[var(--dmc-text-muted)]">
            Pick a subject track, then continue with calculator workspaces, theory, and video modes.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to={TRACKS_PATH}>
              <Button size="lg">
                <i className="fas fa-layer-group" /> Explore tracks
              </Button>
            </Link>
            {activeTrack ? (
              <Link to={activeTrack.subjectPath}>
                <Button size="lg" variant="outline">
                  <i className="fas fa-compass" /> Open active track
                </Button>
              </Link>
            ) : null}
          </div>
        </header>

        <section className="mt-10">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {trackCards.map((track) => (
              <Card key={track.slug} variant="elevated" padding="lg" className="h-full">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                      {track.label}
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      {getTrackCardBlurb(track)}
                    </p>
                  </div>
                  <Badge tone={track.status === 'active' ? 'success' : 'neutral'}>
                    {track.status || 'available'}
                  </Badge>
                </div>
                <div className="mt-6">
                  <Link to={track.href}>
                    <Button variant={track.status === 'active' ? 'primary' : 'secondary'} className="w-full">
                      Open track
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card variant="elevated" padding="lg" className="lg:col-span-2">
              <CardHeader
                title="Why this platform"
                subtitle="Commercial-grade information architecture for learning workflows."
              />
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {VALUE_PILLARS.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      <i className={`fas ${item.icon} mr-2 text-indigo-600 dark:text-indigo-400`} />
                      {item.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{item.text}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card variant="elevated" padding="lg">
              <CardHeader title="Platform snapshot" subtitle="Current baseline and readiness." />
              <div className="mt-6 space-y-3">
                {TRUST_METRICS.map((metric) => (
                  <div key={metric.label} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{metric.value}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{metric.label}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <section className="mt-14">
          <Card variant="elevated" padding="lg">
            <CardHeader title="FAQ" subtitle="Short answers on scope and current capabilities." />
            <div className="mt-6 space-y-3">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={item.question} className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                    <button
                      type="button"
                      className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaqIndex((prev) => (prev === idx ? -1 : idx))}
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-sm font-bold text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.question}</span>
                      </div>
                      <i className={`fas fa-chevron-down mt-1 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen ? (
                      <div className="px-5 pb-5 text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {item.answer}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </Card>
        </section>
      </div>
    </section>
  );
}
