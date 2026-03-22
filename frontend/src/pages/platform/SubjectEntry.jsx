import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { TRACKS_PATH, buildSectionsForSubject, getSubjectCatalog } from '../../routes.js';
import PlatformHero from '../../components/platform/PlatformHero.jsx';

function formatTitle(track) {
  return `${track.label} Workspace`;
}

export default function SubjectEntry() {
  const { subject } = useParams();
  const tracks = getSubjectCatalog();
  const track = tracks.find((item) => item.slug === subject);
  const [scopeFilter, setScopeFilter] = useState('all');

  useEffect(() => {
    document.body.classList.add('hub-page');
    return () => document.body.classList.remove('hub-page');
  }, []);

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

  return (
    <main className="hub-main">
      <PlatformHero
        title={formatTitle(track)}
        subtitle="Choose a topic, then select theory, video, or interactive tool"
      />

      <section className="platform-section" aria-label="Track scope">
        <div className="platform-info-card subject-scope-card">
          <div className="platform-info-icon"><i className="fas fa-compass-drafting"></i></div>
          <h3>{scopeTitle}</h3>
          <p className="subject-scope-goal">{track.goal}</p>
          <p>{scopeDescription}</p>
        </div>
      </section>

      <section className="platform-section" aria-label="Module scope filters">
        <div className="scope-filter-row">
          {[
            { key: 'all', label: `All (${sections.length})` },
            { key: 'intro', label: `Intro (${sections.filter((s) => s.scope === 'intro').length})` },
            { key: 'deep-dive', label: `Deep Dive (${sections.filter((s) => s.scope === 'deep-dive').length})` },
          ].map((option) => (
            <button
              key={option.key}
              type="button"
              className={`btn btn-outline scope-filter-btn${scopeFilter === option.key ? ' is-active' : ''}`}
              onClick={() => setScopeFilter(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="platform-section" aria-label="Module catalog">
        <div className="features-grid">
          {filteredSections.map(({ slug, icon, label, desc, scope }) => (
            <div className="feature-card" key={slug}>
              <div className="icon">
                <i className={`fas ${icon}`}></i>
              </div>
              <div className="content">
                <h3>{label}</h3>
                {scope ? (
                  <div className="scope-badge-wrap">
                    <span className={`scope-badge ${scope === 'intro' ? 'scope-badge-intro' : 'scope-badge-deep-dive'}`}>
                      {scope === 'intro' ? 'Intro' : 'Deep Dive'}
                    </span>
                  </div>
                ) : null}
                <p>{desc}</p>
                <Link to={`/${subject}/${slug}`} className="feature-btn">Open</Link>
              </div>
            </div>
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
