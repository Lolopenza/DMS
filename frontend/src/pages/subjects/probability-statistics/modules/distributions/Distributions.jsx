import React from 'react';
import { calcProbability } from '../../../../../api.js';
import MathResultBox from '../../../../../components/module/MathResultBox.jsx';
import ModuleExperience from '../../../../../components/module/ModuleExperience.jsx';
import distributionsTheory from '../../../../../data/content/probability-statistics/distributions.content.js';

function DistributionsResult({ result }) {
  if (!result) return null;
  const inner = result?.result ?? result;
  const numeric = typeof inner === 'number' ? inner : null;
  const summary =
    inner && typeof inner === 'object'
      ? {
          mean: typeof inner.mean === 'number' ? inner.mean : null,
          variance: typeof inner.variance === 'number' ? inner.variance : null,
          pmf_at_k: typeof inner.pmf_at_k === 'number' ? inner.pmf_at_k : null,
        }
      : null;

  if (summary && (summary.mean !== null || summary.variance !== null || summary.pmf_at_k !== null)) {
    const lines = [
      summary.mean !== null ? `\\mathbb{E}[X]=${summary.mean}` : null,
      summary.variance !== null ? `\\mathrm{Var}(X)=${summary.variance}` : null,
      summary.pmf_at_k !== null ? `P(X=k)=${summary.pmf_at_k}` : null,
    ].filter(Boolean);

    function formatStepsText(raw) {
      const s = String(raw || '').trim();
      if (!s) return null;
      // Known short hints from backend, render as math.
      if (/^Binomial:\s*mean=np,\s*variance=np\(1-p\)\s*$/i.test(s)) {
        return '$$\\text{Binomial: }\\mathbb{E}[X]=np,\\;\\mathrm{Var}(X)=np(1-p)$$';
      }
      if (/^Poisson:\s*mean=lambda,\s*variance=lambda\s*$/i.test(s)) {
        return '$$\\text{Poisson: }\\mathbb{E}[X]=\\lambda,\\;\\mathrm{Var}(X)=\\lambda$$';
      }
      if (/^Geometric:\s*mean=1\/p,\s*variance=\(1-p\)\/p\^2\s*$/i.test(s)) {
        return '$$\\text{Geometric: }\\mathbb{E}[X]=\\frac{1}{p},\\;\\mathrm{Var}(X)=\\frac{1-p}{p^2}$$';
      }
      return `**Steps:** ${s}`;
    }

    return (
      <div className="space-y-3">
        <MathResultBox title="Result" content={`$$${lines.join('\\\\') }$$`} />
        {typeof result?.steps === 'string' && result.steps.trim() ? (
          <MathResultBox title="Steps" content={formatStepsText(result.steps)} showCopy={false} />
        ) : null}
      </div>
    );
  }
  return (
    <MathResultBox
      title="Result"
      content={
        typeof numeric === 'number'
          ? `$$${numeric.toFixed(6)}$$`
          : `\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``
      }
    />
  );
}

const distributionsConfig = {
  id: 'distributions',
  eyebrow: 'Probability & Statistics',
  title: 'Distributions',
  subtitle: 'PMF and summary metrics for common discrete distributions.',
  theory: distributionsTheory,
  practice: {
    title: 'Distribution toolkit',
    description: 'Pick an operation and fill the needed parameters.',
    operationLabel: 'Operation',
    submitLabel: 'Calculate',
    loadingLabel: 'Calculating...',
    calculate: calcProbability,
    buildPayload: ({ operation, values }) => {
      const payload = { operation };
      if (operation === 'distribution_summary') {
        payload.dist = values.dist;
        payload.k = Number(values.k);
        if (values.dist === 'binomial') {
          payload.n = Number(values.n);
          payload.p = Number(values.p);
        } else if (values.dist === 'poisson') {
          payload.lambda_ = Number(values.lambda_);
        } else {
          payload.p = Number(values.p);
        }
        return payload;
      }

      if (operation === 'binomial_pmf') {
        return { operation, n: Number(values.n), p: Number(values.p), k: Number(values.k) };
      }
      if (operation === 'poisson_pmf') {
        return { operation, lambda_: Number(values.lambda_), k: Number(values.k) };
      }
      return { operation, p: Number(values.p), k: Number(values.k) };
    },
    mapResult: (data) => data,
    resultRenderer: (props) => <DistributionsResult {...props} />,
    operations: [
      { value: 'distribution_summary', label: 'Distribution summary', default: true },
      { value: 'binomial_pmf', label: 'Binomial PMF' },
      { value: 'poisson_pmf', label: 'Poisson PMF' },
      { value: 'geometric_pmf', label: 'Geometric PMF' },
    ],
    fields: [
      {
        name: 'dist',
        label: 'Distribution',
        type: 'select',
        defaultValue: 'binomial',
        options: [
          { value: 'binomial', label: 'Binomial' },
          { value: 'poisson', label: 'Poisson' },
          { value: 'geometric', label: 'Geometric' },
        ],
        showWhen: ['distribution_summary'],
      },
      { name: 'n', label: 'n', type: 'number', min: 0, defaultValue: 10, showWhen: ['distribution_summary', 'binomial_pmf'] },
      { name: 'p', label: 'p', type: 'number', min: 0, max: 1, step: 0.01, defaultValue: 0.4, showWhen: ['distribution_summary', 'binomial_pmf', 'geometric_pmf'] },
      { name: 'lambda_', label: 'lambda', type: 'number', min: 0, step: 0.1, defaultValue: 2.5, showWhen: ['distribution_summary', 'poisson_pmf'] },
      { name: 'k', label: 'k', type: 'number', min: 0, defaultValue: 3, showWhen: ['distribution_summary', 'binomial_pmf', 'poisson_pmf', 'geometric_pmf'] },
    ],
  },
};

export default function Distributions() {
  return <ModuleExperience config={distributionsConfig} />;
}
