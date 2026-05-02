import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Breadcrumb Navigation Component
 * @param {Object} props
 * @param {Array<{label: string, href?: string}>} props.items - Breadcrumb items
 */
export default function Breadcrumb({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href ? (
                <Link className="hover:text-slate-900 dark:hover:text-slate-100" to={item.href}>
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-900 dark:text-slate-100">{item.label}</span>
              )}
              {!isLast ? <span className="text-slate-400">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
