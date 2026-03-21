import React, { useState } from 'react';
import StateNotice from '../../components/ui/StateNotice.jsx';

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
    <div className="container">
      <div className="page-title">
        <h2>Settings</h2>
        <p className="subtitle">Control your notifications and interface preferences</p>
      </div>

      <div className="card" style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div className="card-header">
          <h3><i className="fas fa-sliders"></i> Preferences</h3>
        </div>
        <div className="card-body">
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input id="emailHints" type="checkbox" checked={settings.emailHints} onChange={() => toggle('emailHints')} />
            <label htmlFor="emailHints" style={{ margin: 0 }}>Email hints about weak topics</label>
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input id="weeklyDigest" type="checkbox" checked={settings.weeklyDigest} onChange={() => toggle('weeklyDigest')} />
            <label htmlFor="weeklyDigest" style={{ margin: 0 }}>Weekly progress digest</label>
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input id="compactCards" type="checkbox" checked={settings.compactCards} onChange={() => toggle('compactCards')} />
            <label htmlFor="compactCards" style={{ margin: 0 }}>Compact dashboard cards</label>
          </div>

          <StateNotice type={status.type} title="Settings status" message={status.message} />
        </div>
      </div>
    </div>
  );
}
