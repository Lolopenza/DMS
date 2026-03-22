import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AUTH_SIGN_IN_PATH, USER_DASHBOARD_PATH } from '../../routes.js';
import { useAuth } from '../../context/AuthContext.jsx';
import StateNotice from '../../components/ui/StateNotice.jsx';
import { simulateNetworkDelay } from '../../utils/routeHelpers.js';

export default function SignUp() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [status, setStatus] = useState({ type: 'info', message: '' });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setStatus({ type: 'error', message: 'All account fields are required.' });
      return;
    }
    if (form.password.length < 6) {
      setStatus({ type: 'error', message: 'Use at least 6 characters in the password.' });
      return;
    }

    setSubmitting(true);
    setStatus({ type: 'loading', message: 'Creating your account and preparing your dashboard...' });
    await simulateNetworkDelay();

    login({ email: form.email, name: form.name });
    navigate(USER_DASHBOARD_PATH, { replace: true });
  }

  return (
    <div className="container">
      <div className="page-title">
        <h2>Sign up</h2>
        <p className="subtitle">Create your account to continue your personalized learning workflow</p>
      </div>

      <div className="card" style={{ maxWidth: '560px', margin: '0 auto' }}>
        <div className="card-header">
          <h3><i className="fas fa-user-plus"></i> New account</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="signUpName">Name</label>
              <input
                id="signUpName"
                className="form-control"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="signUpEmail">Email</label>
              <input
                id="signUpEmail"
                className="form-control"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="signUpPassword">Password</label>
              <input
                id="signUpPassword"
                className="form-control"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                <i className="fas fa-check"></i> Create account
              </button>
              <Link to={AUTH_SIGN_IN_PATH} className="btn btn-outline">
                <i className="fas fa-right-to-bracket"></i> I already have an account
              </Link>
            </div>
          </form>
          <StateNotice type={status.type} title="Sign up status" message={status.message} />
        </div>
      </div>
    </div>
  );
}
