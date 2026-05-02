import React from 'react';
import { calcProbability } from '../../../../../api.js';
import MathResultBox from '../../../../../components/module/MathResultBox.jsx';
import ModuleExperience from '../../../../../components/module/ModuleExperience.jsx';
import probabilityBasicsTheory from '../../../../../data/content/probability-statistics/probability-basics.content.js';

function fmtProb(x) {
  const n = Number(x);
  if (!Number.isFinite(n)) return String(x);
  const s = n.toFixed(8).replace(/\.?0+$/, '');
  return s || '0';
}

/** Handles flat API payloads or nested `{ result: { ... } }` from proxies. */
function unwrapIndependencePayload(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (typeof raw.expected_joint === 'number' && typeof raw.actual_joint === 'number') {
    const independent =
      typeof raw.result === 'boolean'
        ? raw.result
        : Math.abs(raw.actual_joint - raw.expected_joint) < 1e-10;
    return {
      result: independent,
      expected_joint: raw.expected_joint,
      actual_joint: raw.actual_joint,
      steps: raw.steps,
    };
  }
  const inner = raw.result;
  if (inner && typeof inner === 'object' && typeof inner.expected_joint === 'number' && typeof inner.actual_joint === 'number') {
    const independent =
      typeof inner.result === 'boolean'
        ? inner.result
        : Math.abs(inner.actual_joint - inner.expected_joint) < 1e-10;
    return {
      result: independent,
      expected_joint: inner.expected_joint,
      actual_joint: inner.actual_joint,
      steps: inner.steps,
    };
  }
  return null;
}

function ProbabilityBasicsResult({ result, operation, values }) {
  if (!result) return null;

  if (operation === 'independence_check') {
    const payload = unwrapIndependencePayload(result);
    if (payload) {
      const independent = payload.result === true;
      const exp = payload.expected_joint;
      const act = payload.actual_joint;
      const stepsText = typeof payload.steps === 'string' ? payload.steps.trim() : '';
      const title = independent ? 'Independent' : 'Not independent';
      const pa = fmtProb(values.pA);
      const pb = fmtProb(values.pB);
      const content = `Events are **${independent ? 'independent' : 'dependent'}**: compare $P(A \\cap B)$ with $P(A)P(B)$.

$$P(A)P(B)=${pa}\\cdot${pb}=${fmtProb(exp)}$$

$$P(A \\cap B)=${fmtProb(act)}$$

${stepsText ? `\n\n**Reasoning:** ${stepsText}` : ''}`;
      return <MathResultBox title={title} content={content} />;
    }
  }

  const numeric = typeof result?.result === 'number' ? result.result : null;

  const contentByOp = {
    simple:
      typeof numeric === 'number'
        ? `$$P(A)=\\frac{${values.favorable}}{${values.total}} \\approx ${numeric.toFixed(6)}$$`
        : null,
    complement: typeof numeric === 'number' ? `$$P(A^c)=1-P(A)=1-${values.pEvent}=${numeric.toFixed(6)}$$` : null,
    union:
      typeof numeric === 'number'
        ? `$$P(A\\cup B)=P(A)+P(B)-P(A\\cap B) = ${values.pA}+${values.pB}-${values.pAandB}=${numeric.toFixed(6)}$$`
        : null,
    independence_check: null,
  };

  return (
    <MathResultBox
      title="Result"
      content={contentByOp[operation] || `\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``}
    />
  );
}

const probabilityBasicsConfig = {
  id: 'probability-basics',
  eyebrow: 'Probability & Statistics',
  title: 'Probability Basics',
  subtitle: 'Foundations: simple probability, union, complement, independence.',
  theory: probabilityBasicsTheory,
  practice: {
    title: 'Core Probability',
    description: 'Choose an operation and fill in the required parameters.',
    operationLabel: 'Operation',
    submitLabel: 'Calculate',
    loadingLabel: 'Calculating...',
    calculate: calcProbability,
    buildPayload: ({ operation, values }) => {
      if (operation === 'simple') {
        return { operation, favorable: Number(values.favorable), total: Number(values.total) };
      }
      if (operation === 'complement') {
        return { operation, pEvent: Number(values.pEvent) };
      }
      return {
        operation,
        pA: Number(values.pA),
        pB: Number(values.pB),
        pAandB: Number(values.pAandB),
      };
    },
    mapResult: (data) => data,
    resultRenderer: (props) => <ProbabilityBasicsResult {...props} />,
    operations: [
      { value: 'simple', label: 'Simple probability', hint: 'P = favorable / total', default: true },
      { value: 'union', label: 'Union P(A ∪ B)', hint: 'P(A) + P(B) − P(A ∩ B)' },
      { value: 'complement', label: "Complement P(A')", hint: '1 − P(A)' },
      { value: 'independence_check', label: 'Independence check', hint: 'Compare P(A∩B) with P(A)P(B)' },
    ],
    fields: [
      { name: 'favorable', label: 'Favorable outcomes', type: 'number', min: 0, defaultValue: 3, required: true, showWhen: ['simple'] },
      { name: 'total', label: 'Total outcomes', type: 'number', min: 1, defaultValue: 10, required: true, showWhen: ['simple'] },
      { name: 'pEvent', label: 'P(A)', type: 'number', min: 0, max: 1, step: 0.01, defaultValue: 0.2, required: true, showWhen: ['complement'] },
      { name: 'pA', label: 'P(A)', type: 'number', min: 0, max: 1, step: 0.01, defaultValue: 0.6, required: true, showWhen: ['union', 'independence_check'] },
      { name: 'pB', label: 'P(B)', type: 'number', min: 0, max: 1, step: 0.01, defaultValue: 0.5, required: true, showWhen: ['union', 'independence_check'] },
      { name: 'pAandB', label: 'P(A ∩ B)', type: 'number', min: 0, max: 1, step: 0.01, defaultValue: 0.3, required: true, showWhen: ['union', 'independence_check'] },
    ],
  },
};

export default function ProbabilityBasics() {
  return <ModuleExperience config={probabilityBasicsConfig} />;
}
