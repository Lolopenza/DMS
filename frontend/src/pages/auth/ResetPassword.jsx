import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AUTH_SIGN_IN_PATH } from '../../routes.js';
import StateNotice from '../../components/ui/StateNotice.jsx';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: 'info', message: '' });

  function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setStatus({ type: 'error', message: 'Enter a valid email address to receive reset instructions.' });
      return;
    }
    setStatus({ type: 'success', message: `If an account exists for this email, reset instructions were sent to: ${email}` });
  }

  return (
    <div className="container">
      <div className="page-title">
        <h2>Reset password</h2>
        <p className="subtitle">Recover access to your account securely</p>
      </div>

      <div className="card" style={{ maxWidth: '520px', margin: '0 auto' }}>
        <div className="card-header">
          <h3><i className="fas fa-key"></i> Recovery</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="resetEmail">Email</label>
              <input
                id="resetEmail"
                className="form-control"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.75rem' }}>
              <i className="fas fa-paper-plane"></i> Send reset link
            </button>
          </form>

          <StateNotice type={status.type} title="Reset status" message={status.message} />

          <div style={{ marginTop: '1rem' }}>
            <Link to={AUTH_SIGN_IN_PATH} className="btn btn-outline">
              <i className="fas fa-arrow-left"></i> Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
