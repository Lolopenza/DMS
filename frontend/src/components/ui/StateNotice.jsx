import React from 'react';

const ICON_BY_TYPE = {
  loading: 'fa-spinner fa-spin',
  success: 'fa-circle-check',
  error: 'fa-triangle-exclamation',
  info: 'fa-circle-info',
};

export default function StateNotice({ type = 'info', title, message }) {
  if (!message) return null;

  const icon = ICON_BY_TYPE[type] || ICON_BY_TYPE.info;

  return (
    <div className={`ui-state ui-state-${type}`} role={type === 'error' ? 'alert' : 'status'} aria-live="polite">
      <h3>
        <i className={`fas ${icon}`}></i> {title || 'Status'}
      </h3>
      <div className="ui-state-message">{message}</div>
    </div>
  );
}