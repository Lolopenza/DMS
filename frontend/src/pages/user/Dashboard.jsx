import React from 'react';
import { Link } from 'react-router-dom';
import { CALCULATOR_PATH, ROADMAP_PATH, TRACKS_PATH, USER_PROFILE_PATH, USER_SETTINGS_PATH } from '../../routes.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="container">
      <div className="page-title">
        <h2>User Dashboard</h2>
        <p className="subtitle">Welcome back, {user?.name || 'Student'}.</p>
      </div>

      <div className="features-grid">
        <Link to={CALCULATOR_PATH} className="feature-card">
          <div className="icon"><i className="fas fa-calculator"></i></div>
          <div className="content">
            <h3>Continue practice</h3>
            <p>Open calculator modules and continue solving problems.</p>
          </div>
        </Link>

        <Link to={ROADMAP_PATH} className="feature-card">
          <div className="icon"><i className="fas fa-route"></i></div>
          <div className="content">
            <h3>Learning roadmap</h3>
            <p>Track progress through the discrete math learning path.</p>
          </div>
        </Link>

        <Link to={TRACKS_PATH} className="feature-card">
          <div className="icon"><i className="fas fa-layer-group"></i></div>
          <div className="content">
            <h3>All tracks</h3>
            <p>Open active track and preview planned subject expansion.</p>
          </div>
        </Link>

        <Link to={USER_PROFILE_PATH} className="feature-card">
          <div className="icon"><i className="fas fa-id-badge"></i></div>
          <div className="content">
            <h3>Profile</h3>
            <p>Manage personal info and learner preferences.</p>
          </div>
        </Link>

        <Link to={USER_SETTINGS_PATH} className="feature-card">
          <div className="icon"><i className="fas fa-sliders"></i></div>
          <div className="content">
            <h3>Settings</h3>
            <p>Adjust notifications and interface behavior.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
