import React from 'react';
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getMyRawAnalytics } from '../api.js';
import {
  AnalyticsChartTooltip,
  buildWeeklyProgressData,
  buildErrorChartData,
  buildTimeVsErrorsData,
  buildTopicAccuracyData,
} from './analytics/analyticsShared.jsx';
import SkillTrajectoryChart from './analytics/SkillTrajectoryChart.jsx';
import { Bar, BarChart } from 'recharts';
import useIsDarkMode from '../hooks/useIsDarkMode.js';
import { getRechartsPalette } from '../lib/rechartsTheme.js';

export default function StudentMiniLab({ defaultCollapsed = true }) {
  const isDark = useIsDarkMode();
  const rc = getRechartsPalette(isDark);
  const [windowDays, setWindowDays] = React.useState(30);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [attempts, setAttempts] = React.useState([]);
  const [expanded, setExpanded] = React.useState(!defaultCollapsed);

  const load = React.useCallback(async (days) => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyRawAnalytics(days);
      const rows = Array.isArray(data?.attempts) ? data.attempts : [];
      setAttempts(rows);
    } catch (e) {
      setError(e.message || 'Failed to load Mini Lab data');
      setAttempts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load(windowDays);
  }, [load, windowDays]);

  const topicAccuracyData = React.useMemo(() => buildTopicAccuracyData(attempts), [attempts]);
  const errorTypeData = React.useMemo(() => buildErrorChartData(attempts), [attempts]);
  const timeVsErrorsData = React.useMemo(() => buildTimeVsErrorsData(attempts), [attempts]);
  const weeklyData = React.useMemo(() => buildWeeklyProgressData(attempts, 7), [attempts]);

  const summary = React.useMemo(() => {
    const total = attempts.length;
    const correct = attempts.filter((a) => a?.correct).length;
    const wrong = total - correct;
    return { total, correct, wrong };
  }, [attempts]);

  return (
    <div className="dmc-card mt-6">
      <div className="dmc-card-header flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-semibold dmc-title">Mini Lab</h3>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            value={windowDays}
            onChange={(e) => setWindowDays(Number(e.target.value))}
          >
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
          </select>
          <button type="button" className="dmc-button-secondary" onClick={() => load(windowDays)} disabled={loading}>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
          <button type="button" className="dmc-button-secondary" onClick={() => setExpanded((x) => !x)}>
            {expanded ? 'Collapse' : 'Expand for detailed analytics'}
          </button>
        </div>
      </div>
      <div className="dmc-card-body space-y-4">
        <p className="text-sm dmc-subtitle">
          Weekly attempt trend at a glance; expand for topic accuracy, timing, and error categories.
        </p>
        {error ? (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm dark:bg-red-950/40 dark:border-red-900 dark:text-red-200">
            {error}
          </div>
        ) : null}
        {!error && attempts.length === 0 && !loading ? (
          <div className="rounded-lg border border-slate-200 dmc-surface-soft px-4 py-3 text-sm dmc-subtitle">
            No attempts in this window yet.
          </div>
        ) : null}

        {!error && attempts.length > 0 ? (
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-700 dark:bg-slate-900">
              <strong className="dmc-title">{summary.total}</strong> attempts
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100">
              <strong>{summary.correct}</strong> correct
            </span>
            <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100">
              <strong>{summary.wrong}</strong> incorrect
            </span>
          </div>
        ) : null}

        {!error && attempts.length > 0 && topicAccuracyData.length > 0 && !expanded ? (
          <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
            <div className="text-sm font-semibold dmc-title mb-2">Topic accuracy (top topics)</div>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <BarChart data={topicAccuracyData}>
                  <CartesianGrid stroke={rc.gridStroke} strokeDasharray="3 3" />
                  <XAxis dataKey="topic" tick={{ fill: rc.tickFill, fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
                  <YAxis domain={[0, 100]} tick={{ fill: rc.tickFill, fontSize: 12 }} />
                  <Tooltip content={<AnalyticsChartTooltip />} />
                  <Bar dataKey="accuracy" name="Accuracy %" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : null}

        {!error && attempts.length > 0 ? (
          <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
            <div className="text-sm font-semibold dmc-title mb-2">Last 7 days — attempts</div>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer>
                <LineChart data={weeklyData}>
                  <CartesianGrid stroke={rc.gridStroke} strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fill: rc.tickFill, fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fill: rc.tickFill, fontSize: 12 }} />
                  <Tooltip content={<AnalyticsChartTooltip />} />
                  <Line type="monotone" dataKey="attempts" name="Attempts" stroke="#6366f1" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : null}

        {!error && attempts.length > 0 ? <SkillTrajectoryChart windowDays={windowDays} /> : null}

        {expanded && !error && attempts.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
            {timeVsErrorsData.length === 0 ? (
              <p className="lg:col-span-3 text-xs dmc-subtitle">
                Time-vs-error chart needs attempts with time spent recorded. New practice sessions include timing automatically.
              </p>
            ) : null}
            <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <div className="text-sm font-semibold dmc-title mb-2">Topic Accuracy</div>
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                  <BarChart data={topicAccuracyData}>
                    <CartesianGrid stroke={rc.gridStroke} strokeDasharray="3 3" />
                    <XAxis dataKey="topic" tick={{ fill: rc.tickFill, fontSize: 12 }} />
                    <YAxis tick={{ fill: rc.tickFill, fontSize: 12 }} />
                    <Tooltip content={<AnalyticsChartTooltip />} />
                    <Bar dataKey="accuracy" name="Accuracy %" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <div className="text-sm font-semibold dmc-title mb-2">Time vs Errors</div>
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                  <LineChart data={timeVsErrorsData}>
                    <CartesianGrid stroke={rc.gridStroke} strokeDasharray="3 3" />
                    <XAxis dataKey="bucketLabel" tick={{ fill: rc.tickFill, fontSize: 11 }} />
                    <YAxis tick={{ fill: rc.tickFill, fontSize: 12 }} />
                    <Tooltip content={<AnalyticsChartTooltip />} />
                    <Line type="monotone" dataKey="wrongRate" name="Wrong %" stroke="#ef4444" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <div className="text-sm font-semibold dmc-title mb-2">Error Types</div>
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                  <BarChart data={errorTypeData}>
                    <CartesianGrid stroke={rc.gridStroke} strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fill: rc.tickFill, fontSize: 11 }} />
                    <YAxis tick={{ fill: rc.tickFill, fontSize: 12 }} />
                    <Tooltip content={<AnalyticsChartTooltip />} />
                    <Bar dataKey="value" name="Attempts" fill="#7c3aed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
