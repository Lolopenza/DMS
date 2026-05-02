import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import StateNotice from '../../components/ui/StateNotice.jsx';
import { USER_DASHBOARD_PATH } from '../../routes.js';
import { Link } from 'react-router-dom';
import { Button, Card, CardHeader, Input, Textarea } from '../../components/ui/index.js';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || user?.username || '');
  const [goal, setGoal] = useState(user?.goal || '');
  const [status, setStatus] = useState({ type: 'info', message: '' });

  function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim()) {
      setStatus({ type: 'error', message: 'Name cannot be empty.' });
      return;
    }
    updateProfile({ name, username: name, goal });
    setStatus({ type: 'success', message: 'Profile updated successfully.' });
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-950 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400" aria-label="Breadcrumb">
          <Link className="hover:text-slate-900 dark:hover:text-slate-100" to={USER_DASHBOARD_PATH}>
            Dashboard
          </Link>
          <span className="text-slate-400">/</span>
          <span className="text-slate-900 dark:text-slate-100">Profile</span>
        </nav>

        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Account</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">My Profile</h1>
          <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-400">
            Manage your personal information and learning preferences.
          </p>
        </header>

        <div className="mx-auto mt-10 max-w-2xl">
          <Card variant="elevated" padding="lg">
            <CardHeader title="Personal information" subtitle="Keep your profile up to date." />

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <Input
                id="profileName"
                label="Name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Textarea
                id="profileGoal"
                label="Current learning goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                rows={4}
                placeholder="Example: finish Discrete Math intro modules this week"
              />

              <Button type="submit" className="w-full">
                <i className="fas fa-check-circle mr-2" /> Save changes
              </Button>
            </form>

            <div className="mt-6">
              <StateNotice type={status.type} title="Profile status" message={status.message} />
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
