import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle.jsx';
import Chatbot from './Chatbot.jsx';
import { ToastProvider } from './Toast.jsx';
import { SECTIONS } from '../routes.js';

export default function Layout({ children, chatHistory, setChatHistory }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHub = location.pathname === '/';
  const isMinimalNav = isHub || location.pathname === '/roadmap';

  return (
    <ToastProvider>
      <ThemeToggle />

      {isMinimalNav ? (
        /* Hub / Roadmap — minimal nav, только логотип */
        <nav className={isHub ? 'hub-nav' : 'roadmap-nav'} aria-label="Main Navigation">
          <Link to="/" className="nav-brand" aria-label="Discrete Lab home">
            <i className="fas fa-calculator"></i>
            <span>Discrete Lab</span>
          </Link>
        </nav>
      ) : (
        /* Остальные страницы — полная навигация */
        <nav className="top-nav" aria-label="Main Navigation">
          <Link to="/" className="nav-brand" aria-label="Discrete Lab home">
            <i className="fas fa-calculator"></i>
            <span>Discrete Lab</span>
          </Link>

          <button
            className="mobile-menu-toggle"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMobileMenuOpen(o => !o)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className={`nav-links${mobileMenuOpen ? ' open' : ''}`}>
            {SECTIONS.map(({ path, icon, label }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                title={label}
                aria-label={label}
                onClick={() => setMobileMenuOpen(false)}
              >
                <i className={`fas ${icon}`}></i>
              </NavLink>
            ))}
            <NavLink
              to="/calculator"
              className={({ isActive }) => `nav-item nav-item-sections${isActive ? ' active' : ''}`}
              title="All sections"
              aria-label="All calculator sections"
              onClick={() => setMobileMenuOpen(false)}
            >
              <i className="fas fa-th-large"></i>
            </NavLink>
          </div>
        </nav>
      )}

      <main id="mainContent" tabIndex="-1" aria-label="Main Content">
        {children}
      </main>

      {/* Footer только там где полный nav */}
      {!isMinimalNav && (
        <footer className="footer">
          <div className="container">
            <div className="footer-section">
              <h4>About</h4>
              <p>A comprehensive tool for solving discrete mathematics problems, designed to help students and professionals understand and apply mathematical concepts.</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul className="footer-links">
                {SECTIONS.slice(0, 4).map(({ path, icon, label }) => (
                  <li key={path}><Link to={path}><i className={`fas ${icon}`}></i> {label}</Link></li>
                ))}
              </ul>
            </div>
            <div className="footer-section">
              <h4>More Tools</h4>
              <ul className="footer-links">
                {SECTIONS.slice(4).map(({ path, icon, label }) => (
                  <li key={path}><Link to={path}><i className={`fas ${icon}`}></i> {label}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', padding: '12px 0' }}>
              <span style={{ opacity: 0.7, fontSize: '1rem' }}>Discrete Math Calculator</span>
            </div>
          </div>
        </footer>
      )}

      <Chatbot chatHistory={chatHistory} setChatHistory={setChatHistory} />
    </ToastProvider>
  );
}
