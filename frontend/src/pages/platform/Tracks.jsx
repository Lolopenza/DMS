import React, { useEffect } from 'react';
import { getSubjectCatalog } from '../../routes.js';
import PlatformHero from '../../components/platform/PlatformHero.jsx';
import TrackCard from '../../components/platform/TrackCard.jsx';

export default function Tracks() {
  const tracks = getSubjectCatalog();

  useEffect(() => {
    document.body.classList.add('hub-page');
    return () => document.body.classList.remove('hub-page');
  }, []);

  return (
    <main className="hub-main">
      <PlatformHero
        title="Learning Tracks"
        subtitle="Select a track and enter its subject workspace"
      />

      <div className="hub-cards">
        {tracks.map((track) => (
          <TrackCard key={track.slug} track={track} />
        ))}
      </div>
    </main>
  );
}
