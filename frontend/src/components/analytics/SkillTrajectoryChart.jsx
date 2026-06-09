import React from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getMyRawAnalytics, getMySkillTrajectory } from '../../api.js';
import { getPracticeTopicLabel } from '../../catalog/practiceTopicRegistry.js';
import useIsDarkMode from '../../hooks/useIsDarkMode.js';
import { getRechartsPalette } from '../../lib/rechartsTheme.js';

function formatShortIso(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return String(iso).slice(0, 16);
  }
}

/**
 * BKT P(L) trajectory replay (same update rule as live practice). Window filters displayed points; replay uses full history.
 */
export default function SkillTrajectoryChart({ windowDays = 30 }) {
  const isDark = useIsDarkMode();
  const rc = getRechartsPalette(isDark);
  const [topicSlug, setTopicSlug] = React.useState('');
  const [topics, setTopics] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [topicsError, setTopicsError] = React.useState('');
  const [error, setError] = React.useState('');
  const [payload, setPayload] = React.useState(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setTopicsError('');
      try {
        const raw = await getMyRawAnalytics(windowDays);
        const rows = Array.isArray(raw?.attempts) ? raw.attempts : [];
        const slugs = [...new Set(rows.map((r) => r.topicSlug).filter(Boolean))].sort();
        if (!cancelled) {
          setTopics(slugs);
          setTopicSlug((prev) => (prev && slugs.includes(prev) ? prev : slugs[0] || ''));
        }
      } catch (e) {
        if (!cancelled) {
          setTopicsError(e?.message || 'Could not list topics');
          setTopics([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [windowDays]);

  React.useEffect(() => {
    if (!topicSlug) {
      setPayload(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getMySkillTrajectory(topicSlug, windowDays);
        if (!cancelled) setPayload(data);
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || 'Failed to load trajectory');
          setPayload(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [topicSlug, windowDays]);

  const chartData = React.useMemo(() => {
    const pts = Array.isArray(payload?.points) ? payload.points : [];
    return pts.map((p, i) => ({
      idx: i + 1,
      pKnow: typeof p.pKnowPercent === 'number' ? p.pKnowPercent : 0,
      label: formatShortIso(p.createdAt),
      correct: p.correct,
    }));
  }, [payload]);

  const adj = payload?.adjustedMasteryPercent;
  const stored = payload?.storedPknowPercent;

  if (topics.length === 0 && !topicsError) {
    return (
      <div className="rounded-lg border border-slate-200 p-3 text-sm dmc-subtitle dark:border-slate-700">
        Practice with AI or calculators to see a per-topic BKT trajectory.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-semibold dmc-title">BKT P(L) trajectory (replay)</div>
        <select
          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          value={topicSlug}
          onChange={(e) => setTopicSlug(e.target.value)}
        >
          {topics.map((t) => (
            <option key={t} value={t}>
              {getPracticeTopicLabel(t) || t.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>
      <p className="mb-2 text-xs leading-relaxed dmc-subtitle">
        The line shows <strong>P(L)</strong> after each attempt (same update rule as live practice). Dashed lines compare your
        dashboard <strong>adjusted</strong> mastery ({typeof adj === 'number' ? `${adj}%` : '—'}) vs stored{' '}
        <strong>raw pKnow</strong> ({typeof stored === 'number' ? `${stored}%` : '—'}). Attempts in this window:{' '}
        <strong>{payload?.attemptCountInWindow ?? 0}</strong>.
      </p>
      {topicsError ? (
        <div className="mb-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-100">
          {topicsError}
        </div>
      ) : null}
      {error ? (
        <div className="mb-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-100">
          {error}
        </div>
      ) : null}
      {loading ? <p className="text-sm dmc-subtitle">Loading trajectory…</p> : null}
      {!loading && !error && chartData.length === 0 && topicSlug ? (
        <p className="text-sm dmc-subtitle">No attempts for this topic in the selected window (replay still uses full history).</p>
      ) : null}
      {!loading && chartData.length > 0 ? (
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={rc.gridStroke} strokeDasharray="3 3" />
              <XAxis dataKey="idx" tick={{ fill: rc.tickFill, fontSize: 11 }} name="Attempt #" />
              <YAxis domain={[0, 100]} tick={{ fill: rc.tickFill, fontSize: 12 }} />
              <Tooltip
                contentStyle={rc.tooltipStyle}
                formatter={(value, name) => {
                  if (name === 'pKnow') return [`${value}%`, 'P(L) after step'];
                  return [value, name];
                }}
                labelFormatter={(_, p) => {
                  if (p && p[0]) {
                    const row = p[0].payload;
                    return `${row.label} · ${row.correct ? 'correct' : 'incorrect'}`;
                  }
                  return '';
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="pKnow"
                name="P(L) %"
                stroke="#22c55e"
                strokeWidth={2}
                dot={({ cx, cy, payload }) => {
                  if (cx == null || cy == null) return null;
                  const fill = payload?.correct ? '#22c55e' : '#ef4444';
                  return <circle cx={cx} cy={cy} r={5} fill={fill} stroke="#fff" strokeWidth={1.5} />;
                }}
              />
              {typeof adj === 'number' ? (
                <ReferenceLine
                  y={adj}
                  stroke="#6366f1"
                  strokeDasharray="4 4"
                  label={{
                    value: 'Adjusted mastery %',
                    fill: isDark ? '#a5b4fc' : '#4338ca',
                    fontSize: 10,
                  }}
                />
              ) : null}
              {typeof stored === 'number' ? (
                <ReferenceLine
                  y={stored}
                  stroke="#f472b6"
                  strokeDasharray="6 3"
                  label={{
                    value: 'Stored P(know) %',
                    fill: isDark ? '#f9a8d4' : '#be185d',
                    fontSize: 10,
                  }}
                />
              ) : null}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </div>
  );
}
