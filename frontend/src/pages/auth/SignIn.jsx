import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AUTH_RESET_PATH, AUTH_SIGN_UP_PATH, USER_DASHBOARD_PATH } from '../../routes.js';
import { useAuth } from '../../context/AuthContext.jsx';
import StateNotice from '../../components/ui/StateNotice.jsx';
import { Button, Card, CardHeader, Input } from '../../components/ui/index.js';

export default function SignIn() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState({ type: 'info', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const targetPath = location.state?.from || USER_DASHBOARD_PATH;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.email.trim() || !form.password.trim()) {
      setStatus({ type: 'error', message: 'Please fill in email and password.' });
      return;
    }

    setSubmitting(true);
    setStatus({ type: 'loading', message: 'Signing in and preparing your dashboard...' });
    try {
      await login({ email: form.email, password: form.password });
      navigate(targetPath, { replace: true });
    } catch (error) {
      setStatus({ type: 'error', message: error?.message || 'Sign in failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="min-h-screen bg-[var(--dmc-bg-page)] text-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Account</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Sign in</h1>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
            Sign in to continue your learning progress and account activity.
          </p>
        </header>

        <div className="mx-auto mt-10 max-w-xl">
          <Card variant="elevated" padding="lg">
            <CardHeader title="Account access" subtitle="Use your email and password." />

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <Input
                id="signInEmail"
                label="Email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              />
              <Input
                id="signInPassword"
                label="Password"
                type="password"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              />

              <Button type="submit" loading={submitting} loadingLabel="Signing in..." className="w-full">
                <i className="fas fa-arrow-right-to-bracket mr-2" /> Sign in
              </Button>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Link to={AUTH_RESET_PATH} className="sm:flex-1">
                  <Button variant="secondary" className="w-full">
                    <i className="fas fa-key mr-2" /> Reset password
                  </Button>
                </Link>
                <Link to={AUTH_SIGN_UP_PATH} className="sm:flex-1">
                  <Button variant="outline" className="w-full">
                    <i className="fas fa-user-plus mr-2" /> Create account
                  </Button>
                </Link>
              </div>
            </form>

            <div className="mt-6">
              <StateNotice type={status.type} title="Sign in status" message={status.message} />
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
