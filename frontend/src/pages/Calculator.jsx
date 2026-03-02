import React from 'react';
import { Link } from 'react-router-dom';
import { SECTIONS } from '../routes.js';

export default function Calculator() {
  return (
    <div className="container">
      <div className="hero">
        <h1>DMC Calculator</h1>
        <p className="subtitle">Choose a discrete math section</p>
      </div>

      <div className="features-grid">
        {SECTIONS.map(({ path, icon, label, desc }) => (
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
