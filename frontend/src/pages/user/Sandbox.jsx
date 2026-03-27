import React from 'react';

const JUPYTERLITE_EMBED_URL = 'https://jupyterlite.github.io/demo/lab/index.html';

export default function Sandbox() {
  return (
    <div className="container">
      <div className="page-title">
        <h1><i className="fas fa-flask"></i> Sandbox (Beta)</h1>
        <p className="subtitle">
          JupyterLite runs inside this page. First load may take 10-15 seconds.
        </p>
      </div>

      <div className="dmc-card">
        <div className="dmc-card-body">
          <div className="rounded-lg border border-amber-200 bg-amber-50 text-amber-800 px-3 py-2 text-xs mb-3">
            Beta limitations: heavy ML packages may be unavailable in browser mode.
          </div>
          <iframe
            title="JupyterLite Sandbox"
            src={JUPYTERLITE_EMBED_URL}
            style={{ width: '100%', minHeight: '75vh', border: '1px solid #e2e8f0', borderRadius: 10, background: '#fff' }}
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
