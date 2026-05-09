import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Primary CTA for opening a subject calculator — same look everywhere (tracks, roadmaps, maps).
 */
export default function OpenCalculatorLink({
  to,
  children = 'Open calculator',
  fullWidth = true,
  size = 'md',
  className = '',
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:bg-indigo-500 dark:text-white dark:shadow-indigo-500/15 dark:hover:bg-indigo-400 dark:focus:ring-indigo-400 dark:focus:ring-offset-slate-950';

  const sizes = {
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  const width = fullWidth ? 'w-full' : '';

  return (
    <Link to={to} className={`${base} ${sizes[size] || sizes.md} ${width} ${className}`.trim()}>
      <i className="fas fa-calculator" aria-hidden />
      {children}
    </Link>
  );
}
