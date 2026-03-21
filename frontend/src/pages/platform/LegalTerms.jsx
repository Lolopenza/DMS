import React from 'react';

export default function LegalTerms() {
  return (
    <div className="container">
      <div className="page-title">
        <h2>Terms of Use</h2>
        <p className="subtitle">Current platform usage terms for the Math Lab environment</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3><i className="fas fa-file-contract"></i> Terms summary</h3>
        </div>
        <div className="card-body">
          <p>
            Math Lab Platform provides educational content, calculators, and roadmap workflows for study purposes.
            Users must not misuse the service for harmful, illegal, or abusive activities.
          </p>
          <p>
            The platform is continuously improved to keep content quality, reliability, and navigation consistency at a
            production level.
          </p>
          <p>
            By using this environment, you agree that educational outputs are supportive materials and should be
            validated for critical assessments.
          </p>
        </div>
      </div>
    </div>
  );
}
