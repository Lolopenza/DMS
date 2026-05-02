import React from 'react';
import { Button, Input, MathInput, Select, Textarea } from '../ui/index.js';
import { parseMatrix as parseLinearAlgebraMatrix } from '../../utils/parsers.js';

/** @typedef {'validated-number'|'number-list'|'matrix-grid'|'vector-list'|'edge-list'|'set-list'|'relation-pairs'|'formula'|'raw-text'|'raw-textarea'} SmartType */

function fieldId(field) {
  return field.id || field.name || field.key || 'field';
}

function fieldKey(field) {
  return field.name ?? field.key ?? '';
}

/** --- Matrix helpers (newline / space — adjacency style) --- */
function parseMatrixLines(raw) {
  const rows = String(raw || '')
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  return rows.map((line) =>
    line
      .split(/[\s,;]+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => Number(item)),
  );
}

function normalizeMatrix(matrix, rows, cols) {
  const r = Math.max(1, rows);
  const c = Math.max(1, cols);
  return Array.from({ length: r }, (_, i) =>
    Array.from({ length: c }, (_, j) => {
      const val = matrix?.[i]?.[j];
      return Number.isFinite(val) ? val : 0;
    }),
  );
}

function matrixToLines(matrix) {
  return (matrix || []).map((row) => row.map((v) => String(v ?? 0)).join(' ')).join('\n');
}

function guessSquareSizeFromLines(text) {
  const rows = String(text || '')
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  if (!rows.length) return 4;
  const cols = rows[0].split(/[\s,;]+/).filter(Boolean).length;
  return Math.max(rows.length, cols, 2);
}

function matrixToLinearAlgebra(matrix) {
  return (matrix || []).map((row) => row.join(',')).join(';');
}

/** --- Edge list --- */
function normalizeNodeLabel(label) {
  return String(label || '').trim();
}

