import React from 'react';

export default function PlatformHero({ title, subtitle }) {
  return (
    <div className="hub-hero">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
}
