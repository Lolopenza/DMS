import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import InteractivePractice from '../../pages/user/InteractivePractice.jsx';
import { getLearningModuleCatalog } from '../../api.js';
import { getPracticeSkillTopicFallback } from '../../catalog/modulePracticeTopics.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { AUTH_SIGN_IN_PATH } from '../../routes.js';
import { Button, Card, CardHeader, Input, Select, Textarea } from '../ui/index.js';
import MathResultBox from './MathResultBox.jsx';
import SmartCalculatorInput from './SmartCalculatorInput.jsx';
import { MathResultViewer } from '../result/index.js';
import { loadModuleContent } from '../../data/content/index.js';

function getInitialOperation(operations = []) {
  return operations.find((operation) => operation.default)?.value || operations[0]?.value || '';
}

function getInitialValues(fields = []) {
  return fields.reduce((acc, field) => {
    acc[field.name] = field.defaultValue ?? '';
    return acc;
  }, {});
}

function isFieldVisible(field, operation, values = {}) {
  if (typeof field.visibleWhen === 'function') {
    return field.visibleWhen(values, operation);
  }
  if (!field.showWhen) return true;
  return field.showWhen.includes(operation);
}

function defaultBuildPayload({ operation, values, fields }) {
  const payload = operation ? { operation } : {};

  fields.forEach((field) => {
    if (!isFieldVisible(field, operation, values)) return;

    const rawValue = values[field.name];
    if (field.parse) {
      payload[field.name] = field.parse(rawValue, values);
      return;
    }

    const coerceNumber =
      field.smartType === 'validated-number' || field.type === 'number';
    payload[field.name] = coerceNumber ? Number(rawValue) : rawValue;
  });

  return payload;
}

function validatePracticeFields(fields, operation, values) {
  const errors = {};
  for (const field of fields) {
    if (!isFieldVisible(field, operation, values)) continue;
    const name = field.name;
    const raw = values[name];

    if (field.required) {
      const empty =
        raw === '' ||
        raw === undefined ||
        raw === null ||
        (typeof raw === 'string' && !String(raw).trim());
      if (empty) {
        errors[name] = 'This field is required.';
        continue;
      }
    }

    if (field.smartType === 'validated-number' || field.type === 'number') {
      if (raw !== '' && raw !== undefined && raw !== null) {
        const n = Number(raw);
        if (!Number.isFinite(n)) {
          errors[name] = 'Enter a valid number.';
        } else {
          if (typeof field.min === 'number' && n < field.min) {
            errors[name] = `Must be at least ${field.min}.`;
          }
          if (typeof field.max === 'number' && n > field.max) {
            errors[name] = `Must be at most ${field.max}.`;
          }
        }
      }
    }

    const fn = field.smartOptions?.validate;
    if (typeof fn === 'function') {
      const msg = fn(raw, values);
      if (msg) errors[name] = msg;
    }
  }
  return errors;
}

function FieldRenderer({ field, value, values, setValue, operation, fieldError }) {
  if (typeof field.render === 'function') {
    return field.render({ field, value, values, setValue });
  }

  if (field.smartType) {
    return (
      <SmartCalculatorInput
        field={field}
        value={value}
        values={values}
        setValue={setValue}
        operation={operation}
        error={fieldError}
      />
    );
  }

  const commonProps = {
    id: field.id || field.name,
    label: field.label,
    value,
    onChange: (event) => setValue(field.name, event.target.value),
    placeholder: field.placeholder,
    hint: field.hint,
    required: field.required,
    disabled: field.disabled,
  };

  if (field.type === 'select') {
    return <Select {...commonProps} options={field.options || []} />;
  }

  if (field.type === 'textarea') {
    return <Textarea {...commonProps} rows={field.rows || 4} />;
  }

  return <Input {...commonProps} type={field.type || 'text'} min={field.min} max={field.max} step={field.step} />;
}

