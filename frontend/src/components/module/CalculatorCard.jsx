import React from 'react';

/**
 * Premium calculator card wrapper with dark mode support.
 * Provides consistent layout for all calculator modules.
 */
export default function CalculatorCard({
  title,
  description,
  children,
  resultComponent = null,
  layout = 'horizontal',
}) {
  const isHorizontal = layout === 'horizontal';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
        )}
      </div>

      {/* Body */}
      <div
        className={
          isHorizontal
            ? 'grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-700'
            : 'flex flex-col'
        }
      >
        {/* Input Section */}
        <div className="p-6 space-y-4">
          {children}
        </div>

        {/* Result Section */}
        {resultComponent && (
          <div className="bg-slate-50 dark:bg-slate-800 p-6">
            {resultComponent}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Compact variant for simpler calculators (single column, no split).
 */
export function CalculatorCardCompact({ title, description, children }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
        )}
      </div>
      <div className="p-6 space-y-4">
        {children}
      </div>
    </div>
  );
}
