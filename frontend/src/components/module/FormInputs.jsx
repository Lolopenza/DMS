import React from 'react';

/**
 * Reusable form group component with consistent styling.
 * Uses dmc-* classes with built-in dark mode support.
 */
export function FormGroup({
  label,
  htmlFor,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
  disabled = false,
  error = null,
  hint = null,
  className = '',
  children,
}) {
  const inputId = htmlFor || label?.toLowerCase().replace(/\s+/g, '-');

  if (children) {
    return (
      <div className={`space-y-1.5 ${className}`}>
        <label htmlFor={inputId} className="text-sm font-medium dmc-title block">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {children}
        {hint && <p className="text-xs dmc-subtitle mt-1">{hint}</p>}
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={inputId} className="text-sm font-medium dmc-title block">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`dmc-input ${error ? 'border-red-500' : ''}`}
      />
      {hint && <p className="text-xs dmc-subtitle mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

/**
 * Form row for horizontal layout of multiple form groups.
 */
export function FormRow({ children, className = '' }) {
  return <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${className}`}>{children}</div>;
}

/**
 * Form select component with consistent styling.
 */
export function FormSelect({
  label,
  htmlFor,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  error = null,
  hint = null,
  className = '',
}) {
  const selectId = htmlFor || `select-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={selectId} className="text-sm font-medium dmc-title block">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={selectId}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`dmc-select ${error ? 'border-red-500' : ''}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && <p className="text-xs dmc-subtitle mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

/**
 * Form textarea component with consistent styling.
 */
export function FormTextarea({
  label,
  htmlFor,
  value,
  onChange,
  placeholder = '',
  rows = 3,
  required = false,
  disabled = false,
  error = null,
  hint = null,
  className = '',
}) {
  const textareaId = htmlFor || `textarea-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={textareaId} className="text-sm font-medium dmc-title block">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        id={textareaId}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        disabled={disabled}
        className="dmc-input min-h-[80px] resize-y"
      />
      {hint && <p className="text-xs dmc-subtitle mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

/**
 * Primary calculate button with loading state.
 */
export function CalculateButton({ loading = false, disabled = false, children = 'Calculate', onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      className="dmc-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Calculating...
        </>
      ) : (
        children
      )}
    </button>
  );
}

/**
 * Secondary reset button.
 */
export function ResetButton({ onClick, children = 'Reset' }) {
  return (
    <button type="button" onClick={onClick} className="dmc-button-secondary">
      {children}
    </button>
  );
}
