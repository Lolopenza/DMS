import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AUTH_SIGN_IN_PATH } from '../../routes.js';
import StateNotice from '../../components/ui/StateNotice.jsx';
import { requestPasswordReset } from '../../api.js';
import { Button, Card, CardHeader, Input } from '../../components/ui/index.js';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: 'info', message: '' });

  async function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setStatus({ type: 'error', message: 'Enter a valid email address to receive reset instructions.' });
      return;
    }
    setStatus({ type: 'loading', message: 'Sending reset instructions...' });
    try {
      await requestPasswordReset(email);
      setStatus({ type: 'success', message: `If an account exists for this email, reset instructions were sent to: ${email}` });
    } catch (error) {
      setStatus({ type: 'error', message: error?.message || 'Failed to send reset instructions.' });
    }
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-950 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Account</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Reset password</h1>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
            Recover access to your account securely.
          </p>
        </header>

        <div className="mx-auto mt-10 max-w-xl">
          <Card variant="elevated" padding="lg">
            <CardHeader title="Recovery" subtitle="We will email you a reset link if an account exists." />

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <Input
                id="resetEmail"
                label="Email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Button type="submit" loading={status.type === 'loading'} loadingLabel="Sending..." className="w-full">
                <i className="fas fa-paper-plane mr-2" /> Send reset link
              </Button>
            </form>

            <div className="mt-6">
              <StateNotice type={status.type} title="Reset status" message={status.message} />
            </div>

            <div className="mt-6">
              <Link to={AUTH_SIGN_IN_PATH}>
                <Button variant="secondary" className="w-full">
                  <i className="fas fa-arrow-left mr-2" /> Back to sign in
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
