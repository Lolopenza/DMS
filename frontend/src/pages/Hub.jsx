import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Hub() {
  useEffect(() => {
    document.body.classList.add('hub-page');
    return () => document.body.classList.remove('hub-page');
  }, []);

  return (
    <main className="hub-main">
      <div className="hub-hero">
        <h1>Discrete Mathematics</h1>
        <p>Calculator, roadmap, and lessons in one place</p>
      </div>
      <div className="hub-cards">
        <Link to="/calculator" className="hub-card">
          <div className="icon"><i className="fas fa-calculator"></i></div>
          <h2>DMC Calculator</h2>
          <p>Logic, sets, graphs, combinatorics, probability, automata, number theory — calculations and visualizations</p>
        </Link>
        <Link to="/roadmap" className="hub-card">
          <div className="icon"><i className="fas fa-route"></i></div>
          <h2>Roadmap</h2>
          <p>Step-by-step path through discrete math topics</p>
        </Link>
        <a href="#lessons" className="hub-card" style={{ opacity: 0.7, pointerEvents: 'none' }} aria-disabled="true">
          <div className="icon"><i className="fas fa-play-circle"></i></div>
          <h2>Lessons</h2>
          <p>Coming soon: video lessons and materials by topic</p>
        </a>
      </div>
    </main>
  );
}
