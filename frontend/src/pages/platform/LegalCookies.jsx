import React from 'react';

export default function LegalCookies() {
  return (
    <div className="container">
      <div className="page-title">
        <h2>Cookie Policy</h2>
        <p className="subtitle">Browser storage and technical cookies used by Math Lab Platform</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3><i className="fas fa-cookie-bite"></i> Cookie summary</h3>
        </div>
        <div className="card-body">
          <p>
            Essential browser storage is used for technical platform behavior such as theme preference, chatbot widget
            state, and account session continuity.
          </p>
          <p>
            No advertising cookies are introduced in this wave. Additional analytics or tracking categories, if added,
            will be documented here before release.
          </p>
          <p>
            You can clear local data at any time using browser settings.
          </p>
        </div>
      </div>
    </div>
  );
}
