import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Grid3X3, Copy, Check } from 'lucide-react';
import AnimatedResult, { HighlightResult } from './AnimatedResult.jsx';
import 'katex/dist/katex.min.css';

function KaTeX({ children }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
      {children}
    </ReactMarkdown>
  );
}

/**
 * Beautiful matrix viewer with proper mathematical notation.
 * Renders matrices with square brackets and proper alignment.
 *
 * @param {number[][]} matrix - 2D array representing the matrix
 * @param {string} label - Optional label for the matrix
 * @param {string} operation - Optional operation description
 * @param {Array<[number, number]>} highlights - Cells to highlight [(row, col), ...]
 */
export default function MatrixViewer({
  matrix,
  label = '',
  operation = '',
  highlights = [],
}) {
  const [copied, setCopied] = React.useState(false);

  if (!matrix || !Array.isArray(matrix) || matrix.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-slate-500">No matrix data</p>
      </div>
    );
  }

  const highlightSet = new Set(highlights.map(([r, c]) => `${r}-${c}`));
  const latex = matrixToLatex(matrix);

  const copyMatrix = () => {
    const text = matrix.map((row) => row.join('\t')).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatedResult variant="slideUp" className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              {label || 'Matrix'} {operation && `(${operation})`}
            </h3>
          </div>
          <button
            onClick={copyMatrix}
            className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-500" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </button>
        </div>

        <div className="mb-4 flex justify-center overflow-x-auto rounded-lg bg-slate-50 p-6 dark:bg-slate-900">
          <div className="text-xl text-slate-900 dark:text-slate-100">
            <KaTeX>{`$$${latex}$$`}</KaTeX>
          </div>
        </div>

        <div className="overflow-x-auto">
          <MatrixGrid matrix={matrix} highlights={highlightSet} />
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
          <span>
            Dimensions: {matrix.length} × {matrix[0]?.length || 0}
          </span>
          {isSquare(matrix) && <span className="text-indigo-600 dark:text-indigo-400">Square matrix</span>}
          {isSymmetric(matrix) && <span className="text-emerald-600 dark:text-emerald-400">Symmetric</span>}
        </div>
      </div>
    </AnimatedResult>
  );
}

function MatrixGrid({ matrix, highlights }) {
  return (
    <div className="inline-flex items-center gap-1">
      <div className="flex h-full flex-col justify-center text-2xl text-slate-400">
        [
      </div>
      <table className="border-collapse">
        <tbody>
          {matrix.map((row, rowIdx) => (
            <tr key={rowIdx}>
              {row.map((cell, colIdx) => {
                const isHighlighted = highlights.has(`${rowIdx}-${colIdx}`);
                return (
                  <motion.td
                    key={colIdx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (rowIdx * row.length + colIdx) * 0.02 }}
                    className={`px-3 py-2 text-center font-mono text-sm ${
                      isHighlighted
                        ? 'bg-indigo-100 font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {formatNumber(cell)}
                  </motion.td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex h-full flex-col justify-center text-2xl text-slate-400">
        ]
      </div>
    </div>
  );
}

function matrixToLatex(matrix) {
  const rows = matrix.map((row) =>
    row.map((cell) => formatNumber(cell)).join(' & ')
  );
  return `\\begin{bmatrix} ${rows.join(' \\\\ ')} \\end{bmatrix}`;
}

function formatNumber(num) {
  if (typeof num !== 'number') return String(num);
  if (Number.isInteger(num)) return String(num);
  return num.toFixed(4).replace(/\.?0+$/, '');
}

function isSquare(matrix) {
  return matrix.length === (matrix[0]?.length || 0);
}

function isSymmetric(matrix) {
  if (!isSquare(matrix)) return false;
  const n = matrix.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (matrix[i][j] !== matrix[j][i]) return false;
    }
  }
  return true;
}

/**
 * Side-by-side matrix comparison viewer.
 */
export function MatrixComparison({ matrices, labels, title }) {
  return (
    <AnimatedResult variant="slideUp" className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        {title && (
          <div className="mb-4 flex items-center gap-2">
            <Grid3X3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </h3>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-6">
          {matrices.map((matrix, idx) => (
            <React.Fragment key={idx}>
              <div className="text-center">
                {labels && labels[idx] && (
                  <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                    {labels[idx]}
                  </p>
                )}
                <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                  <KaTeX>{`$$${matrixToLatex(matrix)}$$`}</KaTeX>
                </div>
              </div>
              {idx < matrices.length - 1 && (
                <span className="text-2xl text-slate-400">=</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </AnimatedResult>
  );
}

/**
 * Determinant result with formula.
 */
export function DeterminantResult({ matrix, determinant, steps }) {
  const latex = matrixToLatex(matrix);

  return (
    <AnimatedResult variant="slideUp" className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-center gap-2">
          <Grid3X3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Determinant
          </h3>
        </div>

        <div className="mb-4 flex items-center justify-center gap-4 rounded-lg bg-slate-50 p-6 dark:bg-slate-900">
          <div className="text-xl text-slate-900 dark:text-slate-100">
            <KaTeX>{`$$\\det${latex}$$`}</KaTeX>
          </div>
        </div>

        {steps && steps.length > 0 && (
          <div className="mb-4 space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Computation Steps
            </p>
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/30"
              >
                <KaTeX>{step}</KaTeX>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <HighlightResult>
        <div className="rounded-xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-5 dark:border-indigo-800 dark:from-indigo-950/50 dark:to-purple-950/50">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Result
          </span>
          <div className="mt-2 text-3xl font-bold text-indigo-700 dark:text-indigo-300">
            <KaTeX>{`$$\\det(A) = ${formatNumber(determinant)}$$`}</KaTeX>
          </div>
        </div>
      </HighlightResult>
    </AnimatedResult>
  );
}
