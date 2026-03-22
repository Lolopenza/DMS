import React, { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { buildSectionsForSubject, getSubjectCatalog } from '../../routes.js';
import { getModuleProgress } from './moduleProgress.js';

function launchCards(subject, moduleSlug) {
  return [
    {
      key: 'theory',
      title: 'Theory & Concepts',
      icon: 'fa-book-open',
      description: 'Read structured explanations, definitions, and examples for this topic.',
      to: `/${subject}/${moduleSlug}/theory`,
      style: 'btn btn-outline',
    },
    {
      key: 'videos',
      title: 'Video Lectures',
      icon: 'fa-circle-play',
      description: 'Open related video materials and guided walkthrough content.',
      to: `/${subject}/${moduleSlug}/videos`,
      style: 'btn btn-outline',
    },
    {
      key: 'calculator',
      title: 'Interactive Calculator',
      icon: 'fa-calculator',
      description: 'Launch the interactive sandbox and solve problems hands-on.',
      to: `/${subject}/${moduleSlug}/calculator`,
      style: 'btn btn-primary',
    },
  ];
}

export default function ModuleDashboard() {
  const { subject, module: moduleSlug } = useParams();
  const track = getSubjectCatalog().find((item) => item.slug === subject);
  const moduleMeta = buildSectionsForSubject(subject).find((section) => section.slug === moduleSlug);

  useEffect(() => {
    document.body.classList.add('hub-page');
    return () => document.body.classList.remove('hub-page');
  }, []);

  if (!track || !moduleMeta) {
    return <Navigate to={`/${subject || ''}`} replace />;
  }

  const progress = getModuleProgress(subject, moduleSlug);
  const cards = launchCards(subject, moduleSlug).map((card) => ({
    ...card,
    completed: Boolean(progress[card.key]),
  }));
  const completedCount = cards.filter((card) => card.completed).length;

  return (
    <main className="hub-main">
      <section className="platform-section module-breadcrumb-wrap" aria-label="Breadcrumb">
        <nav className="module-breadcrumb" aria-label="Module navigation path">
          <Link to="/tracks">Tracks</Link>
          <span>/</span>
          <Link to={`/${subject}`}>{track.label}</Link>
          <span>/</span>
          <span>{moduleMeta.label}</span>
        </nav>
      </section>

      <section className="platform-section" aria-label="Module overview">
        <div className="platform-info-card subject-scope-card">
          <div className="platform-info-icon"><i className={`fas ${moduleMeta.icon}`}></i></div>
          <h2 className="module-heading">{moduleMeta.label}</h2>
          {moduleMeta.scope ? (
            <span className={`scope-badge track-classification-badge ${moduleMeta.scope === 'intro' ? 'scope-badge-intro' : 'scope-badge-deep-dive'}`}>
              {moduleMeta.scope === 'intro' ? 'Intro Module' : 'Deep Dive Module'}
            </span>
          ) : null}
          <span className={`scope-badge track-classification-badge ${track.classification === 'foundation' ? 'scope-badge-intro' : 'scope-badge-deep-dive'}`}>
            {track.classification === 'foundation' ? 'Foundation Track' : 'Specialized Track'}
          </span>
          <p className="subject-scope-goal module-subtitle">{moduleMeta.desc}</p>
          <div className="module-progress-summary">
            <span className="scope-badge scope-badge-intro">Progress</span>
            <span>{completedCount}/3 learning modes completed</span>
          </div>
        </div>
      </section>

      <section className="platform-section" aria-label="Learning modalities">
        <div className="platform-grid platform-grid-3">
          {cards.map((card) => (
            <article key={card.key} className="platform-info-card module-mode-card">
              <div className="platform-info-icon"><i className={`fas ${card.icon}`}></i></div>
              <h3>{card.title}</h3>
              <span className={`module-mode-status ${card.completed ? 'done' : 'todo'}`}>
                {card.completed ? 'Completed' : 'Not started'}
              </span>
              <p>{card.description}</p>
              <Link to={card.to} className={`${card.style} subject-entry-action-btn module-mode-action`}>
                {card.completed ? 'Review' : 'Open'}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="platform-cta-strip" aria-label="Back links">
        <div>
          <h2>Need a different topic?</h2>
          <p>Return to the module catalog for this track or switch tracks.</p>
        </div>
        <div className="platform-cta-actions">
          <Link className="btn btn-outline" to={`/${subject}`}>
            <i className="fas fa-arrow-left"></i> Back to modules
          </Link>
          <Link className="btn btn-outline" to="/tracks">
            <i className="fas fa-layer-group"></i> All tracks
          </Link>
        </div>
      </section>
    </main>
  );
}
