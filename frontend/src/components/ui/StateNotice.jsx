import React from 'react';

const STYLE_BY_TYPE = {
  loading: {
    icon: <i className="fas fa-spinner fa-spin" />,
    wrapper:
      'border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100',
    accent: 'bg-indigo-600 text-white dark:bg-indigo-500',
  },
  success: {
    icon: <i className="fas fa-circle-check" />,
    wrapper:
      'border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100',
    accent: 'bg-emerald-600 text-white dark:bg-emerald-500',
  },
  error: {
    icon: <i className="fas fa-triangle-exclamation" />,
    wrapper:
      'border-red-200 bg-red-50 text-red-950 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100',
    accent: 'bg-red-600 text-white dark:bg-red-500',
  },
  info: {
    icon: <i className="fas fa-circle-info" />,
    wrapper:
      'border-indigo-200 bg-indigo-50 text-indigo-950 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-100',
    accent: 'bg-indigo-600 text-white dark:bg-indigo-500',
  },
};

export default function StateNotice({ type = 'info', title = 'Status', message }) {
  if (!message) return null;

  const style = STYLE_BY_TYPE[type] || STYLE_BY_TYPE.info;

  return (
    <div className={`rounded-2xl border px-5 py-4 ${style.wrapper}`} role={type === 'error' ? 'alert' : 'status'} aria-live="polite">
      <div className="flex items-start gap-4">
        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl shadow-sm ${style.accent}`}>
          {style.icon}
        </span>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-sm leading-6 opacity-90">{message}</p>
        </div>
      </div>
    </div>
  );
}