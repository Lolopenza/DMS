import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import Breadcrumb from '../../components/Breadcrumb.jsx';
import StateNotice from '../../components/ui/StateNotice.jsx';
import { USER_DASHBOARD_PATH } from '../../routes.js';

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
    <div className="container">
      <Breadcrumb items={[
        { label: 'Dashboard', href: USER_DASHBOARD_PATH },
        { label: 'Profile' }
      ]} />
      
      <div className="page-title">
        <h1><i className="fas fa-user-circle"></i> My Profile</h1>
        <p className="subtitle">Manage your personal information and learning preferences</p>
      </div>

      <div className="card" style={{ maxWidth: '680px', margin: '0 auto' }}>
        <div className="card-header">
          <h2><i className="fas fa-id-badge"></i> Personal Information</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="profileName">Name</label>
              <input id="profileName" className="form-control" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="profileGoal">Current learning goal</label>
              <textarea id="profileGoal" className="form-control" value={goal} onChange={(e) => setGoal(e.target.value)} rows={3} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              <i className="fas fa-check-circle"></i> Save Changes
            </button>
          </form>

          <StateNotice type={status.type} title="Profile status" message={status.message} />
        </div>
      </div>
    </div>
  );
}
