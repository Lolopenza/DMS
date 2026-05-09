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
    <footer className="relative mt-16 border-t border-slate-200/90 bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-700 dark:border-slate-800/90 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:text-slate-200">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="space-y-5 lg:col-span-5">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-lg text-white shadow-lg shadow-indigo-600/25 dark:from-indigo-500 dark:to-violet-600 dark:shadow-indigo-500/20">
                <i className="fas fa-calculator" aria-hidden />
              </span>
              <div>
                <p className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">Math Lab Platform</p>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  Learn faster with focused tracks, interactive calculators, and a personal practice lab built for real
                  problem solving.
                </p>
              </div>
            </div>
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-emerald-200/90 bg-emerald-50/90 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-100">
              <i className="fas fa-circle-check text-emerald-600 dark:text-emerald-400" aria-hidden />
              <span>Core learning tools are live and ready for daily practice</span>
            </div>
          </div>

          <div className="grid min-w-0 gap-8 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white/60 p-5 shadow-sm shadow-slate-200/40 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/40 dark:shadow-none">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Quick Start
              </p>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link to={homePath} onClick={onNavigate} className="footer-link">
                    <i className="fas fa-house w-5 text-center text-slate-400 dark:text-slate-500" aria-hidden />
                    Home
                  </Link>
                </li>
                <li>
                  <Link to={tracksPath} onClick={onNavigate} className="footer-link">
                    <i className="fas fa-layer-group w-5 text-center text-slate-400 dark:text-slate-500" aria-hidden />
                    Tracks
                  </Link>
                </li>
                <li>
                  <Link to={roadmapPath} onClick={onNavigate} className="footer-link">
                    <i className="fas fa-route w-5 text-center text-slate-400 dark:text-slate-500" aria-hidden />
                    Learning Roadmap
                  </Link>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/60 p-5 shadow-sm shadow-slate-200/40 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/40 dark:shadow-none">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Practice
              </p>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link to={practicePath} onClick={onNavigate} className="footer-link">
                    <i className="fas fa-wand-magic-sparkles w-5 text-center text-slate-400 dark:text-slate-500" aria-hidden />
                    Personal practice lab
                  </Link>
                </li>
                <li>
                  <Link to={calculatorPath} onClick={onNavigate} className="footer-link">
                    <i className="fas fa-calculator w-5 text-center text-slate-400 dark:text-slate-500" aria-hidden />
                    Topic calculators
                  </Link>
                </li>
                <li>
                  <Link to={helpPath} onClick={onNavigate} className="footer-link">
                    <i className="fas fa-circle-question w-5 text-center text-slate-400 dark:text-slate-500" aria-hidden />
                    Help center
                  </Link>
                </li>
              </ul>
            </div>

            <div className="min-w-0 rounded-2xl border border-slate-200/80 bg-white/60 p-5 shadow-sm shadow-slate-200/40 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/40 dark:shadow-none sm:col-span-2 lg:col-span-1">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Support
              </p>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link to={signInPath} onClick={onNavigate} className="footer-link">
                    <i className="fas fa-right-to-bracket w-5 text-center text-slate-400 dark:text-slate-500" aria-hidden />
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link to={signUpPath} onClick={onNavigate} className="footer-link">
                    <i className="fas fa-user-plus w-5 text-center text-slate-400 dark:text-slate-500" aria-hidden />
                    Sign up
                  </Link>
                </li>
              </ul>
              <div className="mt-5 space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700/80">
                <a
                  href="mailto:support@mathlab.edu"
                  className="flex min-w-0 items-start gap-2 rounded-lg text-xs text-slate-600 transition-colors hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-slate-400 dark:hover:text-slate-100 dark:focus-visible:ring-indigo-500 dark:focus-visible:ring-offset-slate-950"
                >
                  <i
                    className="fas fa-envelope mt-0.5 w-5 shrink-0 text-center text-indigo-500 dark:text-indigo-400"
                    aria-hidden
                  />
                  <span className="min-w-0 break-words [overflow-wrap:anywhere] leading-snug">support@mathlab.edu</span>
                </a>
                <a
                  href="mailto:partnerships@mathlab.edu"
                  className="flex min-w-0 items-start gap-2 rounded-lg text-xs text-slate-600 transition-colors hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-slate-400 dark:hover:text-slate-100 dark:focus-visible:ring-indigo-500 dark:focus-visible:ring-offset-slate-950"
                >
                  <i
                    className="fas fa-handshake mt-0.5 w-5 shrink-0 text-center text-indigo-500 dark:text-indigo-400"
                    aria-hidden
                  />
                  <span className="min-w-0 break-words [overflow-wrap:anywhere] leading-snug">partnerships@mathlab.edu</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {linkGroups?.length ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {linkGroups.map((group) => (
              <div
                key={group.title}
                className="rounded-2xl border border-indigo-200/60 bg-indigo-50/40 p-5 dark:border-indigo-500/20 dark:bg-indigo-500/[0.07]"
              >
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

        <div className="mt-14 flex flex-col gap-6 border-t border-slate-200/90 pt-8 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950">
              <i className="fas fa-graduation-cap text-sm" aria-hidden />
            </span>
            <span className="font-medium text-slate-800 dark:text-slate-200">Built for focused, practical math learning</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-1 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
            <Link to={legalTermsPath} onClick={onNavigate} className="rounded-lg px-2 py-1 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100">
              Terms
            </Link>
            <span className="px-1 text-slate-300 dark:text-slate-600" aria-hidden>
              ·
            </span>
            <Link to={legalPrivacyPath} onClick={onNavigate} className="rounded-lg px-2 py-1 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100">
              Privacy
            </Link>
            <span className="px-1 text-slate-300 dark:text-slate-600" aria-hidden>
              ·
            </span>
            <Link to={legalCookiesPath} onClick={onNavigate} className="rounded-lg px-2 py-1 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100">
              Cookies
            </Link>
            <span className="ml-2 text-slate-400 dark:text-slate-500">© {year}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
