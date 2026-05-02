import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AUTH_SIGN_IN_PATH, USER_DASHBOARD_PATH } from '../../routes.js';
import { useAuth } from '../../context/AuthContext.jsx';
import StateNotice from '../../components/ui/StateNotice.jsx';
import { Button, Card, CardHeader, Input } from '../../components/ui/index.js';

export default function SignUp() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [status, setStatus] = useState({ type: 'info', message: '' });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim() || !form.confirmPassword.trim()) {
      setStatus({ type: 'error', message: 'All account fields are required.' });
      return;
    }
    if (form.password.length < 8) {
      setStatus({ type: 'error', message: 'Use at least 8 characters in the password.' });
      return;
    }
    if (form.password !== form.confirmPassword) {
      setStatus({ type: 'error', message: 'Password and confirmation must match.' });
      return;
    }

    setSubmitting(true);
    setStatus({ type: 'loading', message: 'Creating your account and preparing your dashboard...' });
    try {
      await register({
        name: form.name,
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      navigate(USER_DASHBOARD_PATH, { replace: true });
    } catch (error) {
      setStatus({ type: 'error', message: error?.message || 'Sign up failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="min-h-screen bg-[var(--dmc-bg-page)] text-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Account</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Create an account</h1>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
            Create your account to continue your personalized learning workflow.
          </p>
        </header>

        <div className="mx-auto mt-10 max-w-xl">
          <Card variant="elevated" padding="lg">
            <CardHeader title="New account" subtitle="Basic profile and sign-in credentials." />

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <Input
                id="signUpName"
                label="Name"
                type="text"
                autoComplete="name"
                required
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
              <Input
                id="signUpEmail"
                label="Email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              />
              <Input
                id="signUpPassword"
                label="Password"
                type="password"
                autoComplete="new-password"
                required
                hint="At least 8 characters."
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              />
              <Input
                id="signUpConfirmPassword"
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                required
                value={form.confirmPassword}
                onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              />

              <Button type="submit" loading={submitting} loadingLabel="Creating account..." className="w-full">
                <i className="fas fa-check mr-2" /> Create account
              </Button>

              <Link to={AUTH_SIGN_IN_PATH}>
                <Button variant="secondary" className="w-full">
                  <i className="fas fa-right-to-bracket mr-2" /> I already have an account
                </Button>
              </Link>
            </form>

            <div className="mt-6">
              <StateNotice type={status.type} title="Sign up status" message={status.message} />
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
