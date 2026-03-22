import React from 'react';
import { Link } from 'react-router-dom';
import StateNotice from '../../components/ui/StateNotice.jsx';
import {
  AUTH_RESET_PATH,
  AUTH_SIGN_IN_PATH,
  LEGAL_COOKIES_PATH,
  LEGAL_PRIVACY_PATH,
  LEGAL_TERMS_PATH,
} from '../../routes.js';

const supportChannels = [
  {
    icon: 'fa-envelope',
    title: 'General support',
    detail: 'support@mathlab.edu',
    href: 'mailto:support@mathlab.edu',
  },
  {
    icon: 'fa-handshake',
    title: 'Partnerships',
    detail: 'partnerships@mathlab.edu',
    href: 'mailto:partnerships@mathlab.edu',
  },
  {
    icon: 'fa-bug',
    title: 'Integration issues',
    detail: 'integration@mathlab.edu',
    href: 'mailto:integration@mathlab.edu',
  },
];

export default function HelpCenter() {
  return (
    <div className="container">
      <div className="page-title">
        <h2>Help Center</h2>
        <p className="subtitle">Get support, quick account help, and policy references</p>
      </div>

      <div className="features-grid" style={{ marginBottom: '1.5rem' }}>
        {supportChannels.map((channel) => (
          <a key={channel.title} className="feature-card" href={channel.href}>
            <div className="icon"><i className={`fas ${channel.icon}`}></i></div>
            <div className="content">
              <h3>{channel.title}</h3>
              <p>{channel.detail}</p>
            </div>
          </a>
        ))}
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3><i className="fas fa-life-ring"></i> Quick account actions</h3>
        </div>
        <div className="card-body" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link className="btn btn-primary" to={AUTH_SIGN_IN_PATH}>
            <i className="fas fa-right-to-bracket"></i> Sign in
          </Link>
          <Link className="btn btn-outline" to={AUTH_RESET_PATH}>
            <i className="fas fa-key"></i> Reset password
          </Link>
        </div>
      </div>

      <StateNotice
        type="info"
        title="Support status"
        message="Support channels are active and routed to the release support desk. Responses are handled during the current integration window."
      />

      <div className="card">
        <div className="card-header">
          <h3><i className="fas fa-gavel"></i> Legal references</h3>
        </div>
        <div className="card-body" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link className="btn btn-outline" to={LEGAL_TERMS_PATH}>Terms of use</Link>
          <Link className="btn btn-outline" to={LEGAL_PRIVACY_PATH}>Privacy policy</Link>
          <Link className="btn btn-outline" to={LEGAL_COOKIES_PATH}>Cookie policy</Link>
        </div>
      </div>
    </div>
  );
}
