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
import { useParams, Navigate } from 'react-router-dom';
import { isSubjectImplemented, loadSubjectModule } from './subjectRegistry.js';

// Placeholder while module loads
function ModuleLoader() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p>Loading module...</p>
    </div>
  );
}

export default function SubjectRouter() {
  const { subject, module: moduleSlug } = useParams();
  const [ModuleComponent, setModuleComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    return <Navigate replace to="/" />;
  }

  if (loading || !ModuleComponent) {
    return <ModuleLoader />;
  }

  return <ModuleComponent />;
}
