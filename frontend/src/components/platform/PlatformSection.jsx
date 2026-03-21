import React from 'react';

export default function PlatformSection({ title, subtitle, children }) {
  return (
    <section className="platform-section">
      <header className="platform-section-header">
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </header>
      <div className="platform-section-body">{children}</div>
    </section>
  );
}