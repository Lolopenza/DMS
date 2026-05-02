import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Copy, Check } from 'lucide-react';
import AnimatedResult, { HighlightResult } from './AnimatedResult.jsx';
import 'katex/dist/katex.min.css';

/** Stable display order for SymPy blocks returned by math-engine calculus service. */
const CALCULUS_KEY_ORDER = [
  'derivative',
  'antiderivative',
  'value',
  'series',
  'partial',
  'solution',
];

function titleForKey(key, operation) {
  switch (key) {
    case 'derivative':
      return 'Derivative';
    case 'antiderivative':
      return 'Antiderivative';
    case 'series':
      return 'Taylor expansion';
    case 'partial':
      return 'Partial derivative';
    case 'solution':
      return 'Solution';
    case 'value':
      if (operation === 'limit') return 'Limit';
      if (operation === 'definite') return 'Definite integral';
      return 'Value';
    default:
      return key;
  }
}

function formatNumericApprox(n) {
  if (typeof n !== 'number' || !Number.isFinite(n)) return null;
  const abs = Math.abs(n);
  if (abs !== 0 && (abs < 1e-6 || abs >= 1e8)) {
    return n.toExponential(6);
  }
  const rounded = Number.isInteger(n) ? String(n) : n.toFixed(8).replace(/\.?0+$/, '');
  return rounded;
}

function blockCopyText(node) {
  const latex = typeof node.latex === 'string' ? node.latex.trim() : '';
  const repr = typeof node.repr === 'string' ? node.repr : '';
  if (latex) return latex;
  if (repr) return repr;
  const num = formatNumericApprox(node.numeric);
  return num ?? '';
}

/**
 * Renders SymPy calculus API payloads: each block has repr, latex, optional numeric.
 */
export default function CalculusSymPyViewer({ data, operation }) {
  const keys = CALCULUS_KEY_ORDER.filter((k) => data[k] != null);

  return (
    <AnimatedResult variant="slideUp" className="space-y-4">
      {keys.map((key) => (
        <SymPyBlockCard
          key={key}
          title={titleForKey(key, operation)}
          node={data[key]}
        />
      ))}
    </AnimatedResult>
  );
}

function SymPyBlockCard({ title, node }) {
  const [copied, setCopied] = useState(false);

  const latex = typeof node?.latex === 'string' ? node.latex.trim() : '';
  const repr = typeof node?.repr === 'string' ? node.repr : '';
  const numericStr = formatNumericApprox(node?.numeric);

  const markdown = latex ? `$$${latex}$$` : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(blockCopyText(node));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <HighlightResult>
      <div className="rounded-xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-5 dark:border-indigo-800 dark:from-slate-800 dark:to-slate-900">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h4>
          <button
            type="button"
            onClick={handleCopy}
            className="flex shrink-0 items-center gap-1 rounded-lg bg-white/50 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-white dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
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

        <div className="mt-3">
          {markdown ? (
            <div className="prose prose-slate dark:prose-invert max-w-none prose-p:my-2">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {markdown}
              </ReactMarkdown>
            </div>
          ) : repr ? (
            <pre className="overflow-x-auto rounded-lg bg-white/80 p-3 font-mono text-sm leading-relaxed text-slate-800 dark:bg-slate-900/80 dark:text-slate-100">
              {repr}
            </pre>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">No symbolic form returned.</p>
          )}
        </div>

        {numericStr ? (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-300">Numeric approximation:</span>{' '}
            <span className="font-mono tabular-nums text-indigo-700 dark:text-indigo-300">{numericStr}</span>
          </p>
        ) : null}
      </div>
    </HighlightResult>
  );
}
