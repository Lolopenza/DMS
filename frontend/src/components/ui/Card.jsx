import React from 'react';

/**
 * Card — универсальный контейнер с тенями и бордерами.
 * Поддерживает dark mode и кастомизацию через className.
 * 
 * @param {string} variant - 'default' | 'bordered' | 'elevated'
 * @param {string} padding - 'none' | 'sm' | 'md' | 'lg'
 * @param {React.ReactNode} children
 * @param {string} className - дополнительные Tailwind классы
 */
export default function Card({ 
  variant = 'default', 
  padding = 'md', 
  children, 
  className = '' 
}) {
  const baseClasses = 'rounded-2xl bg-white text-slate-950 transition-colors dark:bg-slate-900 dark:text-slate-100';
  
  const variantClasses = {
    default: 'border border-slate-200 dark:border-slate-800',
    bordered: 'border border-slate-300 dark:border-slate-700',
    elevated: 'border border-slate-200 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:shadow-none',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
}

/**
 * CardHeader — заголовок карточки с опциональным действием.
 */
export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div>
        <h3 className="text-base font-semibold tracking-tight text-slate-950 dark:text-slate-100">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/**
 * CardSection — секция внутри карточки с опциональным разделителем.
 */
export function CardSection({ children, divider = false, className = '' }) {
  return (
    <div className={`${divider ? 'mt-5 border-t border-slate-200 pt-5 dark:border-slate-800' : ''} ${className}`}>
      {children}
    </div>
  );
}
