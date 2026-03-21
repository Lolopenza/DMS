import React from 'react';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { DEFAULT_SUBJECT, buildSectionsForSubject, getSubjectCatalog } from '../routes.js';

export default function Calculator() {
  const { subject } = useParams();
  const activeSubject = subject || DEFAULT_SUBJECT;
  const sections = buildSectionsForSubject(activeSubject);
  const subjectMeta = getSubjectCatalog().find((item) => item.slug === activeSubject);

  return (
    <div className="container">
      <div className="hero">
        <h1>Math Lab Platform Calculator</h1>
        <p className="subtitle">Choose a section in {subjectMeta?.label || 'this subject'}</p>
      </div>

      <div className="features-grid">
        {sections.map(({ path, icon, label, desc }) => (
          <div className="feature-card" key={path}>
            <div className="icon">
              <i className={`fas ${icon}`}></i>
            </div>
            <div className="content">
              <h3>{label}</h3>
              <p>{desc}</p>
              <Link to={path} className="feature-btn">Open</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
