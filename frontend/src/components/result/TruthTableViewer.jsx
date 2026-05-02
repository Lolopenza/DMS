import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import AnimatedResult from './AnimatedResult.jsx';

/**
 * Beautiful truth table viewer with color-coded T/F cells and formula classification.
 *
 * @param {string[]} headers - Column headers (variables + formula)
 * @param {Array<Array<boolean|string>>} rows - Table data
 * @param {string} formula - The evaluated formula (for display)
 * @param {string} classification - 'tautology' | 'contradiction' | 'contingency' | null
 */
export default function TruthTableViewer({
  headers = [],
  rows = [],
  formula = '',
  classification = null,
}) {
  if (!headers.length || !rows.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-slate-500">No truth table data available</p>
      </div>
    );
  }

  const classificationInfo = {
    tautology: {
      label: 'Tautology',
      description: 'Always true for all variable assignments',
      icon: CheckCircle,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800',
    },
    contradiction: {
      label: 'Contradiction',
      description: 'Always false for all variable assignments',
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800',
    },
    contingency: {
      label: 'Contingency',
      description: 'True for some assignments, false for others',
      icon: HelpCircle,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800',
    },
  };

  const info = classification ? classificationInfo[classification] : null;
  const Icon = info?.icon;

  const trueCount = rows.filter((row) => {
    const lastCell = row[row.length - 1];
    return lastCell === true || lastCell === 'True' || lastCell === 'T' || lastCell === 1;
  }).length;
  const falseCount = rows.length - trueCount;

  return (
    <AnimatedResult variant="slideUp" className="space-y-4">
      {info && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`flex items-center gap-3 rounded-xl border p-4 ${info.bg}`}
        >
          {Icon && <Icon className={`h-6 w-6 ${info.color}`} />}
          <div>
            <p className={`font-semibold ${info.color}`}>{info.label}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{info.description}</p>
          </div>
        </motion.div>
      )}

      {formula && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Formula
          </p>
          <p className="mt-1 font-mono text-lg font-semibold text-slate-900 dark:text-slate-100">
            {formula}
          </p>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900">
                {headers.map((header, idx) => {
                  const isResult = idx === headers.length - 1;
                  return (
                    <th
                      key={idx}
                      className={`px-4 py-3 text-center text-xs font-bold uppercase tracking-wider ${
                        isResult
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/80 dark:text-indigo-300'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {header}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-900 dark:bg-slate-950">
              {rows.map((row, rowIdx) => (
                <motion.tr
                  key={rowIdx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: rowIdx * 0.02 }}
                  className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  {row.map((cell, cellIdx) => {
                    const isResult = cellIdx === row.length - 1;
                    const isTrue =
                      cell === true || cell === 'True' || cell === 'T' || cell === 1;
                    const isFalse =
                      cell === false || cell === 'False' || cell === 'F' || cell === 0;

                    let cellClass = 'text-slate-800 dark:text-slate-200';
                    let bgClass = '';

                    if (isTrue) {
                      cellClass = 'text-emerald-700 dark:text-emerald-400 font-bold';
                      bgClass = isResult
                        ? 'bg-emerald-100 dark:bg-emerald-950/40'
                        : 'bg-emerald-50 dark:bg-emerald-950/20';
                    } else if (isFalse) {
                      cellClass = 'text-red-600 dark:text-red-400 font-bold';
                      bgClass = isResult
                        ? 'bg-red-100 dark:bg-red-950/40'
                        : 'bg-red-50 dark:bg-red-950/20';
                    }

                    const displayValue = isTrue ? 'T' : isFalse ? 'F' : String(cell);

                    return (
                      <td
                        key={cellIdx}
                        className={`px-4 py-3 text-center font-mono text-sm ${cellClass} ${bgClass}`}
                      >
                        {displayValue}
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" />
            <span className="text-slate-600 dark:text-slate-400">True: {trueCount}</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-red-500" />
            <span className="text-slate-600 dark:text-slate-400">False: {falseCount}</span>
          </span>
        </div>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {rows.length} rows
        </span>
      </div>
    </AnimatedResult>
  );
}

/**
 * Detects classification from truth table data.
 */
export function detectClassification(rows) {
  if (!rows || rows.length === 0) return null;

  const results = rows.map((row) => {
    const lastCell = row[row.length - 1];
    return lastCell === true || lastCell === 'True' || lastCell === 'T' || lastCell === 1;
  });

  const allTrue = results.every((r) => r);
  const allFalse = results.every((r) => !r);

  if (allTrue) return 'tautology';
  if (allFalse) return 'contradiction';
  return 'contingency';
}
