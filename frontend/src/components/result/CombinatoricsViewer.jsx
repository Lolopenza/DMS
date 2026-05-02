import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Calculator, ArrowRight, Sparkles } from 'lucide-react';
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
 * Step-by-step combinatorics result viewer.
 * Shows formula derivation with intermediate steps.
 *
 * @param {'factorial'|'permutation'|'combination'|'binomial'|'catalan'|'stirling'|'pigeonhole'} operation
 * @param {object} params - Input parameters (n, r, etc.)
 * @param {number|string} result - Final computed value
 */
export default function CombinatoricsViewer({ operation, params = {}, result }) {
  const steps = generateSteps(operation, params, result);
  const formula = getFormula(operation, params);
  const finalValue = result?.result ?? result;

  return (
    <AnimatedResult variant="slideUp" className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-center gap-2">
          <Calculator className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            {getOperationTitle(operation)}
          </h3>
        </div>

        {formula && (
          <div className="mb-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-900/50">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Formula
            </p>
            <div className="text-lg text-slate-900 dark:text-slate-100">
              <KaTeX>{formula}</KaTeX>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Step-by-Step Solution
          </p>
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-3"
            >
              <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                {idx + 1}
              </span>
              <div className="flex-1 rounded-lg border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/30">
                {step.explanation && (
                  <p className="mb-1 text-sm text-slate-600 dark:text-slate-400">
                    {step.explanation}
                  </p>
                )}
                <div className="text-slate-900 dark:text-slate-100">
                  <KaTeX>{step.formula}</KaTeX>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <HighlightResult>
        <div className="rounded-xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-5 dark:border-indigo-800 dark:from-indigo-950/50 dark:to-purple-950/50">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Final Answer
            </span>
          </div>
          <div className="mt-2 text-3xl font-bold text-indigo-700 dark:text-indigo-300">
            <KaTeX>{`$$${typeof finalValue === 'number' ? finalValue.toLocaleString() : finalValue}$$`}</KaTeX>
          </div>
        </div>
      </HighlightResult>
    </AnimatedResult>
  );
}

function getOperationTitle(operation) {
  const titles = {
    factorial: 'Factorial',
    permutation: 'Permutation',
    combination: 'Combination',
    binomial: 'Binomial Coefficient',
    catalan: 'Catalan Number',
    stirling: 'Stirling Number',
    pigeonhole: 'Pigeonhole Principle',
  };
  return titles[operation] || 'Calculation';
}

function getFormula(operation, params) {
  const { n, r, pigeons, holes, catalanN, stirlingN, stirlingK, binomialN, binomialK } = params;

  const formulas = {
    factorial: `$$n! = n \\cdot (n-1) \\cdot (n-2) \\cdot \\ldots \\cdot 2 \\cdot 1$$`,
    permutation: `$$P(n, r) = \\frac{n!}{(n-r)!}$$`,
    combination: `$$C(n, r) = \\binom{n}{r} = \\frac{n!}{r!(n-r)!}$$`,
    binomial: `$$\\binom{n}{k} = \\frac{n!}{k!(n-k)!}$$`,
    catalan: `$$C_n = \\frac{1}{n+1}\\binom{2n}{n} = \\frac{(2n)!}{(n+1)!n!}$$`,
    stirling: `$$S(n, k) = k \\cdot S(n-1, k) + S(n-1, k-1)$$`,
    pigeonhole: `$$\\left\\lceil \\frac{\\text{pigeons}}{\\text{holes}} \\right\\rceil$$`,
  };

  return formulas[operation] || null;
}

function generateSteps(operation, params, result) {
  const { n, r, pigeons, holes, catalanN, stirlingN, stirlingK, binomialN, binomialK } = params;
  const finalValue = result?.result ?? result;

  switch (operation) {
    case 'factorial': {
      const num = Number(n) || 0;
      if (num <= 10) {
        const factors = [];
        for (let i = num; i >= 1; i--) factors.push(i);
        return [
          { explanation: 'Apply the factorial definition', formula: `$$${num}! = ${factors.join(' \\times ')}$$` },
          { explanation: 'Compute the product', formula: `$$= ${finalValue}$$` },
        ];
      }
      return [
        { explanation: 'Apply the factorial definition', formula: `$$${num}! = ${num} \\times ${num - 1} \\times \\ldots \\times 2 \\times 1$$` },
        { explanation: 'Result', formula: `$$= ${finalValue}$$` },
      ];
    }

    case 'permutation': {
      const pn = Number(n) || 0;
      const pr = Number(r) || 0;
      return [
        { explanation: 'Apply the permutation formula', formula: `$$P(${pn}, ${pr}) = \\frac{${pn}!}{(${pn}-${pr})!}$$` },
        { explanation: 'Simplify the denominator', formula: `$$= \\frac{${pn}!}{${pn - pr}!}$$` },
        { explanation: 'Compute the result', formula: `$$= ${finalValue}$$` },
      ];
    }

    case 'combination': {
      const cn = Number(n) || 0;
      const cr = Number(r) || 0;
      return [
        { explanation: 'Apply the combination formula', formula: `$$C(${cn}, ${cr}) = \\frac{${cn}!}{${cr}!(${cn}-${cr})!}$$` },
        { explanation: 'Substitute values', formula: `$$= \\frac{${cn}!}{${cr}! \\times ${cn - cr}!}$$` },
        { explanation: 'Compute the result', formula: `$$= ${finalValue}$$` },
      ];
    }

    case 'binomial': {
      const bn = Number(binomialN) || 0;
      const bk = Number(binomialK) || 0;
      return [
        { explanation: 'Apply the binomial coefficient formula', formula: `$$\\binom{${bn}}{${bk}} = \\frac{${bn}!}{${bk}!(${bn}-${bk})!}$$` },
        { explanation: 'Substitute values', formula: `$$= \\frac{${bn}!}{${bk}! \\times ${bn - bk}!}$$` },
        { explanation: 'Compute the result', formula: `$$= ${finalValue}$$` },
      ];
    }

    case 'catalan': {
      const catN = Number(catalanN) || 0;
      return [
        { explanation: 'Apply the Catalan number formula', formula: `$$C_{${catN}} = \\frac{1}{${catN}+1}\\binom{2 \\times ${catN}}{${catN}}$$` },
        { explanation: 'Simplify', formula: `$$= \\frac{1}{${catN + 1}}\\binom{${2 * catN}}{${catN}}$$` },
        { explanation: 'Compute the result', formula: `$$= ${finalValue}$$` },
      ];
    }

    case 'stirling': {
      const sn = Number(stirlingN) || 0;
      const sk = Number(stirlingK) || 0;
      return [
        { explanation: 'Stirling number of the second kind', formula: `$$S(${sn}, ${sk})$$` },
        { explanation: 'Counts partitions of a set into non-empty subsets', formula: `$$= ${finalValue}$$` },
      ];
    }

    case 'pigeonhole': {
      const p = Number(pigeons) || 0;
      const h = Number(holes) || 0;
      return [
        { explanation: 'Apply the pigeonhole principle', formula: `$$\\left\\lceil \\frac{${p}}{${h}} \\right\\rceil$$` },
        { explanation: 'At least this many items in one container', formula: `$$= ${finalValue}$$` },
      ];
    }

    default:
      return [{ formula: `$$${finalValue}$$` }];
  }
}
