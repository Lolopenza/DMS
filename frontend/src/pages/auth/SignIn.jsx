import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AUTH_RESET_PATH, AUTH_SIGN_UP_PATH, USER_DASHBOARD_PATH } from '../../routes.js';
import { useAuth } from '../../context/AuthContext.jsx';
import StateNotice from '../../components/ui/StateNotice.jsx';

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
    await new Promise((resolve) => setTimeout(resolve, 200));

    login({ email: form.email });
    navigate(targetPath, { replace: true });
  }

  return (
    <div className="container">
      <div className="page-title">
        <h2>Sign in</h2>
        <p className="subtitle">Sign in to continue your learning progress and account activity</p>
      </div>

      <div className="card" style={{ maxWidth: '520px', margin: '0 auto' }}>
        <div className="card-header">
          <h3><i className="fas fa-right-to-bracket"></i> Account access</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="signInEmail">Email</label>
              <input
                id="signInEmail"
                className="form-control"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="signInPassword">Password</label>
              <input
                id="signInPassword"
                className="form-control"
                type="password"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                <i className="fas fa-arrow-right-to-bracket"></i> Sign in
              </button>
              <Link to={AUTH_RESET_PATH} className="btn btn-outline">
                <i className="fas fa-key"></i> Reset password
              </Link>
              <Link to={AUTH_SIGN_UP_PATH} className="btn btn-outline">
                <i className="fas fa-user-plus"></i> Create account
              </Link>
            </div>
          </form>
          <StateNotice type={status.type} title="Sign in status" message={status.message} />
        </div>
      </div>
    </div>
  );
}
