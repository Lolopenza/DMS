import React from 'react';

/**
 * Button — универсальная кнопка с вариантами стилей.
 * Поддерживает loading state, disabled, иконки.
 * 
 * @param {string} variant - 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} loading - показать спиннер загрузки
 * @param {boolean} disabled
 * @param {React.ReactNode} icon - иконка слева от текста
 * @param {React.ReactNode} children - текст кнопки
 * @param {string} className - дополнительные классы
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingLabel = 'Loading...',
  disabled = false,
  icon = null,
  children,
  className = '',
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-slate-500 dark:focus:ring-offset-slate-950';

  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
    outline: 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900',
    ghost: 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600',
  };

  const sizeClasses = {
    sm: 'gap-1.5 px-3 py-1.5 text-sm',
    md: 'gap-2 px-4 py-2.5 text-sm',
    lg: 'gap-2.5 px-6 py-3 text-base',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>{loadingLabel}</span>
        </>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}

/**
 * ButtonGroup — группа кнопок с общим бордером.
 */
export function ButtonGroup({ children, className = '' }) {
  return (
    <div className={`inline-flex rounded-lg shadow-sm ${className}`} role="group">
      {React.Children.map(children, (child, index) => {
        if (!child) return null;
        const isFirst = index === 0;
        const isLast = index === React.Children.count(children) - 1;
        return React.cloneElement(child, {
          className: `${child.props.className || ''} ${
            !isFirst ? '-ml-px' : ''
          } ${
            isFirst ? 'rounded-r-none' : isLast ? 'rounded-l-none' : 'rounded-none'
          }`,
        });
      })}
    </div>
  );
}
