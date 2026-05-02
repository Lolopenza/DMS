import React from 'react';
import { Link } from 'react-router-dom';
import StateNotice from '../../components/ui/StateNotice.jsx';
import { HOME_PATH, AUTH_RESET_PATH, AUTH_SIGN_IN_PATH, LEGAL_COOKIES_PATH, LEGAL_PRIVACY_PATH, LEGAL_TERMS_PATH } from '../../routes.js';
import { Button, Card, CardHeader } from '../../components/ui/index.js';

const supportChannels = [
  {
    icon: 'fa-envelope',
    title: 'General support',
    detail: 'support@mathlab.edu',
    href: 'mailto:support@mathlab.edu',
  },
  {
    icon: 'fa-handshake',
    title: 'Partnerships',
    detail: 'partnerships@mathlab.edu',
    href: 'mailto:partnerships@mathlab.edu',
  },
  {
    icon: 'fa-bug',
    title: 'Integration issues',
    detail: 'integration@mathlab.edu',
    href: 'mailto:integration@mathlab.edu',
  },
];

export default function HelpCenter() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-950 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400" aria-label="Breadcrumb">
          <Link className="hover:text-slate-900 dark:hover:text-slate-100" to={HOME_PATH}>
            Home
          </Link>
          <span className="text-slate-400">/</span>
          <span className="text-slate-900 dark:text-slate-100">Help Center</span>
        </nav>

        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Support
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Help & Support</h1>
          <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-400">
            Get help, reach our support team, and explore your account options.
          </p>
        </header>

        <section className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {supportChannels.map((channel) => (
            <a
              key={channel.title}
              href={channel.href}
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30 transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:shadow-none dark:hover:bg-slate-900"
            >
              <div className="flex items-start gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 dark:bg-indigo-500">
                  <i className={`fas ${channel.icon}`} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{channel.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{channel.detail}</p>
                </div>
              </div>
            </a>
          ))}
        </section>

        <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card variant="elevated" padding="lg">
            <CardHeader title="Get in touch" subtitle="Account-related actions and access links." />
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to={AUTH_SIGN_IN_PATH} className="sm:flex-1">
                <Button className="w-full">
                  <i className="fas fa-right-to-bracket mr-2" /> Sign in to account
                </Button>
              </Link>
              <Link to={AUTH_RESET_PATH} className="sm:flex-1">
                <Button variant="secondary" className="w-full">
                  <i className="fas fa-key mr-2" /> Reset my password
                </Button>
              </Link>
            </div>
            <div className="mt-6">
              <StateNotice
                type="info"
                title="Support status"
                message="Support channels are active and routed to the release support desk. Responses are handled during the current integration window."
              />
            </div>
          </Card>

          <Card variant="elevated" padding="lg">
            <CardHeader title="Legal policies" subtitle="Review our policies and compliance details." />
            <div className="mt-6 flex flex-col gap-3">
              <Link to={LEGAL_TERMS_PATH}>
                <Button variant="outline" className="w-full">Read Terms of Use</Button>
              </Link>
              <Link to={LEGAL_PRIVACY_PATH}>
                <Button variant="outline" className="w-full">Review Privacy Policy</Button>
              </Link>
              <Link to={LEGAL_COOKIES_PATH}>
                <Button variant="outline" className="w-full">Manage Cookie Settings</Button>
              </Link>
            </div>
          </Card>
        </section>
      </div>
    </section>
  );
}
