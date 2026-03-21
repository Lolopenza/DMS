import React from 'react';
import { Link } from 'react-router-dom';

function statusLabel(status) {
  if (status === 'active') return 'Active';
  if (status === 'planned') return 'Planned';
  return 'Draft';
}

export default function TrackCard({ track }) {
  const isActive = track.status === 'active' && track.hasCalculator;
  const cardClass = isActive ? 'hub-card' : 'hub-card is-disabled';

  if (!isActive) {
    return (
      <article className={cardClass} style={{ opacity: 0.72 }} aria-disabled="true">
        <div className="icon"><i className="fas fa-layer-group"></i></div>
        <h2>{track.label}</h2>
        <p>
          Status: {statusLabel(track.status)}. Sections: {track.sectionsCount}.<br />
          Track is in platform roadmap and will be unlocked in next waves.
        </p>
      </article>
    );
  }

  return (
    <Link to={track.subjectPath} className={cardClass} aria-label={`Open ${track.label} track`}>
      <div className="icon"><i className="fas fa-layer-group"></i></div>
      <h2>{track.label}</h2>
      <p>
        Status: {statusLabel(track.status)}. Sections: {track.sectionsCount}.<br />
        Open the track page to choose your learning format.
      </p>

      <span className="feature-btn" style={{ marginTop: '0.75rem', display: 'inline-flex' }}>
        Open track
      </span>
    </Link>
  );
}
