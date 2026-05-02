import React from 'react';

/** Maps legacy `tone` prop (pages) to palette `variant`. */
const TONE_TO_VARIANT = {
  success: 'emerald',
  neutral: 'slate',
  warning: 'amber',
  danger: 'red',
};

export default function Badge({ variant = 'slate', tone, size = 'md', className = '', children }) {
  const resolvedVariant = tone ? (TONE_TO_VARIANT[tone] ?? 'slate') : variant;
  const base = 'inline-flex items-center rounded-full border font-semibold';
  const sizes = {
    sm: 'px-2.5 py-1 text-[11px] tracking-wide',
    md: 'px-3 py-1.5 text-xs',
  };

  const variants = {
    slate: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200',
    indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200',
    amber: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200',
    red: 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200',
  };

  return (
    <span className={`${base} ${sizes[size]} ${variants[resolvedVariant]} ${className}`}>
      {children}
    </span>
  );
}

