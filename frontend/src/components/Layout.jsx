import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle.jsx';
import Chatbot from './Chatbot.jsx';
import { ToastProvider } from './Toast.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  AUTH_SIGN_IN_PATH,
  AUTH_SIGN_UP_PATH,
  HELP_PATH,
  HOME_PATH,
  LEGAL_COOKIES_PATH,
  LEGAL_PRIVACY_PATH,
  LEGAL_TERMS_PATH,
  TRACKS_PATH,
  ROADMAP_PATH,
  USER_DASHBOARD_PATH,
  getFooterLinkGroups,
  getTopNavItems,
  isMinimalNavPath,
  resolveSubjectSlug,
} from '../routes.js';

export default function Layout({ children, chatHistory, setChatHistory }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const isHub = location.pathname === '/';
  const isMinimalNav = isMinimalNavPath(location.pathname);
  const activeSubject = resolveSubjectSlug(location.pathname);
  const navItems = getTopNavItems(activeSubject);
  const sectionEntry = navItems.find((item) => item.isSectionsEntry);
  const moduleItems = navItems.filter((item) => !item.isSectionsEntry);
  const { quickLinks, toolLinks } = getFooterLinkGroups(activeSubject);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.search]);

  function handleLogout() {
    logout();
    setMobileMenuOpen(false);
  }

  function handleFooterLinkClick() {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }

  return (
    <ToastProvider>
      <ThemeToggle />

      {isMinimalNav ? (
        /* Hub / Roadmap — minimal nav, только логотип */
        <nav className={isHub ? 'hub-nav' : 'roadmap-nav'} aria-label="Main Navigation">
          <Link to="/" className="nav-brand" aria-label="Math Lab Platform home">
            <i className="fas fa-calculator"></i>
            <span>Math Lab Platform</span>
          </Link>
          <div className="nav-links" style={{ marginLeft: 'auto' }}>
            {isAuthenticated ? (
              <>
                <NavLink to={USER_DASHBOARD_PATH} className="nav-item" title="Dashboard" aria-label="Dashboard">
                  <i className="fas fa-gauge"></i>
                </NavLink>
                <button
                  type="button"
                  className="nav-item"
                  title="Sign out"
                  aria-label="Sign out"
                  onClick={handleLogout}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                >
                  <i className="fas fa-right-from-bracket"></i>
                </button>
              </>
            ) : (
              <>
                <NavLink to={AUTH_SIGN_IN_PATH} className="nav-item" title="Sign in" aria-label="Sign in">
                  <i className="fas fa-right-to-bracket"></i>
                </NavLink>
                <NavLink to={AUTH_SIGN_UP_PATH} className="nav-item" title="Sign up" aria-label="Sign up">
                  <i className="fas fa-user-plus"></i>
                </NavLink>
              </>
            )}
          </div>
        </nav>
      ) : (
        /* Остальные страницы — полная навигация */
        <nav className="top-nav" aria-label="Main Navigation">
          <Link to="/" className="nav-brand" aria-label="Math Lab Platform home">
            <i className="fas fa-calculator"></i>
            <span>Math Lab Platform</span>
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
            <div className="nav-main-group">
              {moduleItems.map(({ path, icon, label }) => (
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
            </div>

            {sectionEntry ? <span className="nav-divider" aria-hidden="true"></span> : null}

            {sectionEntry ? (
              <div className="nav-sections-group">
                <NavLink
                  to={sectionEntry.path}
                  className={({ isActive }) => `nav-item nav-item-sections${isActive ? ' active' : ''}`}
                  title={sectionEntry.label}
                  aria-label={sectionEntry.label}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <i className={`fas ${sectionEntry.icon}`}></i>
                </NavLink>
              </div>
            ) : null}

            <span className="nav-divider" aria-hidden="true"></span>

            <div className="nav-auth-group">
              {isAuthenticated ? (
                <>
                  <NavLink
                    to={USER_DASHBOARD_PATH}
                    className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                    title="Dashboard"
                    aria-label="Dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <i className="fas fa-gauge"></i>
                  </NavLink>
                  <button
                    type="button"
                    className="nav-item"
                    title="Sign out"
                    aria-label="Sign out"
                    onClick={handleLogout}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                  >
                    <i className="fas fa-right-from-bracket"></i>
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to={AUTH_SIGN_IN_PATH}
                    className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                    title="Sign in"
                    aria-label="Sign in"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <i className="fas fa-right-to-bracket"></i>
                  </NavLink>
                  <NavLink
                    to={AUTH_SIGN_UP_PATH}
                    className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                    title="Sign up"
                    aria-label="Sign up"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <i className="fas fa-user-plus"></i>
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </nav>
      )}

      <main id="mainContent" tabIndex="-1" aria-label="Main Content">
        {children}
      </main>

      {/* Footer shown globally to keep project context and quick links consistent */}
      {(
        <footer className="footer">
          <div className="container">
            <div className="footer-section">
              <h4>Math Lab Platform</h4>
              <p>A comprehensive platform for learning and solving mathematics problems, designed to help students and professionals build practical understanding across multiple topics.</p>
              <div className="footer-status-badge">
                <i className="fas fa-circle-check"></i>
                <span>Subject tracks are available, with Discrete Mathematics active now</span>
              </div>
            </div>
            <div className="footer-section">
              <h4>Platform</h4>
              <ul className="footer-links">
                <li><Link to={HOME_PATH} onClick={handleFooterLinkClick}><i className="fas fa-house"></i> Home</Link></li>
                <li><Link to={TRACKS_PATH} onClick={handleFooterLinkClick}><i className="fas fa-layer-group"></i> Tracks</Link></li>
                <li><Link to={ROADMAP_PATH} onClick={handleFooterLinkClick}><i className="fas fa-route"></i> Roadmap</Link></li>
                <li><Link to={USER_DASHBOARD_PATH} onClick={handleFooterLinkClick}><i className="fas fa-gauge"></i> Dashboard</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Learning Tools</h4>
              <ul className="footer-links">
                {quickLinks.map(({ path, icon, label }) => (
                  <li key={path}><Link to={path} onClick={handleFooterLinkClick}><i className={`fas ${icon}`}></i> {label}</Link></li>
                ))}
                {toolLinks.map(({ path, icon, label }) => (
                  <li key={path}><Link to={path} onClick={handleFooterLinkClick}><i className={`fas ${icon}`}></i> {label}</Link></li>
                ))}
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul className="footer-links">
                <li><Link to={AUTH_SIGN_IN_PATH} onClick={handleFooterLinkClick}><i className="fas fa-right-to-bracket"></i> Sign in</Link></li>
                <li><Link to={AUTH_SIGN_UP_PATH} onClick={handleFooterLinkClick}><i className="fas fa-user-plus"></i> Sign up</Link></li>
                <li><Link to={HELP_PATH} onClick={handleFooterLinkClick}><i className="fas fa-circle-question"></i> Help center</Link></li>
                <li><a href="mailto:support@mathlab.local"><i className="fas fa-envelope"></i> support@mathlab.local</a></li>
                <li><a href="mailto:partnerships@mathlab.local"><i className="fas fa-handshake"></i> partnerships@mathlab.local</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Legal</h4>
              <ul className="footer-links">
                <li><Link to={LEGAL_TERMS_PATH} onClick={handleFooterLinkClick}>Terms of use</Link></li>
                <li><Link to={LEGAL_PRIVACY_PATH} onClick={handleFooterLinkClick}>Privacy policy</Link></li>
                <li><Link to={LEGAL_COOKIES_PATH} onClick={handleFooterLinkClick}>Cookie policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', padding: '12px 0' }}>
              <span style={{ opacity: 0.7, fontSize: '1rem' }}>Math Lab Platform</span>
            </div>
          </div>
        </footer>
      )}

      <Chatbot chatHistory={chatHistory} setChatHistory={setChatHistory} />
    </ToastProvider>
  );
}
