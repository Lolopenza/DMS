import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TRACKS_PATH } from '../../routes.js';
import { getSubjectCatalog } from '../../routes.js';
import PlatformHero from '../../components/platform/PlatformHero.jsx';
import PlatformSection from '../../components/platform/PlatformSection.jsx';
import TrackCard from '../../components/platform/TrackCard.jsx';

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

  useEffect(() => {
    document.body.classList.add('hub-page');
    return () => document.body.classList.remove('hub-page');
  }, []);

  return (
    <main className="hub-main">
      <PlatformHero
        title="Math Lab Platform"
        subtitle="Choose a subject track first, then continue with calculator sections and roadmap milestones"
      />

      <div className="hub-cards">
        {tracks.map((track) => (
          <TrackCard key={track.slug} track={track} />
        ))}
      </div>

      <PlatformSection
        title="Why this platform"
        subtitle="Commercial-grade IA for learning workflows: discover topic, enter format, continue with personalized steps"
      >
        <div className="platform-why-layout">
          <div className="platform-why-list">
            {VALUE_PILLARS.map((item, idx) => (
              <article key={item.title} className={`platform-why-item platform-why-item-${idx + 1}`}>
                <div className="platform-info-icon"><i className={`fas ${item.icon}`}></i></div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            ))}
          </div>

          <aside className="platform-why-spotlight" aria-label="Learning flow">
            <h3>Learning flow at a glance</h3>
            <p>One clear path from orientation to execution, without page clutter.</p>
            <ul>
              <li><i className="fas fa-layer-group"></i> Pick a subject track</li>
              <li><i className="fas fa-compass"></i> Choose learning format</li>
              <li><i className="fas fa-flag-checkered"></i> Continue from your last milestone</li>
            </ul>
          </aside>
        </div>
      </PlatformSection>

      <PlatformSection
        title="Platform snapshot"
        subtitle="Current baseline and expansion readiness"
      >
        <div className="platform-metric-band">
          {TRUST_METRICS.map((metric) => (
            <article key={metric.label} className="platform-metric-pill">
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </article>
          ))}
        </div>
        <p className="platform-snapshot-note">
          Infrastructure is prepared for incremental subject rollout with shared routing and reusable module shells.
        </p>
      </PlatformSection>

      <PlatformSection
        title="FAQ"
        subtitle="Short answers on scope, rollout and current capabilities"
      >
        <div className="platform-faq-stack">
          {FAQ_ITEMS.map((item, idx) => (
            <article key={item.question} className={`platform-faq-card ${openFaqIndex === idx ? 'is-open' : ''}`}>
              <div className="platform-faq-index">0{idx + 1}</div>
              <button
                type="button"
                className="platform-faq-trigger"
                aria-expanded={openFaqIndex === idx}
                onClick={() => setOpenFaqIndex((prev) => (prev === idx ? -1 : idx))}
              >
                <h3>{item.question}</h3>
                <i className="fas fa-chevron-down"></i>
              </button>
              <div className={`platform-faq-answer ${openFaqIndex === idx ? 'is-open' : ''}`}>
                <p>{item.answer}</p>
              </div>
            </article>
          ))}
        </div>
      </PlatformSection>

      <section className="platform-cta-strip" aria-label="Quick actions">
        <div>
          <h2>Ready to continue learning?</h2>
          <p>Start by choosing a subject track, then continue with practical modules and milestone planning.</p>
        </div>
        <div className="platform-cta-actions">
          <Link className="btn btn-primary" to={TRACKS_PATH}>
            <i className="fas fa-layer-group"></i> Explore tracks
          </Link>
          {activeTrack ? (
            <Link className="btn btn-outline" to={activeTrack.subjectPath}>
              <i className="fas fa-compass"></i> Open active track
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  );
}
