import React from 'react';

export const ERROR_TYPE_META = {
  NONE: { label: 'No category', description: 'No explicit error category was detected or saved.' },
  OTHER: { label: 'Unclassified error', description: 'The attempt was wrong, but it did not match known error categories.' },
  SIGN_ERROR: { label: 'Sign error', description: 'Likely plus/minus sign confusion.' },
  ARITHMETIC_ERROR: { label: 'Arithmetic error', description: 'Likely calculation or numeric operation mistake.' },
  FORMULA_ERROR: { label: 'Formula error', description: 'Likely wrong formula or identity usage.' },
  LOGIC_ERROR: { label: 'Logic error', description: 'Likely reasoning/derivation issue.' },
};

export function errorTypeLabel(code) {
  return ERROR_TYPE_META[code]?.label || code || 'No category';
}

export function errorTypeHint(code) {
  return ERROR_TYPE_META[code]?.description || 'Unspecified error category.';
}

export function AnalyticsChartTooltip({ active, label, payload }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      style={{
        background: '#0f172a',
        color: '#f8fafc',
        border: '1px solid #334155',
        borderRadius: 8,
        padding: '8px 10px',
        boxShadow: '0 8px 24px rgba(2, 6, 23, 0.35)',
      }}
    >
      {label != null && <div style={{ color: '#cbd5e1', fontWeight: 600, marginBottom: 4 }}>{String(label)}</div>}
      {payload.map((entry) => (
        <div key={`${entry.name}-${entry.dataKey}`} style={{ color: '#f8fafc', fontSize: 13 }}>
          {entry.name}: {entry.value}
        </div>
      ))}
    </div>
  );
}

export function buildErrorChartData(attempts) {
  const errorBreakdown = attempts.reduce((acc, item) => {
    const key = item?.errorType || 'NONE';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(errorBreakdown)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name: errorTypeLabel(name), value }));
}

export function buildTopicAccuracyData(attempts) {
  const topicStats = attempts.reduce((acc, a) => {
    const key = a?.topicSlug || 'unknown';
    if (!acc[key]) {
      acc[key] = { total: 0, correct: 0 };
    }
    acc[key].total += 1;
    if (a?.correct) acc[key].correct += 1;
    return acc;
  }, {});
  return Object.entries(topicStats)
    .map(([topic, v]) => ({
      topic,
      attempts: v.total,
      accuracy: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0,
    }))
    .sort((a, b) => b.attempts - a.attempts)
    .slice(0, 8);
}

export function buildTimeVsErrorsData(attempts) {
  const grouped = attempts.reduce((acc, a) => {
    const spent = Number(a?.timeSpentSeconds);
    if (!Number.isFinite(spent) || spent < 0) return acc;
    const bucketStart = Math.min(3600, Math.floor(spent / 30) * 30);
    const key = String(bucketStart);
    if (!acc[key]) acc[key] = { bucket: bucketStart, total: 0, wrong: 0 };
    acc[key].total += 1;
    if (!a?.correct) acc[key].wrong += 1;
    return acc;
  }, {});
  return Object.values(grouped)
    .map((x) => ({
      bucketLabel: `${x.bucket}-${x.bucket + 29}s`,
      wrongRate: x.total > 0 ? Math.round((x.wrong / x.total) * 100) : 0,
      attempts: x.total,
    }))
    .sort((a, b) => Number(a.bucketLabel.split('-')[0]) - Number(b.bucketLabel.split('-')[0]));
}
