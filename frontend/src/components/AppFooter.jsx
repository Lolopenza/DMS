import React from 'react';
import { Link } from 'react-router-dom';

export default function AppFooter({
  homePath = '/',
  tracksPath = '/tracks',
  roadmapPath = '/math-roadmap',
  practicePath = '/practice-lab',
  calculatorPath = '/calculator',
  helpPath = '/help',
  signInPath = '/auth/sign-in',
  signUpPath = '/auth/sign-up',
  legalTermsPath = '/legal/terms',
  legalPrivacyPath = '/legal/privacy',
  legalCookiesPath = '/legal/cookies',
  year = new Date().getFullYear(),
  linkGroups = [],
  onNavigate,
}) {
  return (
    <footer className="mt-14 border-t border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-3 text-base font-semibold text-slate-900 dark:text-slate-100">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/20">
                <i className="fas fa-calculator" />
              </span>
              <span>Math Lab Platform</span>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
              Learn faster with focused tracks, interactive calculators, and a personal practice lab built for real problem solving.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200">
              <i className="fas fa-circle-check" />
              <span>Core learning tools are live and ready for daily practice</span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-500">Quick Start</p>
            <ul className="space-y-2 text-sm">
              <li><Link to={homePath} onClick={onNavigate} className="footer-link"><i className="fas fa-house" /> Home</Link></li>
              <li><Link to={tracksPath} onClick={onNavigate} className="footer-link"><i className="fas fa-layer-group" /> Tracks</Link></li>
              <li><Link to={roadmapPath} onClick={onNavigate} className="footer-link"><i className="fas fa-route" /> Learning Roadmap</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-500">Practice</p>
            <ul className="space-y-2 text-sm">
              <li><Link to={practicePath} onClick={onNavigate} className="footer-link"><i className="fas fa-wand-magic-sparkles" /> Personal practice lab</Link></li>
              <li><Link to={calculatorPath} onClick={onNavigate} className="footer-link"><i className="fas fa-calculator" /> Topic calculators</Link></li>
              <li><Link to={helpPath} onClick={onNavigate} className="footer-link"><i className="fas fa-circle-question" /> Help center</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-500">Support</p>
            <ul className="space-y-2 text-sm">
              <li><Link to={signInPath} onClick={onNavigate} className="footer-link"><i className="fas fa-right-to-bracket" /> Sign in</Link></li>
              <li><Link to={signUpPath} onClick={onNavigate} className="footer-link"><i className="fas fa-user-plus" /> Sign up</Link></li>
              <li><a href="mailto:support@mathlab.edu" className="footer-link"><i className="fas fa-envelope" /> support@mathlab.edu</a></li>
              <li><a href="mailto:partnerships@mathlab.edu" className="footer-link"><i className="fas fa-handshake" /> partnerships@mathlab.edu</a></li>
            </ul>
          </div>
        </div>

        {linkGroups?.length ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {linkGroups.map((group) => (
              <div key={group.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/30">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{group.title}</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  {group.links.map((item) => (
                    <li key={item.path || item.label}>
                      {item.path ? (
                        <Link to={item.path} onClick={onNavigate} className="footer-link">
                          {item.icon ? <i className={`fas ${item.icon}`} /> : null} {item.label}
                        </Link>
                      ) : (
                        <span>{item.label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-12 flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950">
              <i className="fas fa-calculator" />
            </span>
            <span>Built for focused, practical math learning</span>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to={legalTermsPath} onClick={onNavigate} className="footer-link">Terms</Link>
            <Link to={legalPrivacyPath} onClick={onNavigate} className="footer-link">Privacy</Link>
            <Link to={legalCookiesPath} onClick={onNavigate} className="footer-link">Cookies</Link>
            <span className="text-slate-400 dark:text-slate-600">© {year}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

