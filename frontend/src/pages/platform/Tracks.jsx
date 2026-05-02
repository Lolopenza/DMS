import React from 'react';
import { getSubjectCatalog, getTrackCardBlurb } from '../../routes.js';
import { Link } from 'react-router-dom';
import { Badge, Button, Card } from '../../components/ui/index.js';
import { validateCatalog } from '../../catalog/subjectCatalog.js';

export default function Tracks() {
  const tracks = getSubjectCatalog();
  const validation = validateCatalog();

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      {!validation.ok ? (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
          <p className="font-semibold">Catalog validation failed</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {validation.errors.slice(0, 8).map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-500">
          Ready to continue learning?
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-100 sm:text-4xl">
          Choose a subject track
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
          Start with a core track, then switch to focused modules and milestone planning as you progress.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link to="/" className="inline-flex">
            <Button variant="outline" size="md" icon={<i className="fas fa-house" />}>
              Explore home
            </Button>
          </Link>
          <Link to="/tracks" className="inline-flex">
            <Button variant="primary" size="md" icon={<i className="fas fa-layer-group" />}>
              Explore tracks
            </Button>
          </Link>
        </div>
      </header>

      <section className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tracks.map((track) => {
          const isActive = track.status === 'active' && track.hasCalculator;
          const classificationLabel = track.classification === 'foundation' ? 'Foundation track' : 'Specialized track';
          const badgeVariant = track.classification === 'foundation' ? 'indigo' : 'slate';

          return (
            <Card
              key={track.slug}
              variant="elevated"
              className={`relative overflow-hidden ${!isActive ? 'opacity-70' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 dark:bg-indigo-500">
                    <i className="fas fa-layer-group" />
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-slate-100">
                      {track.label}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      Sections: {track.sectionsCount} · Status: {track.status}
                    </p>
                  </div>
                </div>

                <Badge variant={badgeVariant} size="sm">
                  {classificationLabel}
                </Badge>
              </div>

              <p className="mt-5 text-sm leading-6 text-slate-600 dark:text-slate-400">
                {isActive
                  ? getTrackCardBlurb(track)
                  : track.goal?.trim() ||
                    track.description?.trim() ||
                    'This track is planned and will unlock in future waves.'}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                {isActive ? (
                  <Link to={track.subjectPath} className="inline-flex">
                    <Button variant="primary" size="md" icon={<i className="fas fa-arrow-right" />}>
                      Open track
                    </Button>
                  </Link>
                ) : (
                  <Button variant="secondary" size="md" disabled icon={<i className="fas fa-lock" />}>
                    Coming soon
                  </Button>
                )}

                {track.calculatorPath ? (
                  <Link to={track.calculatorPath} className="inline-flex">
                    <Button variant="ghost" size="md" icon={<i className="fas fa-calculator" />}>
                      Calculator
                    </Button>
                  </Link>
                ) : null}
              </div>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
