/**
 * SubjectRouter.jsx
 * 
 * Dynamically routes to subject-specific modules using lazy loading.
 * Replaces the hardcoded MODULE_COMPONENTS enum in App.jsx
 * 
 * Usage:
 *   <Route path="/:subject/modules/:module" element={<SubjectRouter />} />
 *   
 * Parameters:
 *   - :subject — subject slug (e.g., 'discrete-math')
 *   - :module — module slug (e.g., 'combinatorics')
 */

import React, { Suspense, useEffect, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { isSubjectImplemented, loadSubjectModule } from './subjectRegistry.js';
import { markModuleProgress } from '../../../pages/platform/moduleProgress.js';

// Placeholder while module loads
function ModuleLoader() {
  return (
    <main className="hub-main">
      <section className="platform-section" aria-label="Loading module">
        <div className="ui-state ui-state-loading" role="status" aria-live="polite">
          <h3><i className="fas fa-spinner fa-spin"></i> Loading module</h3>
          <p className="ui-state-message">Preparing interactive workspace...</p>
        </div>
      </section>
    </main>
  );
}

function ModuleLoadError({ subject, moduleSlug, error }) {
  return (
    <main className="hub-main">
      <section className="platform-section" aria-label="Module load error">
        <div className="platform-info-card module-load-error-card" role="alert">
          <div className="platform-info-icon"><i className="fas fa-triangle-exclamation"></i></div>
          <h2>Unable to open interactive calculator</h2>
          <p className="module-load-error-text">{error || 'Unknown loading error.'}</p>
          <p>Please go back to the module dashboard and try again.</p>
          <div className="platform-cta-actions">
            {subject && moduleSlug ? (
              <Link className="btn btn-outline" to={`/${subject}/${moduleSlug}`}>
                <i className="fas fa-arrow-left"></i> Back to module dashboard
              </Link>
            ) : null}
            {subject ? (
              <Link className="btn btn-outline" to={`/${subject}`}>
                <i className="fas fa-layer-group"></i> Back to subject modules
              </Link>
            ) : null}
            <Link className="btn btn-primary" to="/tracks">
              <i className="fas fa-compass"></i> Open all tracks
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function SubjectRouter() {
  const { subject, module: moduleSlug } = useParams();
  const [ModuleComponent, setModuleComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    markModuleProgress(subject, moduleSlug, 'calculator');
  }, [subject, moduleSlug]);

  useEffect(() => {
    async function loadModuleComponent() {
      try {
        setLoading(true);
        setError(null);

        if (!isSubjectImplemented(subject)) {
          setError(`Subject not implemented: ${subject}`);
          setLoading(false);
          return;
        }

        const component = await loadSubjectModule(subject, moduleSlug);
        if (!component) {
          setError(`Module not found: ${moduleSlug}`);
          setLoading(false);
          return;
        }

        setModuleComponent(() => component);
        setLoading(false);
      } catch (err) {
        console.error('SubjectRouter error:', err);
        setError(`Failed to load module: ${err.message}`);
        setLoading(false);
      }
    }

    loadModuleComponent();
  }, [subject, moduleSlug]);

  if (error) {
    return <ModuleLoadError subject={subject} moduleSlug={moduleSlug} error={error} />;
  }

  if (loading || !ModuleComponent) {
    return <ModuleLoader />;
  }

  return <ModuleComponent />;
}
