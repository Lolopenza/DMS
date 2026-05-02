import React, { useState } from 'react';
import StateNotice from '../../components/ui/StateNotice.jsx';
import { USER_DASHBOARD_PATH } from '../../routes.js';
import { Link } from 'react-router-dom';
import { Card, CardHeader } from '../../components/ui/index.js';

export default function Settings() {
  const [settings, setSettings] = useState({
    emailHints: true,
    weeklyDigest: false,
    compactCards: false,
  });
  const [status, setStatus] = useState({ type: 'info', message: 'Manage your learning preferences and notifications.' });

  function toggle(key) {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    setStatus({ type: 'success', message: 'Preference updated successfully.' });
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-950 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400" aria-label="Breadcrumb">
          <Link className="hover:text-slate-900 dark:hover:text-slate-100" to={USER_DASHBOARD_PATH}>
            Dashboard
          </Link>
          <span className="text-slate-400">/</span>
          <span className="text-slate-900 dark:text-slate-100">Settings</span>
        </nav>

        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Account</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Preferences</h1>
          <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-400">
            Customize your learning experience and notification settings.
          </p>
        </header>

        <div className="mx-auto mt-10 max-w-2xl">
          <Card variant="elevated" padding="lg">
            <CardHeader title="Notification & display settings" subtitle="Update preferences instantly." />

            <div className="mt-6 space-y-4">
              {[
                { key: 'emailHints', label: 'Email hints about weak topics' },
                { key: 'weeklyDigest', label: 'Weekly progress digest' },
                { key: 'compactCards', label: 'Compact dashboard cards' },
              ].map((item) => (
                <label
                  key={item.key}
                  htmlFor={item.key}
                  className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  <span className="font-medium">{item.label}</span>
                  <input
                    id={item.key}
                    type="checkbox"
                    checked={settings[item.key]}
                    onChange={() => toggle(item.key)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700"
                  />
                </label>
              ))}
            </div>

            <div className="mt-6">
              <StateNotice type={status.type} title="Settings status" message={status.message} />
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
