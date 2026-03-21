import React from 'react';

export default function LegalPrivacy() {
  return (
    <div className="container">
      <div className="page-title">
        <h2>Privacy Policy</h2>
        <p className="subtitle">How this educational platform handles user and interaction data</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3><i className="fas fa-user-shield"></i> Privacy summary</h3>
        </div>
        <div className="card-body">
          <p>
            Account and learning-session data can be stored securely in the browser to provide continuity between visits
            and consistent user experience.
          </p>
          <p>
            This policy describes data processing principles, retention boundaries, and contact channels for privacy
            requests.
          </p>
          <p>
            We recommend avoiding sensitive personal data in educational free-text fields.
          </p>
        </div>
      </div>
    </div>
  );
}
