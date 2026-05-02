import React from 'react';

/**
 * Input — универсальное текстовое поле с поддержкой ошибок, подсказок, иконок.
 * 
 * @param {string} label - метка поля
 * @param {string} type - 'text' | 'number' | 'email' | 'password'
 * @param {string} value
 * @param {function} onChange
 * @param {string} placeholder
 * @param {string} error - текст ошибки
 * @param {string} hint - подсказка под полем
 * @param {React.ReactNode} icon - иконка слева
 * @param {boolean} required
 * @param {boolean} disabled
 * @param {string} className
 */
export default function Input({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error = null,
  hint = null,
  icon = null,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-800 dark:text-slate-200">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`
            block w-full rounded-xl border
            ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2.5
            text-sm text-slate-950 dark:text-slate-100
            bg-white dark:bg-slate-950
            border-slate-300 dark:border-slate-700
            placeholder-slate-400 dark:placeholder-slate-500
            focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:border-slate-400 dark:focus:ring-slate-700
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
            ${error ? 'border-red-500 focus:ring-red-300 dark:focus:ring-red-900' : ''}
          `}
          {...props}
        />
      </div>

      {hint && !error && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

/**
 * Textarea — многострочное текстовое поле.
 */
export function Textarea({
  label,
  id,
  value,
  onChange,
  placeholder = '',
  error = null,
  hint = null,
  rows = 3,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  const textareaId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-slate-800 dark:text-slate-200">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        id={textareaId}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        disabled={disabled}
        className={`
          block w-full rounded-xl border px-3 py-2.5
          text-sm text-slate-950 dark:text-slate-100
          bg-white dark:bg-slate-950
          border-slate-300 dark:border-slate-700
          placeholder-slate-400 dark:placeholder-slate-500
          focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:border-slate-400 dark:focus:ring-slate-700
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors resize-y
          ${error ? 'border-red-500 focus:ring-red-300 dark:focus:ring-red-900' : ''}
        `}
        {...props}
      />

      {hint && !error && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

/**
 * Select — выпадающий список.
 */
export function Select({
  label,
  id,
  value,
  onChange,
  options = [],
  error = null,
  hint = null,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-slate-800 dark:text-slate-200">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <select
        id={selectId}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`
          block w-full rounded-xl border px-3 py-2.5
          text-sm text-slate-950 dark:text-slate-100
          bg-white dark:bg-slate-950
          border-slate-300 dark:border-slate-700
          focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:border-slate-400 dark:focus:ring-slate-700
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
          ${error ? 'border-red-500 focus:ring-red-300 dark:focus:ring-red-900' : ''}
        `}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>

      {hint && !error && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
