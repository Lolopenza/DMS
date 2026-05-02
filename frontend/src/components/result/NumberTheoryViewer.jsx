import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Hash, Divide, Sigma, Binary } from 'lucide-react';
import AnimatedResult, { HighlightResult, AnimatedSteps } from './AnimatedResult.jsx';
import 'katex/dist/katex.min.css';

function KaTeX({ children }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
      {children}
    </ReactMarkdown>
  );
}

/**
 * Number theory result viewer with proper mathematical formatting.
 *
 * @param {'gcd'|'lcm'|'prime_factors'|'is_prime'|'mod_exp'|'extended_gcd'|'euler_phi'|'chinese_remainder'} operation
 * @param {object} params - Input parameters
 * @param {any} result - Computed result
 */
export default function NumberTheoryViewer({ operation, params = {}, result }) {
  const resultData = result?.result ?? result;

  return (
    <AnimatedResult variant="slideUp" className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-center gap-2">
          {getIcon(operation)}
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            {getOperationTitle(operation)}
          </h3>
        </div>

        {getFormula(operation, params) && (
          <div className="mb-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Formula
            </p>
            <div className="text-lg text-slate-900 dark:text-slate-100">
              <KaTeX>{getFormula(operation, params)}</KaTeX>
            </div>
          </div>
        )}

        {renderInputs(operation, params)}

        {renderSteps(operation, params, resultData)}
      </div>

      <HighlightResult>
        <div className="rounded-xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-5 dark:border-indigo-800 dark:from-slate-800 dark:to-slate-900">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Result
          </span>
          <div className="mt-2">
            {renderResult(operation, resultData)}
          </div>
        </div>
      </HighlightResult>
    </AnimatedResult>
  );
}

function getIcon(operation) {
  const icons = {
    gcd: <Divide className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
    lcm: <Sigma className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
    prime_factors: <Hash className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
    is_prime: <Hash className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
    mod_exp: <Binary className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
  };
  return icons[operation] || <Hash className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />;
}

function getOperationTitle(operation) {
  const titles = {
    gcd: 'Greatest Common Divisor',
    lcm: 'Least Common Multiple',
    prime_factors: 'Prime Factorization',
    is_prime: 'Primality Test',
    mod_exp: 'Modular Exponentiation',
    extended_gcd: 'Extended Euclidean Algorithm',
    euler_phi: 'Euler\'s Totient Function',
    chinese_remainder: 'Chinese Remainder Theorem',
    divisors: 'Divisors',
    fibonacci: 'Fibonacci Number',
  };
  return titles[operation] || 'Number Theory';
}

function getFormula(operation, params) {
  const { a, b, n, base, exponent, modulus } = params;

  const formulas = {
    gcd: `$$\\gcd(${a || 'a'}, ${b || 'b'})$$`,
    lcm: `$$\\text{lcm}(${a || 'a'}, ${b || 'b'}) = \\frac{|${a || 'a'} \\cdot ${b || 'b'}|}{\\gcd(${a || 'a'}, ${b || 'b'})}$$`,
    prime_factors: `$$n = p_1^{a_1} \\cdot p_2^{a_2} \\cdot \\ldots \\cdot p_k^{a_k}$$`,
    mod_exp: `$$${base || 'a'}^{${exponent || 'b'}} \\mod ${modulus || 'm'}$$`,
    euler_phi: `$$\\phi(n) = n \\prod_{p|n} \\left(1 - \\frac{1}{p}\\right)$$`,
  };

  return formulas[operation] || null;
}

function renderInputs(operation, params) {
  const entries = Object.entries(params).filter(
    ([key, val]) => val !== undefined && val !== null && val !== ''
  );

  if (entries.length === 0) return null;

  return (
    <div className="mb-4 space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Input
      </p>
      <div className="flex flex-wrap gap-3">
        {entries.map(([key, value]) => (
          <div
            key={key}
            className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800"
          >
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {key}
            </span>
            <span className="ml-2 font-mono text-slate-800 dark:text-slate-200">
              {String(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderSteps(operation, params, result) {
  if (operation === 'gcd' && params.a && params.b) {
    const steps = generateGCDSteps(Number(params.a), Number(params.b));
    if (steps.length > 0) {
      return (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Euclidean Algorithm Steps
          </p>
          <AnimatedSteps
            steps={steps}
            renderStep={(step, idx) => (
              <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/30">
                <KaTeX>{step}</KaTeX>
              </div>
            )}
          />
        </div>
      );
    }
  }

  return null;
}

function generateGCDSteps(a, b) {
  const steps = [];
  let x = Math.abs(a);
  let y = Math.abs(b);

  while (y !== 0) {
    const q = Math.floor(x / y);
    const r = x % y;
    steps.push(`$$${x} = ${q} \\times ${y} + ${r}$$`);
    x = y;
    y = r;
  }

  return steps;
}

function renderResult(operation, result) {
  if (result === null || result === undefined) {
    return <span className="text-slate-500">No result</span>;
  }

  if (operation === 'is_prime') {
    return (
      <span
        className={`text-3xl font-bold ${
          result
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-red-600 dark:text-red-400'
        }`}
      >
        {result ? 'Prime' : 'Not Prime'}
      </span>
    );
  }

  if (operation === 'prime_factors' && Array.isArray(result)) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {result.map((factor, idx) => (
          <React.Fragment key={idx}>
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="rounded-lg bg-indigo-100 px-3 py-1.5 font-mono text-lg font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
            >
              {Array.isArray(factor) ? `${factor[0]}^${factor[1]}` : factor}
            </motion.span>
            {idx < result.length - 1 && (
              <span className="text-xl text-slate-400">×</span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  if (operation === 'divisors' && Array.isArray(result)) {
    return (
      <div className="flex flex-wrap gap-2">
        {result.map((div, idx) => (
          <motion.span
            key={idx}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.03 }}
            className="rounded-lg bg-indigo-100 px-2 py-1 font-mono text-sm font-medium text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
          >
            {div}
          </motion.span>
        ))}
      </div>
    );
  }

  if (typeof result === 'object' && !Array.isArray(result)) {
    return (
      <div className="space-y-2">
        {Object.entries(result).map(([key, val]) => (
          <div key={key} className="flex items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">{key}:</span>
            <span className="font-mono text-lg font-bold text-indigo-700 dark:text-indigo-300">
              {String(val)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <span className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
      <KaTeX>{`$$${typeof result === 'number' ? result.toLocaleString() : result}$$`}</KaTeX>
    </span>
  );
}
