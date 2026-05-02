import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { ListOrdered, ChevronRight, CheckCircle2 } from 'lucide-react';
import AnimatedResult from './AnimatedResult.jsx';
import 'katex/dist/katex.min.css';

function KaTeX({ children }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
      {children}
    </ReactMarkdown>
  );
}

/**
 * Universal step-by-step solution viewer with LaTeX support.
 * Works for any algorithm or calculation that produces intermediate steps.
 *
 * @param {Array<{title?: string, explanation?: string, formula?: string, code?: string, highlight?: boolean}>} steps
 * @param {string} title - Section title
 * @param {boolean} numbered - Whether to show step numbers
 * @param {boolean} animated - Whether to animate steps
 */
export default function StepSolutionViewer({
  steps = [],
  title = 'Solution Steps',
  numbered = true,
  animated = true,
}) {
  if (!steps || steps.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-slate-500">No steps available</p>
      </div>
    );
  }

  return (
    <AnimatedResult variant="slideUp" className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-center gap-2">
          <ListOrdered className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
        </div>

        <div className="space-y-3">
          {steps.map((step, idx) => (
            <Step
              key={idx}
              step={step}
              index={idx}
              numbered={numbered}
              animated={animated}
              isLast={idx === steps.length - 1}
            />
          ))}
        </div>
      </div>
    </AnimatedResult>
  );
}

function Step({ step, index, numbered, animated, isLast }) {
  const content = (
    <div
      className={`relative flex gap-3 ${
        step.highlight
          ? 'rounded-xl border-2 border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-800 dark:bg-indigo-950/30'
          : 'rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/30'
      }`}
    >
      {numbered && (
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
            step.highlight
              ? 'bg-indigo-200 text-indigo-700 dark:bg-indigo-800 dark:text-indigo-300'
              : isLast
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
              : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {isLast ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            index + 1
          )}
        </div>
      )}

      <div className="min-w-0 flex-1">
        {step.title && (
          <h4 className="mb-1 font-medium text-slate-800 dark:text-slate-200">
            {step.title}
          </h4>
        )}

        {step.explanation && (
          <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
            {step.explanation}
          </p>
        )}

        {step.formula && (
          <div
            className={`overflow-x-auto rounded-lg p-3 ${
              step.highlight
                ? 'bg-white dark:bg-slate-950'
                : 'bg-white dark:bg-slate-950'
            }`}
          >
            <div className="text-slate-900 dark:text-slate-100">
              <KaTeX>{step.formula}</KaTeX>
            </div>
          </div>
        )}

        {step.code && (
          <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-900 p-3 font-mono text-sm text-slate-100">
            {step.code}
          </pre>
        )}

        {step.table && <StepTable data={step.table} />}

        {step.array && <ArrayVisualization data={step.array} highlight={step.arrayHighlight} />}
      </div>
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}

function StepTable({ data }) {
  if (!data || !data.headers || !data.rows) return null;

  return (
    <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead>
          <tr className="bg-slate-100 dark:bg-slate-800">
            {data.headers.map((header, idx) => (
              <th
                key={idx}
                className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {data.rows.map((row, rowIdx) => (
            <tr key={rowIdx} className="bg-white dark:bg-slate-950">
              {row.map((cell, cellIdx) => (
                <td
                  key={cellIdx}
                  className="whitespace-nowrap px-3 py-2 font-mono text-sm text-slate-700 dark:text-slate-300"
                >
                  {String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ArrayVisualization({ data, highlight = [] }) {
  if (!Array.isArray(data)) return null;

  const highlightSet = new Set(highlight);

  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {data.map((item, idx) => (
        <motion.span
          key={idx}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.02 }}
          className={`inline-flex h-8 min-w-[2rem] items-center justify-center rounded border font-mono text-sm ${
            highlightSet.has(idx)
              ? 'border-indigo-400 bg-indigo-100 text-indigo-700 dark:border-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300'
              : 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
          }`}
        >
          {String(item)}
        </motion.span>
      ))}
    </div>
  );
}

/**
 * Compact steps for inline display.
 */
export function CompactSteps({ steps }) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {steps.map((step, idx) => (
        <React.Fragment key={idx}>
          <span className="rounded bg-slate-100 px-2 py-1 font-mono text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {typeof step === 'string' ? step : step.formula || step.value}
          </span>
          {idx < steps.length - 1 && (
            <ChevronRight className="h-4 w-4 text-slate-400" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