/** --- Sets / relations --- */
function parseCommaElements(raw) {
  return String(raw || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseRelationPairs(raw) {
  const pairs = [];
  const matches = String(raw || '').match(/\(([^)]+)\)/g) || [];
  matches.forEach((m) => {
    const inner = m.slice(1, -1).split(',').map((s) => s.trim());
    if (inner.length === 2) pairs.push([inner[0], inner[1]]);
  });
  return pairs;
}

function formatRelationPairs(pairs) {
  return pairs.map(([a, b]) => `(${a},${b})`).join(',');
}

/**
 * Unified smart inputs for calculator modules.
 * Keeps string formats compatible with existing buildPayload / parsers.
 */
export default function SmartCalculatorInput({ field, value, values = {}, setValue, operation: _operation, error: externalError }) {
  const key = fieldKey(field);
  const opts = field.smartOptions || {};
  const smartType = field.smartType || field.type;
  const error = externalError || null;

  /** @type {SmartType} */
  const mode =
    smartType === 'validated-number'
    || smartType === 'number-list'
    || smartType === 'matrix-grid'
    || smartType === 'vector-list'
    || smartType === 'edge-list'
    || smartType === 'set-list'
    || smartType === 'relation-pairs'
    || smartType === 'formula'
    || smartType === 'raw-text'
    || smartType === 'raw-textarea'
      ? smartType
      : null;

  if (!mode || mode === 'raw-text' || mode === 'raw-textarea') {
    const common = {
      id: fieldId(field),
      label: field.label,
      value: value ?? '',
      onChange: (e) => setValue(key, e.target.value),
      placeholder: field.placeholder,
      hint: field.hint,
      required: field.required,
      disabled: field.disabled,
      error,
    };
    if (mode === 'raw-textarea' || field.type === 'textarea') {
      return <Textarea {...common} rows={field.rows || opts.rows || 4} />;
    }
    return (
      <Input
        {...common}
        type={field.type === 'number' ? 'number' : 'text'}
        min={field.min}
        max={field.max}
        step={field.step}
      />
    );
  }

  if (mode === 'validated-number') {
    const strVal = value === '' || value === undefined || value === null ? '' : String(value);
    const min = field.min;
    const max = field.max;
    const step = field.step ?? 'any';

    let localError = error;
    if (strVal !== '') {
      const n = Number(strVal);
      if (!Number.isFinite(n)) localError = localError || 'Must be a valid number';
      else {
        if (typeof min === 'number' && n < min) localError = localError || `Must be ≥ ${min}`;
        if (typeof max === 'number' && n > max) localError = localError || `Must be ≤ ${max}`;
      }
    }

    return (
      <Input
        id={fieldId(field)}
        label={field.label}
        type="number"
        value={strVal}
        onChange={(e) => setValue(key, e.target.value)}
        placeholder={field.placeholder}
        hint={field.hint}
        required={field.required}
        disabled={field.disabled}
        min={min}
        max={max}
        step={step}
        error={localError}
      />
    );
  }

  if (mode === 'number-list') {
    const items = parseCommaElements(value).filter((x) => x.length);

    function sync(nextItems) {
      setValue(key, nextItems.join(', '));
    }

    const draftKey = opts.draftKey || `${key}__draft`;
    const draft = values[draftKey] ?? '';

    return (
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800">
        <Input
          id={fieldId(field)}
          label={field.label}
          value={value ?? ''}
          onChange={(e) => setValue(key, e.target.value)}
          hint={field.hint || 'Comma-separated numbers, or use Add below.'}
          required={field.required}
          disabled={field.disabled}
          error={error}
        />
        <div className="flex flex-wrap gap-2">
          {items.map((item, idx) => (
            <span
              key={`${item}-${idx}`}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {item}
              <button
                type="button"
                className="ml-1 rounded-full px-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                aria-label={`Remove ${item}`}
                onClick={() => {
                  const next = items.filter((_, i) => i !== idx);
                  sync(next);
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              label={opts.addLabel || 'Add number'}
              type="number"
              value={draft}
              onChange={(e) => setValue(draftKey, e.target.value)}
              placeholder={opts.placeholder || '0'}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                const n = Number(draft);
                if (!Number.isFinite(n)) {
                  setValue(opts.errorKey || `${key}__err`, 'Enter a valid number');
                  return;
                }
                setValue(opts.errorKey || `${key}__err`, '');
                sync([...items, String(n)]);
                setValue(draftKey, '');
              }}
            >
              Add
            </Button>
            <Button type="button" variant="outline" onClick={() => sync([])}>
              Clear all
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'vector-list') {
    let cleaned = String(value || '').trim();
    if (cleaned.startsWith('[') && cleaned.endsWith(']')) cleaned = cleaned.slice(1, -1);
    const items = cleaned
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);

    const draftKey = opts.draftKey || `${key}__draft`;
    const draft = values[draftKey] ?? '';

    function sync(nextItems) {
      setValue(key, nextItems.join(', '));
    }

    return (
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800">
        <Input
          id={fieldId(field)}
          label={field.label}
          value={value ?? ''}
          onChange={(e) => setValue(key, e.target.value)}
          hint={field.hint || 'Comma-separated values, e.g. 1, 2, 3'}
          required={field.required}
          disabled={field.disabled}
          error={error}
        />
        <div className="flex flex-wrap gap-2">
          {items.map((item, idx) => (
            <span
              key={`${item}-${idx}`}
              className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-mono font-medium text-indigo-900 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-100"
            >
              {item}
              <button
                type="button"
                className="ml-1 rounded-full px-1 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900"
                aria-label={`Remove ${item}`}
                onClick={() => sync(items.filter((_, i) => i !== idx))}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              label={opts.addLabel || 'Add component'}
              type="number"
              value={draft}
              onChange={(e) => setValue(draftKey, e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                const n = Number(draft);
                if (!Number.isFinite(n)) return;
                sync([...items, String(n)]);
                setValue(draftKey, '');
              }}
            >
              Add
            </Button>
            <Button type="button" variant="outline" onClick={() => sync([])}>
              Clear
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'set-list') {
    const items = parseCommaElements(value);

    function sync(nextItems) {
      setValue(key, nextItems.join(','));
    }

    const draftKey = opts.draftKey || `${key}__draft`;
    const draft = values[draftKey] ?? '';

    return (
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800">
        <Input
          id={fieldId(field)}
          label={field.label}
          value={value ?? ''}
          onChange={(e) => setValue(key, e.target.value)}
          hint={field.hint || 'Comma-separated elements, or build with chips.'}
          required={field.required}
          disabled={field.disabled}
          error={error}
        />
        <div className="flex flex-wrap gap-2">
          {items.map((item, idx) => (
            <span
              key={`${item}-${idx}`}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {item}
              <button
                type="button"
                className="ml-1 rounded-full px-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label={`Remove ${item}`}
                onClick={() => sync(items.filter((_, i) => i !== idx))}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              label={opts.addLabel || 'Add element'}
              value={draft}
              onChange={(e) => setValue(draftKey, e.target.value)}
              placeholder={opts.placeholder || 'x'}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const v = String(draft || '').trim();
                  if (!v) return;
                  if (!items.includes(v)) sync([...items, v]);
                  setValue(draftKey, '');
                }
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                const v = String(draft || '').trim();
                if (!v) return;
                if (!items.includes(v)) sync([...items, v]);
                setValue(draftKey, '');
              }}
            >
              Add
            </Button>
            <Button type="button" variant="outline" onClick={() => sync([])}>
              Clear
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'relation-pairs') {
    const pairs = parseRelationPairs(value);
    const draftLeft = values[`${key}__rl`] ?? '';
    const draftRight = values[`${key}__rr`] ?? '';

    function sync(nextPairs) {
      setValue(key, formatRelationPairs(nextPairs));
    }

    return (
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800">
        <Textarea
          id={fieldId(field)}
          label={field.label}
          value={value ?? ''}
          onChange={(e) => setValue(key, e.target.value)}
          rows={field.rows || 3}
          hint={field.hint}
          required={field.required}
          disabled={field.disabled}
          error={error}
        />
        <div className="flex flex-wrap gap-2">
          {pairs.map(([a, b], idx) => (
            <span
              key={`${a}-${b}-${idx}`}
              className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-mono text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100"
            >
              ({a},{b})
              <button
                type="button"
                className="ml-1 rounded-full px-1 hover:bg-emerald-100 dark:hover:bg-emerald-900"
                aria-label="Remove pair"
                onClick={() => sync(pairs.filter((_, i) => i !== idx))}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-end">
          <Input label="Left" value={draftLeft} onChange={(e) => setValue(`${key}__rl`, e.target.value)} placeholder="a" />
          <Input label="Right" value={draftRight} onChange={(e) => setValue(`${key}__rr`, e.target.value)} placeholder="b" />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                const a = String(draftLeft || '').trim();
                const b = String(draftRight || '').trim();
                if (!a || !b) return;
                sync([...pairs, [a, b]]);
                setValue(`${key}__rl`, '');
                setValue(`${key}__rr`, '');
              }}
            >
              Add pair
            </Button>
            <Button type="button" variant="outline" onClick={() => sync([])}>
              Clear pairs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'formula') {
    if (opts.useMathQuill) {
      return (
        <MathInput
          label={field.label}
          latex={value ?? ''}
          onChange={(latex) => setValue(key, latex)}
          hint={field.hint}
          required={field.required}
          error={error}
        />
      );
    }

    const multiline = opts.multiline !== false;

    if (multiline) {
      return (
        <Textarea
          id={fieldId(field)}
          label={field.label}
          value={value ?? ''}
          onChange={(e) => setValue(key, e.target.value)}
          rows={field.rows || opts.rows || 3}
          placeholder={field.placeholder}
          hint={field.hint}
          required={field.required}
          disabled={field.disabled}
          error={error}
          className="font-mono text-sm"
        />
      );
    }

    return (
      <Input
        id={fieldId(field)}
        label={field.label}
        value={value ?? ''}
        onChange={(e) => setValue(key, e.target.value)}
        placeholder={field.placeholder}
        hint={field.hint}
        required={field.required}
        disabled={field.disabled}
        error={error}
        className="font-mono text-sm"
      />
    );
  }

  if (mode === 'edge-list') {
    const builder = {
      from: opts.fromKey || 'edgeFrom',
      to: opts.toKey || 'edgeTo',
      weight: opts.weightKey || 'edgeWeight',
      err: opts.errorKey || 'edgeBuilderError',
    };

    function addEdgeLine() {
      const u = normalizeNodeLabel(values[builder.from]);
      const v = normalizeNodeLabel(values[builder.to]);
      const w = String(values[builder.weight] ?? '').trim();

      if (!u || !v) {
        setValue(builder.err, 'Please provide both From and To.');
        return;
      }

      const line = w ? `${u} ${v} ${w}` : `${u} ${v}`;
      const next = String(value || '').trim();
      const withNewLine = next ? `${next}\n${line}` : line;
      setValue(key, withNewLine);
      setValue(builder.from, '');
      setValue(builder.to, '');
      setValue(builder.weight, '');
      setValue(builder.err, '');
    }

    return (
      <div className="space-y-3">
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{opts.builderTitle || 'Quick add edge'}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Input
              label={opts.fromLabel || 'From'}
              value={values[builder.from] ?? ''}
              onChange={(e) => setValue(builder.from, e.target.value)}
              placeholder={opts.fromPlaceholder || 'A'}
            />
            <Input
              label={opts.toLabel || 'To'}
              value={values[builder.to] ?? ''}
              onChange={(e) => setValue(builder.to, e.target.value)}
              placeholder={opts.toPlaceholder || 'B'}
            />
            <Input
              label={opts.weightLabel || 'Weight (optional)'}
              type="number"
              step="0.1"
              value={values[builder.weight] ?? ''}
              onChange={(e) => setValue(builder.weight, e.target.value)}
              placeholder="2.5"
            />
          </div>
          {values[builder.err] ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
              {values[builder.err]}
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="secondary" onClick={addEdgeLine}>
              {opts.addLabel || 'Add edge'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setValue(key, '');
                setValue(builder.err, '');
              }}
            >
              {opts.clearLabel || 'Clear list'}
            </Button>
          </div>
        </div>

        <Textarea
          id={fieldId(field)}
          label={field.label}
          value={value ?? ''}
          onChange={(e) => setValue(key, e.target.value)}
          rows={field.rows || opts.rows || 7}
          placeholder={field.placeholder}
          hint={field.hint}
          required={field.required}
          disabled={field.disabled}
          error={error}
        />
      </div>
    );
  }

  if (mode === 'matrix-grid') {
    const valueFormat = opts.valueFormat || 'matrix_lines'; // 'matrix_lines' | 'linear_algebra'
    const square = opts.square !== false;
    const modeField = opts.modeField;
    const textModeValue = opts.textModeValue || 'text';
    if (modeField && values[modeField] === textModeValue) {
      return (
        <Textarea
          id={fieldId(field)}
          label={field.label}
          value={value ?? ''}
          onChange={(e) => setValue(key, e.target.value)}
          rows={field.rows || opts.textRows || 7}
          placeholder={field.placeholder}
          hint={field.hint}
          required={field.required}
          disabled={field.disabled}
          error={error}
        />
      );
    }

    const minSize = opts.minSize ?? 2;
    const maxSize = opts.maxSize ?? 12;
    const sizeField = opts.sizeField || 'matrixSize';
    const directedField = opts.directedField || 'directed';
    const mirrorUndirected = opts.mirrorUndirected !== false;

    function parseCurrentMatrix() {
      if (valueFormat === 'linear_algebra') {
        const raw = String(value || '').trim();
        try {
          return parseLinearAlgebraMatrix(raw || '0', field.label || 'Matrix');
        } catch {
          return [[0]];
        }
      }
      return parseMatrixLines(value);
    }

    let matrix;
    let rows;
    let cols;

    if (valueFormat === 'linear_algebra') {
      matrix = parseCurrentMatrix();
      rows = matrix.length;
      cols = matrix[0]?.length || 1;
    } else {
      const parsedSize = Number(values[sizeField]);
      const fallbackSize = Number.isFinite(parsedSize) && parsedSize >= minSize && parsedSize <= maxSize
        ? parsedSize
        : guessSquareSizeFromLines(value);
      const n = square ? Math.max(minSize, Math.min(maxSize, fallbackSize)) : null;

      if (square) {
        matrix = normalizeMatrix(parseMatrixLines(value), n, n);
        rows = cols = n;
      } else {
        const parsed = parseMatrixLines(value);
        const pr = Math.max(parsed.length, 1);
        const pc = Math.max(parsed[0]?.length || 1, 1);
        rows = Math.max(minSize, Math.min(maxSize, Number(opts.rows) || pr));
        cols = Math.max(minSize, Math.min(maxSize, Number(opts.cols) || pc));
        matrix = normalizeMatrix(parsed, rows, cols);
      }
    }

    const directedTrue = opts.directedTrueValue ?? 'true';
    const isDirected = values[directedField] === directedTrue;

    function commit(next) {
      if (valueFormat === 'linear_algebra') {
        setValue(key, matrixToLinearAlgebra(next));
      } else {
        setValue(key, matrixToLines(next));
      }
    }

    function setCell(i, j, raw) {
      const next = matrix.map((row) => row.slice());
      const num = Number(raw);
      next[i][j] = Number.isFinite(num) ? num : 0;
      if (square && mirrorUndirected && !isDirected && valueFormat !== 'linear_algebra') {
        next[j][i] = next[i][j];
      }
      commit(next);
    }

    function resizeSquare(nextSize) {
      const n = Math.max(minSize, Math.min(maxSize, Number(nextSize) || minSize));
      if (sizeField) setValue(sizeField, String(n));
      const next = normalizeMatrix(parseMatrixLines(value), n, n);
      commit(next);
    }

    function resizeRect(nextR, nextC) {
      const r = Math.max(minSize, Math.min(maxSize, Number(nextR) || rows));
      const c = Math.max(minSize, Math.min(maxSize, Number(nextC) || cols));
      const parsed = parseCurrentMatrix();
      const next = normalizeMatrix(parsed, r, c);
      commit(next);
    }

    const showBinary = opts.binaryActions !== false && valueFormat !== 'linear_algebra';

    return (
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800">
        {field.label ? (
          <div>
            <span className="block text-sm font-medium text-slate-800 dark:text-slate-200">
              {field.label}
              {field.required ? <span className="ml-1 text-red-500">*</span> : null}
            </span>
            {field.hint ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{field.hint}</p> : null}
          </div>
        ) : null}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {square && valueFormat !== 'linear_algebra' ? (
              <Input
                label={opts.sizeLabel || 'Matrix size (n×n)'}
                type="number"
                min={minSize}
                max={maxSize}
                value={String(rows)}
                onChange={(e) => resizeSquare(e.target.value)}
                hint={opts.sizeHint || 'Resize preserves values where possible.'}
              />
            ) : null}
            {!square || valueFormat === 'linear_algebra' ? (
              <>
                <Input label="Rows" type="number" min={minSize} max={maxSize} value={String(rows)} onChange={(e) => resizeRect(e.target.value, cols)} />
                <Input label="Cols" type="number" min={minSize} max={maxSize} value={String(cols)} onChange={(e) => resizeRect(rows, e.target.value)} />
              </>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {showBinary ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const next = matrix.map((row) => row.map((v) => (Number(v) !== 0 ? 1 : 0)));
                  commit(next);
                }}
              >
                Make binary (0/1)
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const next = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0));
                commit(next);
              }}
            >
              Clear
            </Button>
            {opts.sampleMatrix ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  const sm = opts.sampleMatrix;
                  if (sizeField && Array.isArray(sm) && sm.length && valueFormat !== 'linear_algebra') {
                    setValue(sizeField, String(sm.length));
                  }
                  commit(sm);
                }}
              >
                Load sample
              </Button>
            ) : null}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[320px] border-separate border-spacing-2">
            <thead>
              <tr>
                <th />
                {matrix[0]?.map((_, j) => (
                  <th key={`h-${j}`} className="px-1 text-center text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {j + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, i) => (
                <tr key={`r-${i}`}>
                  <th className="pr-2 text-right text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {i + 1}
                  </th>
                  {row.map((cell, j) => (
                    <td key={`c-${i}-${j}`} className="w-16">
                      <input
                        type="number"
                        step={opts.cellStep ?? 'any'}
                        value={Number.isFinite(cell) ? cell : 0}
                        onChange={(e) => setCell(i, j, e.target.value)}
                        className="w-16 rounded-xl border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-400 dark:focus:ring-slate-700"
                        aria-label={`Cell ${i + 1},${j + 1}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {error ? <p className="text-xs text-red-600 dark:text-red-400">{error}</p> : null}
      </div>
    );
  }

  return (
    <Input
      id={fieldId(field)}
      label={field.label}
      value={value ?? ''}
      onChange={(e) => setValue(key, e.target.value)}
      error={error}
    />
  );
}
