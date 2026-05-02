import React, { useEffect, useState } from 'react';
import { useCalculator } from '../../../../hooks/useCalculator.js';
import { parseNumber, parseNumberArray } from '../../../../utils/parsers.js';
import CalculatorCard from '../../../../components/module/CalculatorCard.jsx';
import { StepByStepRenderer, ComplexityBadge, ALGORITHM_COMPLEXITY } from '../../../../components/module/StepByStepRenderer.jsx';
import MathResultBox from '../../../../components/module/MathResultBox.jsx';
import { Card, CardHeader } from '../../../../components/ui/index.js';
import { loadModuleContent } from '../../../../data/content/index.js';
import { FormGroup, FormSelect, FormTextarea, CalculateButton } from '../../../../components/module/FormInputs.jsx';
import SmartCalculatorInput from '../../../../components/module/SmartCalculatorInput.jsx';

function resolveSmartType(field) {
  if (field.smartType) return field.smartType;
  if (field.type === 'number-array' || field.key === 'array') return 'number-list';
  return null;
}

function validateAlgoFields(fields, operation, fieldValues) {
  const errors = {};
  for (const field of fields) {
    if (field.showWhen && !field.showWhen.includes(operation)) continue;
    if (!field.required) continue;
    const raw = fieldValues[field.key];
    if (raw === '' || raw === undefined || raw === null) errors[field.key] = 'This field is required.';
  }
  return errors;
}

/**
 * Premium Algorithms Module Shell.
 * Refactored to use Gold Standard stack:
 * - CalculatorCard for premium UI
 * - useCalculator for state management
 * - StepByStepRenderer for algorithm visualization
 * - ComplexityBadge for Big O notation
 * - parsers.js for input parsing
 * 
 * Used by 8 modules: Sorting, Searching, DynamicProgramming, Greedy,
 * DivideConquer, GraphAlgorithms, StringAlgorithms, AsymptoticAnalysis
 */

/**
 * Visualizes an array with bars (kept from old shell - it's good!)
 */
