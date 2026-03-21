import React, { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { TRACKS_PATH, getSubjectCatalog } from '../../routes.js';
import PlatformHero from '../../components/platform/PlatformHero.jsx';

function formatTitle(track) {
  return `${track.label} Workspace`;
}

export default function SubjectEntry() {
  const { subject } = useParams();
  const tracks = getSubjectCatalog();
  const track = tracks.find((item) => item.slug === subject);

  useEffect(() => {
    document.body.classList.add('hub-page');
    return () => document.body.classList.remove('hub-page');
  }, []);

  if (!track) {
    return <Navigate to={TRACKS_PATH} replace />;
  }

  const actions = [
    {
      key: 'calculator',
      label: 'Calculator',
      icon: 'fa-calculator',
      description: 'Open practical topic sections and interactive tools.',
      path: track.calculatorPath,
      enabled: Boolean(track.features?.calculator && track.calculatorPath),
      primary: true,
    },
    {
      key: 'roadmap',
      label: 'Roadmap',
      icon: 'fa-route',
      description: 'Follow milestones and learning checkpoints.',
      path: track.roadmapPath,
      enabled: Boolean(track.features?.roadmap && track.roadmapPath),
      primary: false,
    },
    {
      key: 'videos',
      label: 'Video lessons',
      icon: 'fa-play-circle',
      description: 'Structured video flow for each topic and level.',
      path: null,
      enabled: Boolean(track.features?.videos),
      primary: false,
    },
  ];

  return (
    <main className="hub-main">
      <PlatformHero
        title={formatTitle(track)}
        subtitle="Choose how you want to continue in this subject"
      />

      <section className="platform-section" aria-label="Learning format options">
        <div className="platform-grid platform-grid-3">
          {actions.map((action) => (
            <article key={action.key} className="platform-info-card">
              <div className="platform-info-icon"><i className={`fas ${action.icon}`}></i></div>
              <h3>{action.label}</h3>
              <p>{action.description}</p>
              {action.enabled && action.path ? (
                <Link
                  to={action.path}
                  className={action.primary ? 'btn btn-primary' : 'btn btn-outline'}
                  style={{ marginTop: '0.7rem', display: 'inline-flex' }}
                >
                  Go
                </Link>
              ) : (
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled
                  style={{ marginTop: '0.7rem', display: 'inline-flex' }}
                >
                  Planned
                </button>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="platform-cta-strip" aria-label="Back to tracks">
        <div>
          <h2>Need another subject?</h2>
          <p>Go back to the tracks list and choose a different area.</p>
        </div>
        <div className="platform-cta-actions">
          <Link className="btn btn-outline" to={TRACKS_PATH}>
            <i className="fas fa-arrow-left"></i> Back to tracks
          </Link>
        </div>
      </section>
    </main>
  );
}
