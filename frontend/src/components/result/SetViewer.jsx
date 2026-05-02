import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Braces, Equal, ArrowLeftRight } from 'lucide-react';
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
 * Beautiful set theory result viewer.
 * Shows sets with proper mathematical notation and optional Venn-style visualization.
 *
 * @param {'union'|'intersection'|'difference'|'complement'|'cartesian'|'powerset'|'cardinality'|'inverse'|'closure'|'properties'} operation
 * @param {object} inputs - Input sets/relations
 * @param {any} result - Computed result
 */
export default function SetViewer({ operation, inputs = {}, result }) {
  const resultData = result?.result ?? result;

  return (
    <AnimatedResult variant="slideUp" className="space-y-4">
      {inputs.setA !== undefined && inputs.setB !== undefined && (
        <VennDiagram operation={operation} setA={inputs.setA} setB={inputs.setB} />
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-center gap-2">
          <Braces className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            {getOperationTitle(operation)}
          </h3>
        </div>

        {getFormula(operation, inputs) && (
          <div className="mb-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-900/50">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Operation
            </p>
            <div className="text-lg text-slate-900 dark:text-slate-100">
              <KaTeX>{getFormula(operation, inputs)}</KaTeX>
            </div>
          </div>
        )}

        {renderInputSets(inputs)}
      </div>

      <HighlightResult>
        <div className="rounded-xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-5 dark:border-indigo-800 dark:from-indigo-950/50 dark:to-purple-950/50">
          <div className="flex items-center gap-2">
            <Equal className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Result
            </span>
          </div>
          <div className="mt-2">
            {renderResult(operation, resultData)}
          </div>
        </div>
      </HighlightResult>
    </AnimatedResult>
  );
}

function getOperationTitle(operation) {
  const titles = {
    union: 'Set Union',
    intersection: 'Set Intersection',
    difference: 'Set Difference',
    complement: 'Set Complement',
    cartesian: 'Cartesian Product',
    powerset: 'Power Set',
    cardinality: 'Cardinality',
    inverse: 'Inverse Relation',
    closure: 'Relation Closure',
    properties: 'Relation Properties',
    symmetric_difference: 'Symmetric Difference',
  };
  return titles[operation] || 'Set Operation';
}

function getFormula(operation, inputs) {
  const formulas = {
    union: `$$A \\cup B = \\{x \\mid x \\in A \\text{ or } x \\in B\\}$$`,
    intersection: `$$A \\cap B = \\{x \\mid x \\in A \\text{ and } x \\in B\\}$$`,
    difference: `$$A \\setminus B = \\{x \\mid x \\in A \\text{ and } x \\notin B\\}$$`,
    complement: `$$A^c = U \\setminus A = \\{x \\in U \\mid x \\notin A\\}$$`,
    cartesian: `$$A \\times B = \\{(a, b) \\mid a \\in A, b \\in B\\}$$`,
    powerset: `$$\\mathcal{P}(A) = \\{S \\mid S \\subseteq A\\}$$`,
    symmetric_difference: `$$A \\triangle B = (A \\setminus B) \\cup (B \\setminus A)$$`,
  };
  return formulas[operation] || null;
}

function renderInputSets(inputs) {
  const entries = Object.entries(inputs).filter(
    ([key, val]) => val !== undefined && val !== null && val !== ''
  );

  if (entries.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Input
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {entries.map(([key, value]) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/30"
          >
            <span className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
              {formatLabel(key)}
            </span>
            <div className="mt-1 font-mono text-sm text-slate-800 dark:text-slate-200">
              {formatSetValue(value)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function formatLabel(key) {
  const labels = {
    setA: 'Set A',
    setB: 'Set B',
    universe: 'Universe U',
    relation: 'Relation R',
  };
  return labels[key] || key;
}

function formatSetValue(value) {
  if (Array.isArray(value)) {
    if (value.length === 0) return '∅ (empty set)';
    if (Array.isArray(value[0])) {
      return `{${value.map((pair) => `(${pair.join(', ')})`).join(', ')}}`;
    }
    return `{${value.join(', ')}}`;
  }
  if (typeof value === 'string') {
    if (value.trim() === '') return '∅ (empty set)';
    return `{${value}}`;
  }
  return String(value);
}

function renderResult(operation, result) {
  if (result === null || result === undefined) {
    return (
      <span className="text-slate-500 dark:text-slate-400">No result</span>
    );
  }

  if (typeof result === 'number') {
    return (
      <span className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
        {result}
      </span>
    );
  }

  if (typeof result === 'boolean') {
    return (
      <span
        className={`text-2xl font-bold ${
          result
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-red-600 dark:text-red-400'
        }`}
      >
        {result ? 'True' : 'False'}
      </span>
    );
  }

  if (typeof result === 'object' && !Array.isArray(result)) {
    return (
      <div className="space-y-1">
        {Object.entries(result).map(([key, val]) => (
          <div
            key={key}
            className="flex items-center gap-2 text-sm"
          >
            <span className="font-medium text-slate-600 dark:text-slate-400">
              {key}:
            </span>
            <span
              className={`font-mono ${
                val === true
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : val === false
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-indigo-700 dark:text-indigo-300'
              }`}
            >
              {formatSetValue(val)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (Array.isArray(result)) {
    if (result.length === 0) {
      return (
        <span className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
          ∅
        </span>
      );
    }

    if (Array.isArray(result[0])) {
      return (
        <div className="flex flex-wrap gap-2">
          {result.map((pair, idx) => (
            <motion.span
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.03 }}
              className="inline-flex items-center rounded-lg bg-indigo-100 px-3 py-1.5 font-mono text-sm font-medium text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
            >
              ({pair.join(', ')})
            </motion.span>
          ))}
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-2">
        {result.map((item, idx) => (
          <motion.span
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.03 }}
            className="inline-flex items-center rounded-lg bg-indigo-100 px-3 py-1.5 font-mono text-sm font-medium text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
          >
            {String(item)}
          </motion.span>
        ))}
      </div>
    );
  }

  return (
    <span className="text-xl font-semibold text-indigo-700 dark:text-indigo-300">
      {String(result)}
    </span>
  );
}

function VennDiagram({ operation, setA, setB }) {
  const getColors = () => {
    switch (operation) {
      case 'union':
        return { a: 'fill-indigo-200/60', b: 'fill-purple-200/60', overlap: 'fill-indigo-400/80' };
      case 'intersection':
        return { a: 'fill-slate-200/40', b: 'fill-slate-200/40', overlap: 'fill-indigo-400/80' };
      case 'difference':
        return { a: 'fill-indigo-400/80', b: 'fill-slate-200/40', overlap: 'fill-slate-200/40' };
      default:
        return { a: 'fill-indigo-200/60', b: 'fill-purple-200/60', overlap: 'fill-indigo-300/60' };
    }
  };

  const colors = getColors();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex justify-center rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950"
    >
      <svg viewBox="0 0 200 120" className="h-32 w-48">
        <defs>
          <clipPath id="clipA">
            <circle cx="70" cy="60" r="40" />
          </clipPath>
          <clipPath id="clipB">
            <circle cx="130" cy="60" r="40" />
          </clipPath>
        </defs>

        <circle
          cx="70"
          cy="60"
          r="40"
          className={`${colors.a} stroke-indigo-400 dark:stroke-indigo-500`}
          strokeWidth="2"
        />
        <circle
          cx="130"
          cy="60"
          r="40"
          className={`${colors.b} stroke-purple-400 dark:stroke-purple-500`}
          strokeWidth="2"
        />

        <g clipPath="url(#clipA)">
          <circle cx="130" cy="60" r="40" className={colors.overlap} />
        </g>

        <text
          x="50"
          y="60"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-indigo-700 text-xs font-bold dark:fill-indigo-300"
        >
          A
        </text>
        <text
          x="150"
          y="60"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-purple-700 text-xs font-bold dark:fill-purple-300"
        >
          B
        </text>
      </svg>
    </motion.div>
  );
}
