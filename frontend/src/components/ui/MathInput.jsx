import React, { useEffect, useRef } from 'react';
import { addStyles, EditableMathField } from 'react-mathquill';

// Add MathQuill styles once
addStyles();

/**
 * MathInput — профессиональный ввод математических формул.
 * Использует MathQuill для WYSIWYG редактирования.
 * 
 * @param {string} label - метка поля
 * @param {string} latex - LaTeX строка (контролируемый компонент)
 * @param {function} onChange - callback(latex) при изменении
 * @param {string} placeholder - подсказка
 * @param {string} hint - текст подсказки под полем
 * @param {string} error - текст ошибки
 * @param {boolean} required
 * @param {string} className
 */
export default function MathInput({
  label,
  latex = '',
  onChange,
  placeholder = 'Enter formula...',
  hint = null,
  error = null,
  required = false,
  className = '',
}) {
  const mathFieldRef = useRef(null);

  const handleChange = (mathField) => {
    if (onChange) {
      onChange(mathField.latex());
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        className={`
          mathquill-input-wrapper
          block w-full rounded-lg border px-3 py-2
          bg-white dark:bg-slate-800
          border-slate-300 dark:border-slate-600
          focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent
          transition-colors
          ${error ? 'border-red-500 focus-within:ring-red-500' : ''}
        `}
      >
        <EditableMathField
          latex={latex}
          onChange={handleChange}
          mathquillDidMount={(mathField) => {
            mathFieldRef.current = mathField;
          }}
          config={{
            spaceBehavesLikeTab: true,
            leftRightIntoCmdGoes: 'up',
            restrictMismatchedBrackets: true,
            sumStartsWithNEquals: true,
            supSubsRequireOperand: true,
            autoCommands: 'pi theta sqrt sum int',
            autoOperatorNames: 'sin cos tan log ln',
          }}
        />
      </div>

      {hint && !error && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Keyboard shortcuts hint */}
      <details className="text-xs text-slate-500 dark:text-slate-400">
        <summary className="cursor-pointer hover:text-slate-700 dark:hover:text-slate-300">
          ⌨️ Keyboard shortcuts
        </summary>
        <ul className="mt-2 space-y-1 pl-4">
          <li>• <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">^</kbd> — superscript (x²)</li>
          <li>• <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">_</kbd> — subscript (x₁)</li>
          <li>• <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">/</kbd> — fraction (½)</li>
          <li>• <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">\sqrt</kbd> — square root (√x)</li>
          <li>• <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">\int</kbd> — integral (∫)</li>
          <li>• <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">\sum</kbd> — summation (Σ)</li>
        </ul>
      </details>
    </div>
  );
}

/**
 * MatrixInput — специализированный ввод матриц.
 * Парсит LaTeX матрицу в 2D массив.
 */
export function MatrixInput({
  label,
  value = '',
  onChange,
  rows = 2,
  cols = 2,
  hint = 'Enter matrix in LaTeX format or use visual editor',
  error = null,
  className = '',
}) {
  // Generate default matrix LaTeX
  const defaultMatrix = `\\begin{bmatrix}${Array(rows).fill(Array(cols).fill('0').join(' & ')).join(' \\\\ ')}\\end{bmatrix}`;

  return (
    <MathInput
      label={label}
      latex={value || defaultMatrix}
      onChange={onChange}
      hint={hint}
      error={error}
      className={className}
    />
  );
}

/**
 * parseMatrixLatex — парсит LaTeX матрицу в 2D массив чисел.
 * 
 * @param {string} latex - LaTeX строка вида \begin{bmatrix}1 & 2\\3 & 4\end{bmatrix}
 * @returns {number[][]} - 2D массив чисел
 */
export function parseMatrixLatex(latex) {
  try {
    // Remove \begin{bmatrix} and \end{bmatrix}
    const content = latex
      .replace(/\\begin\{[^}]+\}/g, '')
      .replace(/\\end\{[^}]+\}/g, '')
      .trim();

    // Split by rows (\\)
    const rows = content.split('\\\\').map(row => row.trim()).filter(Boolean);

    // Split each row by & and parse numbers
    return rows.map(row =>
      row.split('&').map(cell => {
        const num = parseFloat(cell.trim());
        if (isNaN(num)) throw new Error(`Invalid number: ${cell}`);
        return num;
      })
    );
  } catch (err) {
    throw new Error(`Failed to parse matrix: ${err.message}`);
  }
}

/**
 * formatMatrixLatex — форматирует 2D массив в LaTeX матрицу.
 * 
 * @param {number[][]} matrix - 2D массив чисел
 * @returns {string} - LaTeX строка
 */
export function formatMatrixLatex(matrix) {
  const rows = matrix.map(row => row.join(' & ')).join(' \\\\ ');
  return `\\begin{bmatrix}${rows}\\end{bmatrix}`;
}
