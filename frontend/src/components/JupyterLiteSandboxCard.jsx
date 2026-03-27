import React from 'react';
import { Link } from 'react-router-dom';
import { USER_SANDBOX_PATH } from '../routes.js';

export default function JupyterLiteSandboxCard() {
  return (
    <div className="dmc-card mt-6">
      <div className="dmc-card-header flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-semibold dmc-title">Sandbox (Beta)</h3>
      </div>
      <div className="dmc-card-body space-y-3">
        <p className="text-sm dmc-subtitle">
          Optional JupyterLite mode runs Python in your browser (Pyodide). Useful for quick experiments without leaving the portal.
        </p>
        <div className="rounded-lg border border-amber-200 bg-amber-50 text-amber-800 px-3 py-2 text-xs">
          Beta limitations: first launch may take 10-15 seconds, heavy ML libraries are not available. JupyterLite still uses
          the public runtime, but now it opens inside our portal page.
        </div>
        <Link to={USER_SANDBOX_PATH} className="dmc-button-secondary inline-flex">
          Open Sandbox in Portal
        </Link>
      </div>
    </div>
  );
}
