import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getMyRawAnalytics } from '../api.js';
import {
  AnalyticsChartTooltip,
  buildErrorChartData,
  buildTimeVsErrorsData,
  buildTopicAccuracyData,
} from './analytics/analyticsShared.jsx';

export default function StudentMiniLab() {
  const [windowDays, setWindowDays] = React.useState(30);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [attempts, setAttempts] = React.useState([]);

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

  return (
    <div className="dmc-card mt-6">
      <div className="dmc-card-header flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-semibold dmc-title">Mini Lab</h3>
        <div className="flex items-center gap-2">
          <select
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800"
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
        </div>
      </div>
      <div className="dmc-card-body space-y-4">
        <p className="text-sm dmc-subtitle">
          Explore your data directly in the portal: topic accuracy, time/error correlation, and error type distribution.
        </p>
        {error ? <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">{error}</div> : null}
        {!error && attempts.length === 0 && !loading ? (
          <div className="rounded-lg border border-slate-200 dmc-surface-soft px-4 py-3 text-sm dmc-subtitle">
            No attempts in this window yet.
          </div>
        ) : null}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-lg border border-slate-200 p-3">
            <div className="text-sm font-semibold dmc-title mb-2">Topic Accuracy</div>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={topicAccuracyData}>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                  <XAxis dataKey="topic" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                  <Tooltip content={<AnalyticsChartTooltip />} />
                  <Bar dataKey="accuracy" name="Accuracy %" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 p-3">
            <div className="text-sm font-semibold dmc-title mb-2">Time vs Errors</div>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <LineChart data={timeVsErrorsData}>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                  <XAxis dataKey="bucketLabel" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                  <Tooltip content={<AnalyticsChartTooltip />} />
                  <Line type="monotone" dataKey="wrongRate" name="Wrong %" stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 p-3">
            <div className="text-sm font-semibold dmc-title mb-2">Error Types</div>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={errorTypeData}>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                  <Tooltip content={<AnalyticsChartTooltip />} />
                  <Bar dataKey="value" name="Attempts" fill="#7c3aed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
