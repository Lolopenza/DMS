import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle.jsx';
import Chatbot from './Chatbot.jsx';
import AppFooter from './AppFooter.jsx';
import { ToastProvider } from './Toast.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  AUTH_SIGN_IN_PATH,
  AUTH_SIGN_UP_PATH,
  ADMIN_CONTENT_PATH,
  CALCULATOR_PATH,
  HELP_PATH,
  HOME_PATH,
  LEGAL_COOKIES_PATH,
  LEGAL_PRIVACY_PATH,
  LEGAL_TERMS_PATH,
  TRACKS_PATH,
  ROADMAP_PATH,
  MATH_ROADMAP_PATH,
  USER_DASHBOARD_PATH,
  USER_PRACTICE_PATH,
  SUBJECTS,
  getSubjectCatalog,
  getFooterLinkGroups,
  getTopNavItems,
  isMinimalNavPath,
  resolveSubjectSlug,
} from '../routes.js';

export default function Layout({ children, chatHistory, setChatHistory }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();
  const isHub = location.pathname === '/';
  const isAdminArea = location.pathname.startsWith('/admin');
  const isMinimalNav = isMinimalNavPath(location.pathname) || isAdminArea;
  /** Canonical module URL /:subject/:module or legacy /:subject/modules/:module (before redirect). */
  const isModuleExperience = useMemo(() => {
    const reservedSecond = new Set(['calculator', 'roadmap']);
    const parts = location.pathname.split('/').filter(Boolean);
    const subjectSlugs = new Set(getSubjectCatalog().map((s) => s.slug));
    if (parts.length === 2) {
      const [subjectSlug, second] = parts;
      return subjectSlugs.has(subjectSlug) && !reservedSecond.has(second);
    }
    if (parts.length === 3 && parts[1] === 'modules') {
      return subjectSlugs.has(parts[0]);
    }
    return false;
  }, [location.pathname]);
  const isSubjectEntry = /^\/[^/]+\/?$/.test(location.pathname) && location.pathname !== '/' && location.pathname !== '/tracks';
  /** Two-segment subject paths that are not the unified module workspace (e.g. subject-level calculator). */
  const isModuleDashboard = /^\/[^/]+\/[^/]+\/?$/.test(location.pathname) && !isModuleExperience;
  const isRoadmapPage =
    location.pathname === ROADMAP_PATH ||
    location.pathname === MATH_ROADMAP_PATH ||
    /\/roadmap\/?$/.test(location.pathname);
  const isNewUiPage = isModuleExperience || isSubjectEntry || isModuleDashboard || isRoadmapPage;
  const legacyClass = isNewUiPage ? '' : 'legacy';
  const hasSubjectInPath = SUBJECTS.some((subject) => (
    location.pathname === `/${subject.slug}` || location.pathname.startsWith(`/${subject.slug}/`)
  ));
  const activeSubject = hasSubjectInPath ? resolveSubjectSlug(location.pathname) : null;
  const navItems = activeSubject ? getTopNavItems(activeSubject) : [];
  const sectionEntry = navItems.find((item) => item.isSectionsEntry);
  const moduleItems = navItems.filter((item) => !item.isSectionsEntry);
  const { quickLinks, toolLinks } = activeSubject ? getFooterLinkGroups(activeSubject) : { quickLinks: [], toolLinks: [] };
  const isOverviewPage = location.pathname === HOME_PATH || location.pathname === TRACKS_PATH;
  const overviewTrackLinks = getSubjectCatalog()
    .filter((subject) => subject.status === 'active' && subject.calculatorPath)
    .map((subject) => ({
      path: subject.calculatorPath,
      icon: 'fa-layer-group',
      label: subject.label,
    }));
  const legacyPageClass = legacyClass ? 'legacy legacy-page' : '';

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.search]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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

      <header className="site-header sticky top-0 z-50 border-b border-[var(--dmc-border)] bg-[color:color-mix(in_srgb,var(--dmc-bg-card)_92%,transparent)] backdrop-blur-md supports-[backdrop-filter]:bg-[color:color-mix(in_srgb,var(--dmc-bg-card)_88%,transparent)]">
        <div className="flex h-16 w-full items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 font-semibold tracking-tight text-[var(--dmc-text-primary)]" aria-label="Math Lab Platform home">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 dark:bg-indigo-500">
              <i className="fas fa-calculator" />
            </span>
            <span className="hidden sm:inline">Math Lab Platform</span>
          </Link>

          {!isMinimalNav ? (
            <nav className="hidden flex-1 items-center justify-center gap-1 md:flex" aria-label="Main Navigation">
              {moduleItems.map(({ path, icon, label }) => (
                <NavLink
                  key={path}
                  to={path}
                  title={label}
                  aria-label={label}
                  className={({ isActive }) => `inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <i className={`fas ${icon}`} />
                </NavLink>
              ))}

              {sectionEntry ? (
                <NavLink
                  to={sectionEntry.path}
                  title={sectionEntry.label}
                  aria-label={sectionEntry.label}
                  className={({ isActive }) => `ml-2 inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <i className={`fas ${sectionEntry.icon}`} />
                  <span className="hidden lg:inline">{sectionEntry.label}</span>
                </NavLink>
              ) : null}
            </nav>
          ) : (
            <div className="flex-1" />
          )}

          <div className="ml-auto flex items-center gap-1">
            {isAuthenticated ? (
              <>
                {user?.role === 'ADMIN' ? (
                  <NavLink
                    to={ADMIN_CONTENT_PATH}
                    title="Admin panel"
                    aria-label="Admin panel"
                    className={({ isActive }) => `inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <i className="fas fa-shield-halved" />
                  </NavLink>
                ) : null}
                <NavLink
                  to={USER_DASHBOARD_PATH}
                  title="Dashboard"
                  aria-label="Dashboard"
                  className={({ isActive }) => `inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <i className="fas fa-gauge" />
                </NavLink>
                <button
                  type="button"
                  title="Sign out"
                  aria-label="Sign out"
                  onClick={handleLogout}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100"
                >
                  <i className="fas fa-right-from-bracket" />
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to={AUTH_SIGN_IN_PATH}
                  title="Sign in"
                  aria-label="Sign in"
                  className={({ isActive }) => `inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <i className="fas fa-right-to-bracket" />
                </NavLink>
                <NavLink
                  to={AUTH_SIGN_UP_PATH}
                  title="Sign up"
                  aria-label="Sign up"
                  className={({ isActive }) => `inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <i className="fas fa-user-plus" />
                </NavLink>
              </>
            )}

            {!isMinimalNav ? (
              <button
                type="button"
                className="ml-1 inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100 md:hidden"
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                onClick={() => setMobileMenuOpen((o) => !o)}
              >
                <i className={`fas ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`} />
              </button>
            ) : null}
          </div>
        </div>

        {!isMinimalNav && mobileMenuOpen ? (
          <div className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 md:hidden">
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
              <div className="grid gap-2 sm:grid-cols-2">
                {moduleItems.map(({ path, icon, label }) => (
                  <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) => `flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${
                      isActive
                        ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200'
                        : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/40'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <i className={`fas ${icon}`} />
                    <span>{label}</span>
                  </NavLink>
                ))}
                {sectionEntry ? (
                  <NavLink
                    to={sectionEntry.path}
                    className={({ isActive }) => `flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${
                      isActive
                        ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200'
                        : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/40'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <i className={`fas ${sectionEntry.icon}`} />
                    <span>{sectionEntry.label}</span>
                  </NavLink>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </header>

      {/* Page content */}
      <main id="mainContent" tabIndex="-1" aria-label="Main Content" className={legacyPageClass}>
        {children}
      </main>

      <AppFooter
        homePath={HOME_PATH}
        tracksPath={TRACKS_PATH}
        roadmapPath={MATH_ROADMAP_PATH}
        practicePath={USER_PRACTICE_PATH}
        calculatorPath={CALCULATOR_PATH}
        helpPath={HELP_PATH}
        signInPath={AUTH_SIGN_IN_PATH}
        signUpPath={AUTH_SIGN_UP_PATH}
        legalTermsPath={LEGAL_TERMS_PATH}
        legalPrivacyPath={LEGAL_PRIVACY_PATH}
        legalCookiesPath={LEGAL_COOKIES_PATH}
        year={2026}
        onNavigate={handleFooterLinkClick}
        linkGroups={activeSubject ? [
          {
            title: 'Learning Paths',
            links: [
              ...(isOverviewPage ? overviewTrackLinks : quickLinks).map((item) => ({ ...item, label: item.label })),
              ...(!isOverviewPage ? toolLinks.map((item) => ({ ...item, label: item.label })) : []),
            ],
          },
        ] : []}
      />

      <Chatbot chatHistory={chatHistory} setChatHistory={setChatHistory} />
    </ToastProvider>
  );
}
