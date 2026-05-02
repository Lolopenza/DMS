import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

/**
 * Standardized result renderer with LaTeX support and copy-to-clipboard.
 * Renders mathematical formulas using KaTeX and provides clean formatting.
 * 
 * @param {string|object} content - Result content (string with LaTeX or structured data)
 * @param {string} title - Optional title for the result box
 * @param {boolean} showCopy - Show copy button (default: true)
 * @param {string} className - Additional CSS classes
 */
export default function MathResultBox({
  content,
  title = 'Result',
  showCopy = true,
  className = '',
}) {
  const [copied, setCopied] = useState(false);

  // Convert content to string for rendering and copying
  const contentString = (() => {
    try {
      if (content == null) return 'No result';
      if (typeof content === 'string') return content;
      if (typeof content === 'object' && content.error) {
        return `**Error:** ${content.error}`;
      }
      if (typeof content === 'object' && content.message) {
        return `**Error:** ${content.message}`;
      }
      return typeof content === 'object' ? JSON.stringify(content, null, 2) : String(content);
    } catch {
      return 'Display error';
    }
  })();

  const handleCopy = async () => {
    try {
      // Strip LaTeX delimiters for cleaner clipboard content
      const cleanContent = contentString
        .replace(/\$\$/g, '')
        .replace(/\$/g, '')
        .trim();
      
      await navigator.clipboard.writeText(cleanContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden ${className}`}>
      {/* Header with title and copy button */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
        {showCopy && (
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400
                       hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="Copy to clipboard"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-600">Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span>Copy</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Content with LaTeX rendering */}
      <div className="px-4 py-4">
        <div className="prose prose-slate dark:prose-invert max-w-none prose-p:my-2 prose-pre:bg-slate-100 dark:prose-pre:bg-slate-800 prose-pre:text-slate-800 dark:prose-pre:text-slate-200">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {contentString}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact variant without header (for inline results).
 */
export function MathResultInline({ content, showCopy = false, className = '' }) {
  const [copied, setCopied] = useState(false);

  const contentString = typeof content === 'string'
    ? content
    : JSON.stringify(content, null, 2);

  const handleCopy = async () => {
    try {
      const cleanContent = contentString
        .replace(/\$\$/g, '')
        .replace(/\$/g, '')
        .trim();

      await navigator.clipboard.writeText(cleanContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`relative bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-3 border border-slate-200 dark:border-slate-700 ${className}`}>
      {showCopy && (
        <button
          type="button"
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
          title="Copy to clipboard"
        >
          {copied ? (
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          )}
        </button>
      )}
      <div className="prose prose-sm prose-slate dark:prose-invert max-w-none prose-p:my-1">
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
        >
          {contentString}
        </ReactMarkdown>
      </div>
    </div>
  );
}

/**
 * Helper to format common result types for display.
 */
export function formatResult(result) {
  if (result === null || result === undefined) {
    return 'No result';
  }

  // Handle numeric results
  if (typeof result === 'number') {
    return `$$${result}$$`;
  }

  // Handle boolean results
  if (typeof result === 'boolean') {
    return result ? '**True**' : '**False**';
  }

  // Handle array results
  if (Array.isArray(result)) {
    return `$$[${result.join(', ')}]$$`;
  }

  // Handle object results with formula/value pattern
  if (typeof result === 'object' && result.formula && result.value !== undefined) {
    return `$$${result.formula} = ${result.value}$$`;
  }

  // Handle object results with result field
  if (typeof result === 'object' && result.result !== undefined) {
    return formatResult(result.result);
  }

  // Default: stringify
  return typeof result === 'string' ? result : JSON.stringify(result, null, 2);
}
