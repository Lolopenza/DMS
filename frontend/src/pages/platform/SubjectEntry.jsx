import React, { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { TRACKS_PATH, buildSectionsForSubject, getSubjectCatalog } from '../../routes.js';
import { Badge, Button, Card, CardHeader } from '../../components/ui/index.js';

function formatTitle(track) {
  return `${track.label} Workspace`;
}

export default function SubjectEntry() {
  const { subject } = useParams();
  const tracks = getSubjectCatalog();
  const track = tracks.find((item) => item.slug === subject);
  const [scopeFilter, setScopeFilter] = useState('all');

  if (!track) {
    return <Navigate to={TRACKS_PATH} replace />;
  }

  const sections = buildSectionsForSubject(subject);

  const filteredSections = useMemo(() => {
    if (scopeFilter === 'all') return sections;
    return sections.filter((section) => section.scope === scopeFilter);
  }, [sections, scopeFilter]);

  const scopeTitle = track.classification === 'foundation' ? 'Foundation Scope' : 'Deep-Dive Scope';
  const scopeDescription = track.classification === 'foundation'
    ? 'This track introduces core objects and basic reasoning patterns. Use specialized tracks for advanced calculators and formal methods.'
    : 'This track focuses on advanced engineering workflows and deeper algorithmic or formal tooling built on top of foundations.';

  const filterOptions = [
    { key: 'all', label: `All (${sections.length})` },
    { key: 'intro', label: `Intro (${sections.filter((s) => s.scope === 'intro').length})` },
    { key: 'deep-dive', label: `Deep Dive (${sections.filter((s) => s.scope === 'deep-dive').length})` },
  ];

  return (
    <section className="min-h-screen bg-[var(--dmc-bg-page)] text-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400" aria-label="Breadcrumb">
          <Link to="/tracks" className="hover:text-slate-900 dark:hover:text-slate-100">Tracks</Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-200">{track.label}</span>
        </nav>

        <header className="mb-8 max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Track workspace
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-50 sm:text-4xl">
            {formatTitle(track)}
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
            Choose a topic to open the full workspace: theory, video, and interactive practice in one place.
          </p>
        </header>

        <Card variant="elevated" padding="lg" className="mb-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 dark:bg-indigo-500">
                <i className="fas fa-compass-drafting" aria-hidden />
              </span>
              <div>
                <CardHeader title={scopeTitle} subtitle={track.goal} />
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{scopeDescription}</p>
              </div>
            </div>
            <Badge variant={track.classification === 'foundation' ? 'indigo' : 'emerald'} className="w-fit">
              {track.classification === 'foundation' ? 'Foundation track' : 'Specialized track'}
            </Badge>
          </div>
        </Card>

        <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="Module scope filters">
          {filterOptions.map((option) => (
            <Button
              key={option.key}
              type="button"
              variant={scopeFilter === option.key ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setScopeFilter(option.key)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        <section aria-label="Module catalog">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSections.map(({ slug, icon, label, desc, scope }) => (
              <Card key={slug} variant="elevated" padding="lg" className="flex flex-col">
                <div className="flex items-start justify-between gap-4">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-200 dark:ring-indigo-500/20">
                    <i className={`fas ${icon}`} />
                  </span>
                  {scope ? (
                    <Badge variant={scope === 'intro' ? 'indigo' : 'emerald'}>
                      {scope === 'intro' ? 'Intro' : 'Deep Dive'}
                    </Badge>
                  ) : null}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-slate-100">{label}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{desc}</p>
                <div className="mt-6">
                  <Link to={`/${subject}/${slug}`}>
                    <Button className="w-full">Open</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-semibold text-slate-900 dark:text-slate-100">Need another subject?</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Go back to tracks and choose a different area.</p>
          </div>
          <Link to={TRACKS_PATH}>
            <Button variant="outline">
              <i className="fas fa-arrow-left" /> Back to tracks
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
