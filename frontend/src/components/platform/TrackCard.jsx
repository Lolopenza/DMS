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
  const classificationLabel = track.classification === 'foundation' ? 'Foundation Track' : 'Specialized Track';
  const classificationClass = track.classification === 'foundation' ? 'scope-badge-intro' : 'scope-badge-deep-dive';

  if (!isActive) {
    return (
      <article className={`${cardClass} track-card-muted`} aria-disabled="true">
        <div className="icon"><i className="fas fa-layer-group"></i></div>
        <h2>{track.label}</h2>
        <span className={`scope-badge track-classification-badge ${classificationClass}`}>{classificationLabel}</span>
        <p>
          Status: {statusLabel(track.status)}. Sections: {track.sectionsCount}.<br />
          {track.goal || 'Track is in platform roadmap and will be unlocked in next waves.'}
        </p>
      </article>
    );
  }

  return (
    <Link to={track.subjectPath} className={cardClass} aria-label={`Open ${track.label} track`}>
      <div className="icon"><i className="fas fa-layer-group"></i></div>
      <h2>{track.label}</h2>
      <span className={`scope-badge track-classification-badge ${classificationClass}`}>{classificationLabel}</span>
      <p>
        Status: {statusLabel(track.status)}. Sections: {track.sectionsCount}.<br />
        {track.goal || 'Open the track page to choose your learning format.'}
      </p>

      <span className="feature-btn track-card-open-btn">
        Open track
      </span>
    </Link>
  );
}