function TheoryPanel({ theory = {} }) {
  return (
    <div className="space-y-5">
      {theory.overview ? (
        <Card variant="elevated" padding="lg">
          <CardHeader title="Theory" subtitle={theory.overview} />
        </Card>
      ) : null}

      {theory.videoUrl ? (
        <Card variant="default" padding="none" className="overflow-hidden">
          <div className="aspect-video bg-slate-100 dark:bg-slate-900">
            <iframe
              src={theory.videoUrl}
              title={theory.videoTitle || 'Module video'}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
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
              <MathResultBox
                key={formula.title}
                title={formula.title}
                content={formula.content}
                showCopy={false}
              />
            ))}
          </div>
        </Card>
      ) : null}

      {theory.examples?.length ? (
        <Card variant="default" padding="lg">
          <CardHeader title="Worked Examples" />
          <div className="mt-4 space-y-3">
            {theory.examples.map((example) => (
              <div key={example.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{example.title}</p>
                {example.content ? (
                  <div className="mt-3">
                    <MathResultBox title="Solution" content={example.content} showCopy={false} className="bg-transparent dark:bg-transparent border-slate-200/70 dark:border-slate-800/70" />
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

function PracticePanel({
  config,
  operation,
  values,
  loading,
  result,
  error,
  fieldErrors,
  onOperationChange,
  onValueChange,
  onSubmit,
  sticky = true,
}) {
  const practice = config.practice || {};
  const operations = practice.operations || [];
  const fields = practice.fields || [];
  const activeOperation = operations.find((item) => item.value === operation);
  const visibleFields = fields.filter((field) => isFieldVisible(field, operation, values));
  const ResultRenderer = practice.resultRenderer;

  return (
    <Card variant="elevated" padding="none" className={sticky ? 'sticky top-24' : ''}>
      <div className="border-b border-slate-200 p-6 dark:border-slate-800">
        <CardHeader
          title={practice.title || 'Interactive Practice'}
          subtitle={practice.description}
        />
      </div>

      <form className="space-y-5 p-6" onSubmit={onSubmit}>
        {operations.length > 1 ? (
          <Select
            id={`${config.id || 'module'}-operation`}
            label={practice.operationLabel || 'Operation'}
            value={operation}
            onChange={(event) => onOperationChange(event.target.value)}
            options={operations}
            hint={activeOperation?.hint}
          />
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {visibleFields.map((field) => (
            <div key={field.name} className={field.span === 'full' ? 'sm:col-span-2' : ''}>
              <FieldRenderer
                field={field}
                value={values[field.name] ?? ''}
                values={values}
                setValue={onValueChange}
                operation={operation}
                fieldError={fieldErrors[field.name]}
              />
            </div>
          ))}
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        ) : null}

        <Button type="submit" loading={loading} loadingLabel={practice.loadingLabel || 'Calculating...'} className="w-full">
          {practice.submitLabel || 'Calculate'}
        </Button>
      </form>

      <div className="border-t border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-800">
        {result ? (
          ResultRenderer ? (
            <ResultRenderer result={result} operation={operation} values={values} />
          ) : practice.formatResult ? (
            <MathResultBox title="Result" content={practice.formatResult(result, operation, values)} />
          ) : (
            <MathResultViewer
              data={result}
              module={config.id || config.moduleId}
              operation={operation}
              params={values}
            />
          )
        ) : (
          <MathResultViewer data={null} />
        )}
      </div>
    </Card>
  );
}

export default function ModuleExperience({ config }) {
  const { subject, module: moduleSlug } = useParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const layout = config.layout || 'split';
  const practice = config.practice || {};
  const fields = practice.fields || [];
  const operations = practice.operations || [];
  const [operation, setOperation] = useState(() => getInitialOperation(operations));
  const [values, setValues] = useState(() => getInitialValues(fields));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loadedTheory, setLoadedTheory] = useState(null);
  const [skillTopicForPractice, setSkillTopicForPractice] = useState(null);
  const [practiceCatalogLoading, setPracticeCatalogLoading] = useState(true);

  const activeOperation = useMemo(
    () => operations.find((item) => item.value === operation),
    [operation, operations],
  );

  function handleValueChange(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  function handleOperationChange(nextOperation) {
    setOperation(nextOperation);
    setResult(null);
    setError(null);
    setFieldErrors({});
  }

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (config?.theory) {
        setLoadedTheory(config.theory);
        return;
      }
      if (!subject || !moduleSlug) return;
      try {
        const content = await loadModuleContent(subject, moduleSlug);
        if (!cancelled) setLoadedTheory(content);
      } catch (e) {
        if (!cancelled) setLoadedTheory(null);
        console.error('Failed to load module content:', e);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [config, subject, moduleSlug]);

  useEffect(() => {
    let cancelled = false;
    async function resolvePracticeTopic() {
      if (!subject || !moduleSlug) {
        setSkillTopicForPractice(null);
        setPracticeCatalogLoading(false);
        return;
      }
      setPracticeCatalogLoading(true);
      try {
        const list = await getLearningModuleCatalog();
        if (cancelled) return;
        const fallback = getPracticeSkillTopicFallback(subject, moduleSlug);
        if (!Array.isArray(list)) {
          setSkillTopicForPractice(fallback);
          return;
        }
        const row = list.find(
          (e) => e.subjectSlug === subject && e.moduleSlug === moduleSlug,
        );
        setSkillTopicForPractice(row?.skillTopicSlug ?? fallback);
      } catch {
        if (!cancelled) {
          setSkillTopicForPractice(getPracticeSkillTopicFallback(subject, moduleSlug));
        }
      } finally {
        if (!cancelled) setPracticeCatalogLoading(false);
      }
    }
    resolvePracticeTopic();
    return () => {
      cancelled = true;
    };
  }, [subject, moduleSlug]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!practice.calculate) return;

    const validation = validatePracticeFields(fields, operation, values);
    if (Object.keys(validation).length) {
      setFieldErrors(validation);
      setError('Please fix the highlighted fields below.');
      return;
    }
    setFieldErrors({});

    setLoading(true);
    setError(null);

    try {
      const buildPayload = practice.buildPayload || defaultBuildPayload;
      const payload = buildPayload({ operation, values, fields, activeOperation });
      const data = await practice.calculate(payload);
      setResult(practice.mapResult ? practice.mapResult(data, { operation, values, payload }) : data);
    } catch (err) {
      setResult(null);
      setError(err?.message || 'Calculation failed. Please check the input and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-h-screen bg-[var(--dmc-bg-page)] text-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-6">
          <nav
            className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400"
            aria-label="Breadcrumb"
          >
            <Link className="hover:text-slate-900 dark:hover:text-slate-100" to="/tracks">
              Tracks
            </Link>
            <span className="text-slate-400">/</span>
            {subject ? (
              <>
                <Link className="hover:text-slate-900 dark:hover:text-slate-100" to={`/${subject}`}>
                  {config.eyebrow || subject}
                </Link>
                <span className="text-slate-400">/</span>
              </>
            ) : null}
            {subject && moduleSlug ? (
              <span className="text-slate-900 dark:text-slate-100">{config.title || moduleSlug}</span>
            ) : null}
          </nav>
        </div>

        <header className="mb-8 max-w-4xl">
          {config.eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              {config.eyebrow}
            </p>
          ) : null}
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-50 sm:text-4xl">
            {config.title}
          </h1>
          {config.subtitle ? (
            <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
              {config.subtitle}
            </p>
          ) : null}
          {skillTopicForPractice && !practiceCatalogLoading ? (
            <p className="mt-4 text-sm">
              <a
                href="#module-ai-practice"
                className="font-medium text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400"
              >
                AI practice for this topic — below the calculator (scroll down)
              </a>
            </p>
          ) : null}
        </header>

        {layout === 'stack' ? (
          <div className="space-y-6">
            <PracticePanel
              sticky={false}
              config={config}
              operation={operation}
              values={values}
              loading={loading}
              result={result}
              error={error}
              fieldErrors={fieldErrors}
              onOperationChange={handleOperationChange}
              onValueChange={handleValueChange}
              onSubmit={handleSubmit}
            />
            <TheoryPanel theory={loadedTheory || config.theory} />
          </div>
        ) : layout === 'canvas' ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)] lg:items-start">
            <div className="space-y-6">
              <TheoryPanel theory={loadedTheory || config.theory} />
            </div>
            <PracticePanel
              sticky={false}
              config={config}
              operation={operation}
              values={values}
              loading={loading}
              result={result}
              error={error}
              fieldErrors={fieldErrors}
              onOperationChange={handleOperationChange}
              onValueChange={handleValueChange}
              onSubmit={handleSubmit}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)] lg:items-start">
            <TheoryPanel theory={loadedTheory || config.theory} />
            <PracticePanel
              config={config}
              operation={operation}
              values={values}
              loading={loading}
              result={result}
              error={error}
              fieldErrors={fieldErrors}
              onOperationChange={handleOperationChange}
              onValueChange={handleValueChange}
              onSubmit={handleSubmit}
            />
          </div>
        )}

        {skillTopicForPractice && !practiceCatalogLoading ? (
          <div
            id="module-ai-practice"
            className="scroll-mt-28 mt-12 max-w-4xl border-t border-slate-200 pt-10 dark:border-slate-800"
          >
            {authLoading ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading practice…</p>
            ) : isAuthenticated ? (
              <InteractivePractice
                fixedTopicSlug={skillTopicForPractice}
                compact
                sectionTitle="Knowledge check"
              />
            ) : (
              <Card variant="elevated" padding="lg" className="border-indigo-200/60 dark:border-indigo-900/40">
                <CardHeader
                  title="Knowledge check (AI)"
                  subtitle="Sign in to generate problems for this topic and update your Bayesian skill profile (BKT)."
                />
                <div className="mt-4">
                  <Link
                    to={AUTH_SIGN_IN_PATH}
                    className="inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                  >
                    Sign in to practice
                  </Link>
                </div>
              </Card>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
