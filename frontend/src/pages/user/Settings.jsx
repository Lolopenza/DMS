import React, { useEffect, useState } from 'react';
import StateNotice from '../../components/ui/StateNotice.jsx';
import { USER_DASHBOARD_PATH } from '../../routes.js';
import { Link } from 'react-router-dom';
import { Card, CardHeader } from '../../components/ui/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { updateUserProfile } from '../../api.js';

const CAREER_TRACKS = [
  { value: 'NONE', label: 'General IT', description: 'Balanced CS / software engineering framing.' },
  { value: 'BACKEND_ARCHITECT', label: 'Backend Architect', description: 'APIs, databases, distributed systems.' },
  { value: 'DATA_SCIENTIST', label: 'Data Scientist', description: 'ML pipelines, data analysis, statistics.' },
  { value: 'GAME_DEVELOPER', label: 'Game Developer', description: 'Engines, physics, rendering, gameplay math.' },
];

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const [settings, setSettings] = useState({
    emailHints: true,
    weeklyDigest: false,
    compactCards: false,
  });
  const [careerTrack, setCareerTrack] = useState(() => user?.careerTrack || 'NONE');
  const [savingCareer, setSavingCareer] = useState(false);
  const [status, setStatus] = useState({ type: 'info', message: 'Manage your learning preferences and notifications.' });

  useEffect(() => {
    if (user?.careerTrack) {
      setCareerTrack(user.careerTrack);
    }
  }, [user?.careerTrack]);

  function toggle(key) {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    setStatus({ type: 'success', message: 'Preference updated successfully.' });
  }

  async function selectCareerTrack(next) {
    setCareerTrack(next);
    setSavingCareer(true);
    setStatus({ type: 'info', message: 'Saving career track…' });
    try {
      const updated = await updateUserProfile({ careerTrack: next });
      updateProfile(updated);
      setStatus({ type: 'success', message: 'Career track saved. AI practice problems will use this narrative.' });
    } catch (e) {
      setStatus({ type: 'error', message: e.message || 'Could not save career track.' });
    } finally {
      setSavingCareer(false);
    }
  }

  return (
    <section className="min-h-screen bg-[var(--dmc-bg-page)] text-slate-950 dark:text-slate-100">
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

        <div className="mx-auto mt-10 max-w-2xl space-y-8">
          <Card variant="elevated" padding="lg">
            <CardHeader
              title="Career track (AI practice)"
              subtitle="Choose how AI-generated problems are framed. The math stays the same; the story matches your goal."
            />

            <fieldset className="mt-6 space-y-3" disabled={savingCareer || !user}>
              <legend className="sr-only">Career track</legend>
              {CAREER_TRACKS.map((t) => (
                <label
                  key={t.value}
                  className={`flex cursor-pointer flex-col gap-1 rounded-2xl border px-4 py-3 text-sm transition sm:flex-row sm:items-center sm:justify-between ${
                    careerTrack === t.value
                      ? 'border-indigo-500 bg-indigo-50/80 dark:border-indigo-500 dark:bg-indigo-950/40'
                      : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900'
                  }`}
                >
                  <span className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="careerTrack"
                      value={t.value}
                      checked={careerTrack === t.value}
                      onChange={() => selectCareerTrack(t.value)}
                      className="mt-1 h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600"
                    />
                    <span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{t.label}</span>
                      <span className="mt-0.5 block text-xs text-slate-600 dark:text-slate-400">{t.description}</span>
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>
            {!user && (
              <p className="mt-4 text-sm text-amber-800 dark:text-amber-200">
                Sign in to save your career track to your account.
              </p>
            )}
          </Card>

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
