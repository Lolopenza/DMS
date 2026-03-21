import React from 'react';

export function ModulePage({ title, subtitle, children }) {
  return (
    <div className="container">
      <div className="page-title">
        <h2>{title}</h2>
        {subtitle ? <p className="subtitle">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}

export function ModuleCard({ title, icon, children }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3>
          {icon ? <i className={`fas ${icon}`}></i> : null}
          {icon ? ' ' : ''}
          {title}
        </h3>
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}