function ArrayBars({ values = [], label }) {
  if (!values.length) return null;
  const maxAbs = Math.max(...values.map((n) => Math.abs(n)), 1);
  
  return (
    <div className="mb-4">
      {label && <p className="text-sm font-semibold text-slate-700 mb-2">{label}</p>}
      <div className="flex items-end gap-1 h-32 bg-slate-50 rounded-lg p-4 border border-slate-200">
        {values.map((value, index) => {
          const height = `${Math.max((Math.abs(value) / maxAbs) * 100, 8)}%`;
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end justify-center" style={{ height: '85%' }}>
                <div
                  className="w-full bg-indigo-500 rounded-t transition-all hover:bg-indigo-600"
                  style={{ height }}
                  title={`Value: ${value}`}
                />
              </div>
              <span className="text-xs font-mono font-semibold text-slate-600">{value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatPill({ label, value, tone = 'indigo', mono = false }) {
  const tones = {
    indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
  };
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 border rounded-lg ${tones[tone] || tones.indigo}`}>
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <span className={`text-sm font-bold ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

function ResultSection({ title, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

/**
 * Result renderer for algorithm outputs.
 */
function AlgorithmResultRenderer({ result, operation, inputArray }) {
  if (result === null || result === undefined) return null;
  const inner = result?.result ?? result;

  // Handle error responses
  if (inner?.error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
        <p className="text-sm font-semibold text-red-700 dark:text-red-400">Calculation Error</p>
        <p className="text-sm text-red-600 dark:text-red-300 mt-1">{inner.error}</p>
      </div>
    );
  }

  // Handle step-by-step execution
  if (inner?.steps && Array.isArray(inner.steps)) {
    return (
      <div className="space-y-4">
        {/* Final result array */}
        {inner.result && Array.isArray(inner.result) && (
          <ArrayBars values={inner.result} label="Final Result" />
        )}

        {/* Metrics summary */}
        {inner.metrics && (
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(inner.metrics).map(([key, value]) => (
              <div
                key={key}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg"
              >
                <span className="text-sm font-medium text-slate-600 capitalize">
                  {key.replace(/_/g, ' ')}:
                </span>
                <span className="text-lg font-bold text-indigo-600">{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Step-by-step visualization */}
        <StepByStepRenderer steps={inner.steps} title="Algorithm Execution" />
      </div>
    );
  }

  // Handle simple array result (sorted array, search result, etc.)
  if (Array.isArray(inner)) {
    return (
      <div className="space-y-4">
        <ArrayBars values={inner} label="Result" />
        {inputArray && (
          <div className="text-sm text-slate-600">
            <span className="font-semibold">Input:</span> [{inputArray.join(', ')}]
            <br />
            <span className="font-semibold">Output:</span> [{inner.join(', ')}]
          </div>
        )}
      </div>
    );
  }

  // Sorting result: { sorted, comparisons?, swaps?, complexity? }
  if (inner?.sorted && Array.isArray(inner.sorted)) {
    return (
      <div className="space-y-4">
        <ArrayBars values={inner.sorted} label="Sorted Result" />
        <div className="flex flex-wrap gap-2">
          {typeof inner.comparisons === 'number' ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg">
              <span className="text-sm font-medium text-slate-600">Comparisons:</span>
              <span className="text-lg font-bold text-indigo-600">{inner.comparisons}</span>
            </div>
          ) : null}
          {typeof inner.swaps === 'number' ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg">
              <span className="text-sm font-medium text-slate-600">Swaps:</span>
              <span className="text-lg font-bold text-indigo-600">{inner.swaps}</span>
            </div>
          ) : null}
          {typeof inner.complexity === 'string' ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg">
              <span className="text-sm font-medium text-slate-600">Complexity:</span>
              <span className="text-sm font-bold text-slate-800 font-mono">{inner.complexity}</span>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // Searching result: { found, index, iterations, sorted? }
  if (inner && typeof inner === 'object' && typeof inner.found === 'boolean' && typeof inner.index === 'number') {
    const foundText = inner.found ? 'Found' : 'Not found';
    return (
      <div className="space-y-3">
        <MathResultBox
          title="Result"
          content={`$$\\text{${foundText}}\\quad (\\text{index }=${inner.index})$$`}
          showCopy={false}
        />
        {Array.isArray(inner.sorted) ? <ArrayBars values={inner.sorted} label="Sorted array (used by binary search)" /> : null}
        <div className="flex flex-wrap gap-2">
          {typeof inner.iterations === 'number' ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg">
              <span className="text-sm font-medium text-slate-600">Iterations:</span>
              <span className="text-lg font-bold text-indigo-600">{inner.iterations}</span>
            </div>
          ) : null}
          {typeof inner.complexity === 'string' ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg">
              <span className="text-sm font-medium text-slate-600">Complexity:</span>
              <span className="text-sm font-bold text-slate-800 font-mono">{inner.complexity}</span>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // Handle scalar result (power, etc.)
  if (typeof inner === 'number') {
    return (
      <MathResultBox
        title="Result"
        content={`$$\\text{Result} = ${inner}$$`}
      />
    );
  }

  // Handle object result
  if (inner && typeof inner === 'object') {
    // Graph traversal result: { traversal, visited, complexity }
    if (Array.isArray(inner.traversal)) {
      const pathText = inner.traversal.join(' → ');
      return (
        <div className="space-y-4">
          <ResultSection title="Traversal order">
            <MathResultBox content={`\`\`\`text\n${pathText}\n\`\`\``} showCopy={false} />
          </ResultSection>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(inner.visited) ? <StatPill label="Visited" value={`${inner.visited.length}`} tone="emerald" /> : null}
            {typeof inner.complexity === 'string' ? <StatPill label="Complexity" value={inner.complexity} mono tone="slate" /> : null}
          </div>
          {Array.isArray(inner.visited) ? (
            <ResultSection title="Visited set">
              <MathResultBox content={`\`\`\`text\n${inner.visited.join(', ')}\n\`\`\``} showCopy={false} />
            </ResultSection>
          ) : null}
        </div>
      );
    }

    // Asymptotic analysis: time complexity evaluation
    if (operation === 'time-complexity' && typeof inner.operations === 'number') {
      const reasonByClass = {
        constant: 'Constant work (no loop dependent on n).',
        logarithmic: 'Each step halves the remaining problem size (e.g., binary search).',
        linear: 'One pass over n items (single loop).',
        linearithmic: 'log n levels, each doing O(n) work (e.g., merge sort).',
        quadratic: 'Two nested loops over n (pairwise comparisons).',
        cubic: 'Three nested loops over n (triple combinations).',
        exponential: 'Branching recursion that doubles work per increment (e.g., naive subsets).',
        factorial: 'Enumerating all permutations (n!).',
      };
      const why = reasonByClass[String(inner.complexity || '').toLowerCase()] || null;
      return (
        <div className="space-y-4">
          <ResultSection title="Estimated operations">
            <MathResultBox
              content={`$$\\text{Ops}(n=${inner.inputSize})\\approx ${inner.operations}$$`}
              showCopy={false}
            />
          </ResultSection>
          <div className="flex flex-wrap gap-2">
            {typeof inner.complexity === 'string' ? <StatPill label="Complexity" value={inner.complexity} mono tone="slate" /> : null}
            {typeof inner.inputSize === 'number' ? <StatPill label="n" value={inner.inputSize} tone="amber" /> : null}
          </div>
          {why ? (
            <ResultSection title="Why this class?">
              <MathResultBox content={why} showCopy={false} />
            </ResultSection>
          ) : null}
        </div>
      );
    }

    // Asymptotic analysis: compare complexities
    if (operation === 'compare-complexities' && Array.isArray(inner.comparison)) {
      const lines = inner.comparison
        .map((row) => `${String(row.type).padEnd(14)}  ${row.value}`)
        .join('\n');
      return (
        <div className="space-y-4">
          <ResultSection title="Comparison (n = 1000)">
            <MathResultBox content={`\`\`\`text\n${lines}\n\`\`\``} showCopy={false} />
          </ResultSection>
          <div className="flex flex-wrap gap-2">
            {inner.fastest?.type ? <StatPill label="Fastest" value={inner.fastest.type} tone="emerald" mono /> : null}
            {inner.slowest?.type ? <StatPill label="Slowest" value={inner.slowest.type} tone="amber" mono /> : null}
          </div>
        </div>
      );
    }

    // Dynamic programming Fibonacci: { result, memo }
    if (operation === 'fibonacci' && typeof inner.result === 'number' && Array.isArray(inner.memo)) {
      return (
        <div className="space-y-4">
          <ResultSection title="Result">
            <MathResultBox content={`$$F(n)=${inner.result}$$`} showCopy={false} />
          </ResultSection>
          <div className="flex flex-wrap gap-2">
            {typeof inner.steps === 'number' ? <StatPill label="Steps" value={inner.steps} tone="indigo" /> : null}
            {typeof inner.complexity === 'string' ? <StatPill label="Complexity" value={inner.complexity} mono tone="slate" /> : null}
          </div>
          <ResultSection title="DP table">
            <MathResultBox
              content={`\`\`\`text\n${inner.memo.map((v, i) => `F(${i}) = ${v}`).join('\n')}\n\`\`\``}
              showCopy={false}
            />
          </ResultSection>
        </div>
      );
    }

    // Coin change: { ways }
    if (operation === 'coin-change' && typeof inner.ways === 'number') {
      return (
        <div className="space-y-3">
          <ResultSection title="Ways">
            <MathResultBox content={`$$\\text{Ways}=${inner.ways}$$`} showCopy={false} />
          </ResultSection>
          <div className="flex flex-wrap gap-2">
            {typeof inner.complexity === 'string' ? <StatPill label="Complexity" value={inner.complexity} mono tone="slate" /> : null}
          </div>
        </div>
      );
    }

    // String algorithms: { matches, count }
    if (Array.isArray(inner.matches) && typeof inner.count === 'number') {
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <StatPill label="Matches" value={inner.count} tone="emerald" />
            {typeof inner.complexity === 'string' ? <StatPill label="Complexity" value={inner.complexity} mono tone="slate" /> : null}
          </div>
          <ResultSection title="Match indices">
            <MathResultBox content={`\`\`\`text\n${inner.matches.join(', ')}\n\`\`\``} showCopy={false} />
          </ResultSection>
        </div>
      );
    }

    // Greedy fractional knapsack: { value, weight, items, complexity }
    if (operation === 'fractional-knapsack' && Array.isArray(inner.items)) {
      const table = [
        'value   weight  ratio   fraction',
        ...inner.items.map((it) => {
          const v = Number(it.value).toFixed(3).padEnd(7);
          const w = Number(it.weight).toFixed(3).padEnd(7);
          const r = Number(it.ratio).toFixed(3).padEnd(7);
          const f = Number(it.fraction).toFixed(3);
          return `${v} ${w} ${r} ${f}`;
        }),
      ].join('\n');
      return (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {typeof inner.value === 'number' ? <StatPill label="Total value" value={inner.value.toFixed(4)} tone="emerald" mono /> : null}
            {typeof inner.weight === 'number' ? <StatPill label="Total weight" value={inner.weight.toFixed(4)} tone="amber" mono /> : null}
            {typeof inner.complexity === 'string' ? <StatPill label="Complexity" value={inner.complexity} mono tone="slate" /> : null}
          </div>
          <ResultSection title="Selected items (sorted by value/weight)">
            <MathResultBox content={`\`\`\`text\n${table}\n\`\`\``} showCopy={false} />
          </ResultSection>
        </div>
      );
    }

    // Divide & conquer binary power: { result, complexity }
    if (operation === 'binary-power' && typeof inner.result === 'number') {
      return (
        <div className="space-y-3">
          <ResultSection title="Result">
            <MathResultBox content={`$$\\text{Result}=${inner.result}$$`} showCopy={false} />
          </ResultSection>
          <div className="flex flex-wrap gap-2">
            {typeof inner.complexity === 'string' ? <StatPill label="Complexity" value={inner.complexity} mono tone="slate" /> : null}
          </div>
        </div>
      );
    }

    // Fallback: JSON
    return <MathResultBox content={`\`\`\`json\n${JSON.stringify(inner, null, 2)}\n\`\`\``} />;
  }

  // Fallback
  return <MathResultBox content={String(inner)} />;
}

function TheoryPanel({ theory }) {
  if (!theory) return null;

  return (
    <div className="space-y-5">
      {theory.overview ? (
        <Card variant="elevated" padding="lg">
          <CardHeader title="Theory" subtitle={theory.overview} />
        </Card>
      ) : null}

      {theory.outcomes?.length ? (
        <Card variant="default" padding="lg">
          <CardHeader title="Learning Outcomes" />
          <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
            {theory.outcomes.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400 dark:bg-slate-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {theory.formulas?.length ? (
        <Card variant="default" padding="lg">
          <CardHeader title="Formula Reference" subtitle="Core identities used by this module." />
          <div className="mt-5 space-y-4">
            {theory.formulas.map((formula) => (
              <MathResultBox key={formula.title} title={formula.title} content={formula.content} showCopy={false} />
            ))}
          </div>
        </Card>
      ) : null}

      {theory.examples?.length ? (
        <Card variant="default" padding="lg">
          <CardHeader title="Worked Examples" />
          <div className="mt-4 space-y-3">
            {theory.examples.map((example) => (
              <div
                key={example.title}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{example.title}</p>
                {example.content ? (
                  <div className="mt-3">
                    <MathResultBox
                      title="Solution"
                      content={example.content}
                      showCopy={false}
                      className="bg-transparent dark:bg-transparent border-slate-200/70 dark:border-slate-800/70"
                    />
                  </div>
                ) : (
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">{example.description}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

export default function AlgorithmsModuleShell({
  title,
  subtitle,
  description,
  module,
  operationOptions,
  defaultOperation,
  fields,
  calculate,
  theory: theoryOverride,
}) {
  const [operation, setOperation] = useState(defaultOperation);
  const [theory, setTheory] = useState(theoryOverride || null);
  const [fieldValues, setFieldValues] = useState(() => {
    const initial = {};
    fields.forEach((field) => {
      initial[field.key] = field.defaultValue || '';
    });
    return initial;
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const { result, loading, calculate: executeCalculation } = useCalculator(calculate, {
    successMessage: 'Algorithm executed successfully',
  });

  const selectedOp = operationOptions.find((op) => op.value === operation);
  const complexity = ALGORITHM_COMPLEXITY[operation];

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (theoryOverride) {
        setTheory(theoryOverride);
        return;
      }
      if (!module) return;
      try {
        const loaded = await loadModuleContent('algorithms', module);
        if (!cancelled) setTheory(loaded);
      } catch (e) {
        if (!cancelled) setTheory(null);
        console.error('Failed to load algorithms content:', e);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [module, theoryOverride]);

  function handleFieldChange(key, value) {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function handleCalculate() {
    const validation = validateAlgoFields(fields, operation, fieldValues);
    if (Object.keys(validation).length) {
      setFieldErrors(validation);
      return;
    }
    setFieldErrors({});

    try {
      // Parse field values based on their types
      const payload = { module, operation };
      
      for (const field of fields) {
        // Skip fields that shouldn't be shown for current operation
        if (field.showWhen && !field.showWhen.includes(operation)) {
          continue;
        }

        const rawValue = fieldValues[field.key];
        
        // Parse based on field type
        let parsedValue;
        if (field.type === 'number') {
          parsedValue = parseNumber(rawValue, field.label);
        } else if (
          field.type === 'number-array'
          || field.key === 'array'
          || field.smartType === 'number-list'
        ) {
          parsedValue = parseNumberArray(rawValue, field.label);
        } else {
          parsedValue = rawValue;
        }

        payload[field.key] = parsedValue;
      }

      await executeCalculation(payload);
    } catch (err) {
      // Error already handled by useCalculator
    }
  }

  // Filter fields based on current operation
  const visibleFields = fields.filter((field) => {
    if (!field.showWhen) return true;
    return field.showWhen.includes(operation);
  });

  // Get input array for comparison
  const inputArray = fieldValues.array ? fieldValues.array.split(',').map(v => Number(v.trim())).filter(v => !isNaN(v)) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{title}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">{subtitle}</p>
      </div>

      {theory ? <div className="mb-8"><TheoryPanel theory={theory} /></div> : null}

      <CalculatorCard
        title="Algorithm Simulator"
        description={description || "Visualize algorithm execution with step-by-step breakdown and complexity analysis"}
        resultComponent={
          result ? (
            <AlgorithmResultRenderer 
              result={result} 
              operation={operation}
              inputArray={inputArray}
            />
          ) : null
        }
      >
        {/* Operation selector */}
        <FormSelect
          label="Algorithm"
          value={operation}
          onChange={(e) => setOperation(e.target.value)}
          options={operationOptions}
          hint={selectedOp?.hint}
        />

        {/* Complexity badge */}
        {complexity && (
          <ComplexityBadge
            time={complexity.time}
            space={complexity.space}
            algorithm={selectedOp?.label}
          />
        )}

        {/* Dynamic fields based on operation */}
        {visibleFields.map((field) => {
          const st = resolveSmartType(field);
          if (st) {
            return (
              <SmartCalculatorInput
                key={field.key}
                field={{
                  ...field,
                  name: field.key,
                  smartType: st,
                  smartOptions: field.smartOptions,
                  required: Boolean(field.required),
                }}
                value={fieldValues[field.key] ?? ''}
                values={fieldValues}
                setValue={handleFieldChange}
                operation={operation}
                error={fieldErrors[field.key]}
              />
            );
          }

          if (field.type === 'textarea') {
            return (
              <FormTextarea
                key={field.key}
                label={field.label}
                value={fieldValues[field.key]}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                rows={4}
                placeholder={field.defaultValue}
                hint={field.hint}
                required
              />
            );
          }

          if (field.type === 'select') {
            return (
              <FormSelect
                key={field.key}
                label={field.label}
                value={fieldValues[field.key] ?? ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                options={field.options || []}
                hint={field.hint}
                required={Boolean(field.required)}
                error={fieldErrors[field.key]}
              />
            );
          }

          return (
            <FormGroup
              key={field.key}
              label={field.label}
              value={fieldValues[field.key]}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              type={field.type === 'number' ? 'number' : 'text'}
              placeholder={field.defaultValue}
              hint={field.hint}
              required
            />
          );
        })}

        {/* Calculate button */}
        <CalculateButton loading={loading} onClick={handleCalculate}>
          {loading ? 'Executing...' : 'Run Algorithm'}
        </CalculateButton>
      </CalculatorCard>
    </div>
  );
}
