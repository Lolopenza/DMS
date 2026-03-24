import React from 'react';
import { Link } from 'react-router-dom';
import {
  CALCULATOR_PATH,
  ROADMAP_PATH,
  TRACKS_PATH,
  USER_PRACTICE_PATH,
  USER_PROFILE_PATH,
  USER_SETTINGS_PATH,
} from '../../routes.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const displayName = user?.name || user?.username || 'Student';

  return (
    <div className="container">
      <div className="page-title">
        <h1><i className="fas fa-chart-line"></i> Welcome back, {displayName}!</h1>
        <p className="subtitle">Pick up where you left off or explore something new today.</p>
      </div>

      <div className="features-grid">
        <Link to={CALCULATOR_PATH} className="feature-card">
          <div className="icon"><i className="fas fa-calculator"></i></div>
          <div className="content">
            <h3>Practice with Calculators</h3>
            <p>Master concepts with interactive tools for all major topics.</p>
          </div>
        </Link>

        <Link to={ROADMAP_PATH} className="feature-card">
          <div className="icon"><i className="fas fa-route"></i></div>
          <div className="content">
            <h3>Math Roadmap</h3>
            <p>Explore learning paths across foundations and specialized domains.</p>
          </div>
        </Link>

        <Link to={TRACKS_PATH} className="feature-card">
          <div className="icon"><i className="fas fa-layer-group"></i></div>
          <div className="content">
            <h3>Subject Tracks</h3>
            <p>Discover upcoming subjects and plan your learning journey.</p>
          </div>
        </Link>

        <Link to={USER_PRACTICE_PATH} className="feature-card">
          <div className="icon"><i className="fas fa-wand-magic-sparkles"></i></div>
          <div className="content">
            <h3>AI-Powered Practice</h3>
            <p>Get personalized problems with instant feedback from AI.</p>
          </div>
        </Link>

        <Link to={USER_PROFILE_PATH} className="feature-card">
          <div className="icon"><i className="fas fa-id-badge"></i></div>
          <div className="content">
            <h3>My Profile</h3>
            <p>Update your information and learning goals.</p>
          </div>
        </Link>

        <Link to={USER_SETTINGS_PATH} className="feature-card">
          <div className="icon"><i className="fas fa-sliders"></i></div>
          <div className="content">
            <h3>Preferences</h3>
            <p>Customize your learning experience and notifications.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
