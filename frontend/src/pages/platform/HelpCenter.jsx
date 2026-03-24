import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumb.jsx';
import StateNotice from '../../components/ui/StateNotice.jsx';
import { HOME_PATH, AUTH_RESET_PATH, AUTH_SIGN_IN_PATH, LEGAL_COOKIES_PATH, LEGAL_PRIVACY_PATH, LEGAL_TERMS_PATH } from '../../routes.js';

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
      <Breadcrumb items={[
        { label: 'Home', href: HOME_PATH },
        { label: 'Help Center' }
      ]} />

      <div className="page-title">
        <h1><i className="fas fa-circle-question"></i> Help & Support</h1>
        <p className="subtitle">Get help, reach our support team, and explore your account options</p>
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
          <h2><i className="fas fa-life-ring"></i> Get in Touch</h2>
        </div>
        <div className="card-body" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link className="btn btn-primary" to={AUTH_SIGN_IN_PATH}>
            <i className="fas fa-right-to-bracket"></i> Sign In to Account
          </Link>
          <Link className="btn btn-outline" to={AUTH_RESET_PATH}>
            <i className="fas fa-key"></i> Reset My Password
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
          <h2><i className="fas fa-gavel"></i> Legal Policies</h2>
        </div>
        <div className="card-body" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link className="btn btn-outline" to={LEGAL_TERMS_PATH}>Read Terms of Use</Link>
          <Link className="btn btn-outline" to={LEGAL_PRIVACY_PATH}>Review Privacy Policy</Link>
          <Link className="btn btn-outline" to={LEGAL_COOKIES_PATH}>Manage Cookie Settings</Link>
        </div>
      </div>
    </div>
  );
}
