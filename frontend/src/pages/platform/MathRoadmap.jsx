import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../components/Toast.jsx';
import { SUBJECTS, HOME_PATH } from '../../routes.js';

export default function MathRoadmap() {
  const { showSuccess } = useToast();

  useEffect(() => {
    document.body.classList.add('roadmap-page');
    return () => document.body.classList.remove('roadmap-page');
  }, []);

  function share() {
    if (navigator.share) {
      navigator.share({ title: 'Math Learning Roadmap', url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showSuccess('Link copied to clipboard!');
    }
  }

  const foundationSubjects = SUBJECTS.filter(s => s.classification === 'foundation');
  const specializedSubjects = SUBJECTS.filter(s => s.classification === 'specialized');

  return (
    <>
      <header className="roadmap-hero">
        <h1>Complete Math Learning Roadmap</h1>
        <p>Master core mathematics from foundations to specialized domains. Choose your path.</p>
        <div className="roadmap-actions">
          <Link to={HOME_PATH} className="roadmap-btn roadmap-btn-back">
            <i className="fas fa-arrow-left"></i> Back to home
          </Link>
          <button type="button" className="roadmap-btn roadmap-btn-share" onClick={share}>
            <i className="fas fa-share-nodes"></i> Share
          </button>
        </div>
      </header>

      <div className="roadmap-content">
        <div className="roadmap-overview">
          <h2>Learning Structure</h2>
          <p className="roadmap-overview-text">
            Mathematics is organized into two tiers: build your foundation, then specialize.
          </p>
        </div>

        {/* Foundation Tier */}
        <section className="math-roadmap-section">
          <div className="math-roadmap-header">
            <h3 className="math-roadmap-tier-title">
              <i className="fas fa-layer-group"></i> Foundation Tier
            </h3>
            <p className="math-roadmap-tier-desc">Essential mathematics for Computer Science</p>
          </div>

          <div className="math-subjects-grid">
            {foundationSubjects.map(subject => (
              <article key={subject.slug} className="math-subject-card">
                <div className="math-subject-card-header">
                  <span className="math-subject-badge">Foundation</span>
                  <h4 className="math-subject-title">{subject.label}</h4>
                </div>
                <p className="math-subject-goal">{subject.goal}</p>
                <div className="math-subject-features">
                  {subject.features?.calculator && (
                    <span className="math-feature-chip">
                      <i className="fas fa-calculator"></i> Calculator
                    </span>
                  )}
                  {subject.features?.roadmap && (
                    <span className="math-feature-chip">
                      <i className="fas fa-map"></i> Roadmap
                    </span>
                  )}
                </div>
                <div className="math-subject-actions">
                  {subject.calculatorPath && (
                    <Link to={subject.calculatorPath} className="math-subject-btn math-subject-btn-calc">
                      <i className="fas fa-calculator"></i> Open Calculator
                    </Link>
                  )}
                  {subject.features?.roadmap && (
                    <Link to={`/${subject.slug}/roadmap`} className="math-subject-btn math-subject-btn-roadmap">
                      <i className="fas fa-map"></i> View Roadmap
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Specialized Tier */}
        <section className="math-roadmap-section">
          <div className="math-roadmap-header">
            <h3 className="math-roadmap-tier-title">
              <i className="fas fa-graduation-cap"></i> Specialized Domains
            </h3>
            <p className="math-roadmap-tier-desc">Deepen your expertise in specific areas</p>
          </div>

          <div className="math-subjects-grid">
            {specializedSubjects.map(subject => (
              <article key={subject.slug} className="math-subject-card math-subject-card-specialized">
                <div className="math-subject-card-header">
                  <span className="math-subject-badge math-subject-badge-specialized">Specialized</span>
                  <h4 className="math-subject-title">{subject.label}</h4>
                </div>
                <p className="math-subject-goal">{subject.goal}</p>
                <div className="math-subject-features">
                  {subject.features?.calculator && (
                    <span className="math-feature-chip">
                      <i className="fas fa-calculator"></i> Calculator
                    </span>
                  )}
                  {subject.features?.roadmap && (
                    <span className="math-feature-chip">
                      <i className="fas fa-map"></i> Roadmap
                    </span>
                  )}
                </div>
                <div className="math-subject-actions">
                  {subject.calculatorPath && (
                    <Link to={subject.calculatorPath} className="math-subject-btn math-subject-btn-calc">
                      <i className="fas fa-calculator"></i> Open Calculator
                    </Link>
                  )}
                  {subject.features?.roadmap && (
                    <Link to={`/${subject.slug}/roadmap`} className="math-subject-btn math-subject-btn-roadmap">
                      <i className="fas fa-map"></i> View Roadmap
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="math-roadmap-guidance">
          <h3>Your Learning Path</h3>
          <ul className="math-guidance-list">
            <li>
              <strong>Start with Foundation:</strong> Master Discrete Mathematics to build your foundational skills in logic, sets, and structures.
            </li>
            <li>
              <strong>Choose Your Specialization:</strong> Pick one or more specialized domains based on your goals (ML requires Linear Algebra + Probability, Systems require Algorithms, etc.).
            </li>
            <li>
              <strong>Practice Actively:</strong> Use calculators to reinforce concepts and interactive practice problems to test your understanding.
            </li>
            <li>
              <strong>Build Projects:</strong> Apply what you learn to real-world problems in your chosen specialization.
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}
