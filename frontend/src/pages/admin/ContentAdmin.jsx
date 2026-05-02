import React, { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  activateAdminUser,
  deactivateAdminUser,
  getAdminRawAnalytics,
  getAdminRawAnalyticsCsvUrl,
  getAdminStats,
  getAdminUsers,
  getPublicSetting,
  putAdminSetting,
} from '../../api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { AnalyticsChartTooltip, errorTypeHint, errorTypeLabel } from '../../components/analytics/analyticsShared.jsx';
import { Button, Card, CardHeader } from '../../components/ui/index.js';
import { Select, Textarea } from '../../components/ui/Input.jsx';
import useIsDarkMode from '../../hooks/useIsDarkMode.js';
import { getRechartsPalette } from '../../lib/rechartsTheme.js';

export default function ContentAdmin() {
  const { user } = useAuth();
  const isDark = useIsDarkMode();
  const rc = getRechartsPalette(isDark);
  const [stats, setStats] = useState({ totalStudents: 0, activeToday: 0 });
  const [users, setUsers] = useState([]);
  const [pageMeta, setPageMeta] = useState({ page: 0, size: 20, totalPages: 0, totalElements: 0 });
  const [settings, setSettings] = useState({
    'landing.welcomeText': '',
    'landing.subtitleText': '',
  });
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsUserId, setAnalyticsUserId] = useState('');
  const [analyticsWindowDays, setAnalyticsWindowDays] = useState(30);
  const [onlyIncorrect, setOnlyIncorrect] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadAdminData(page = pageMeta.page, size = pageMeta.size) {
    setLoading(true);
    setError('');
    try {
      const [statsResult, usersResult, welcomeResult, subtitleResult] = await Promise.allSettled([
        getAdminStats(),
        getAdminUsers(page, size),
        getPublicSetting('landing.welcomeText'),
        getPublicSetting('landing.subtitleText'),
      ]);

      if (statsResult.status === 'fulfilled') {
        setStats({
          totalStudents: statsResult.value?.totalStudents || 0,
          activeToday: statsResult.value?.activeToday || 0,
        });
      }

      if (usersResult.status === 'fulfilled') {
        const loadedUsers = usersResult.value?.items || [];
        setUsers(loadedUsers);
        setPageMeta({
          page: usersResult.value?.page || 0,
          size: usersResult.value?.size || size,
          totalPages: usersResult.value?.totalPages || 0,
          totalElements: usersResult.value?.totalElements || 0,
        });
        if (!analyticsUserId) {
          const firstStudent = loadedUsers.find((u) => u.role === 'STUDENT');
          if (firstStudent?.id) {
            setAnalyticsUserId(String(firstStudent.id));
          } else {
            setAnalyticsUserId('');
            setAnalyticsData(null);
          }
        }
      }

      setSettings({
        'landing.welcomeText': welcomeResult.status === 'fulfilled' ? (welcomeResult.value?.value || '') : '',
        'landing.subtitleText': subtitleResult.status === 'fulfilled' ? (subtitleResult.value?.value || '') : '',
      });

      const failures = [statsResult, usersResult, welcomeResult, subtitleResult].filter((r) => r.status === 'rejected');
      if (failures.length > 0) {
        throw failures[0].reason;
      }
    } catch (e) {
      setError(e.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData(0, 20);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onToggleUser(item) {
    setError('');
    setSuccess('');
    try {
      if (item.enabled) {
        await deactivateAdminUser(item.id);
      } else {
        await activateAdminUser(item.id);
      }
      await loadAdminData(pageMeta.page, pageMeta.size);
    } catch (e) {
      setError(e.message || 'Failed to update user status');
    }
  }

  async function onSaveSettings(e) {
    e.preventDefault();
    setSavingSettings(true);
    setError('');
    setSuccess('');
    try {
      await Promise.all([
        putAdminSetting('landing.welcomeText', settings['landing.welcomeText']),
        putAdminSetting('landing.subtitleText', settings['landing.subtitleText']),
      ]);
      setSuccess('Settings updated');
    } catch (e) {
      setError(e.message || 'Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  }

  async function loadRawAnalytics(userId, windowDays) {
    if (!userId) return;
    setAnalyticsLoading(true);
    setAnalyticsError('');
    try {
      const data = await getAdminRawAnalytics(userId, windowDays);
      setAnalyticsData(data || null);
    } catch (e) {
      if (e?.status === 403) {
        setAnalyticsError('HTTP 403: choose a STUDENT user and check backend restart/proxy routing.');
      } else {
        setAnalyticsError(e.message || 'Failed to load learning analytics preview');
      }
    } finally {
      setAnalyticsLoading(false);
    }
  }

  useEffect(() => {
    if (!analyticsUserId) return;
    loadRawAnalytics(analyticsUserId, analyticsWindowDays);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analyticsUserId, analyticsWindowDays]);

  const canPrev = pageMeta.page > 0;
  const canNext = pageMeta.page + 1 < pageMeta.totalPages;
  const roleData = [
    { name: 'Students', value: users.filter((u) => u.role === 'STUDENT').length },
    { name: 'Admins', value: users.filter((u) => u.role === 'ADMIN').length },
  ];
  const statusData = [
    { name: 'Active', value: users.filter((u) => u.enabled).length },
    { name: 'Disabled', value: users.filter((u) => !u.enabled).length },
  ];
  const activityData = [
    { name: 'Active today', value: stats.activeToday || 0 },
    { name: 'Inactive today', value: Math.max(0, (stats.totalStudents || 0) - (stats.activeToday || 0)) },
  ];
  const pieColors = ['#2563eb', '#f59e0b'];
  const axisTick = { fill: rc.tickFill, fontSize: 12 };
  const legendStyle = { color: rc.tickFill };
  const studentUsers = users.filter((u) => u.role === 'STUDENT');
  const attempts = Array.isArray(analyticsData?.attempts) ? analyticsData.attempts : [];
  const filteredAttempts = onlyIncorrect ? attempts.filter((a) => a && a.correct === false) : attempts;
  const latestAttempts = [...filteredAttempts]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 12);
  const errorBreakdown = filteredAttempts.reduce((acc, item) => {
    const key = item?.errorType || 'NONE';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const orderedErrorBreakdown = Object.entries(errorBreakdown).sort((a, b) => b[1] - a[1]);
  const errorChartData = orderedErrorBreakdown.map(([name, value]) => ({ name: errorTypeLabel(name), value }));
  const totalAttemptsCount = filteredAttempts.length;
  const unclassifiedCount = (errorBreakdown.OTHER || 0) + (errorBreakdown.NONE || 0);
  const unclassifiedPercent = totalAttemptsCount > 0
    ? Math.round((unclassifiedCount / totalAttemptsCount) * 100)
    : 0;
  const correctAttemptsCount = filteredAttempts.filter((a) => a && a.correct).length;
  const accuracyPercent = totalAttemptsCount > 0
    ? Math.round((correctAttemptsCount / totalAttemptsCount) * 100)
    : 0;
  const timedAttempts = filteredAttempts
    .map((a) => a?.timeSpentSeconds)
    .filter((v) => Number.isFinite(v) && v >= 0);
  const avgTimeSeconds = timedAttempts.length
    ? Math.round(timedAttempts.reduce((sum, v) => sum + v, 0) / timedAttempts.length)
    : null;
  const topicStats = filteredAttempts.reduce((acc, a) => {
    const key = a?.topicSlug || 'unknown';
    if (!acc[key]) {
      acc[key] = { total: 0, correct: 0 };
    }
    acc[key].total += 1;
    if (a?.correct) {
      acc[key].correct += 1;
    }
    return acc;
  }, {});
  const topicWeakness = Object.entries(topicStats)
    .map(([topic, v]) => ({
      topic,
      accuracy: v.total > 0 ? v.correct / v.total : 0,
      total: v.total,
    }))
    .filter((item) => item.total >= 1)
    .sort((a, b) => (a.accuracy - b.accuracy) || (b.total - a.total));
  const topWeakTopic = topicWeakness.length ? topicWeakness[0] : null;

  function exportAnalyticsCsv() {
    if (!analyticsUserId) return;
    const a = document.createElement('a');
    a.href = getAdminRawAnalyticsCsvUrl(analyticsUserId, analyticsWindowDays);
    const userLabel = analyticsUserId || 'user';
    a.download = `raw-analytics-${userLabel}-${analyticsWindowDays}d.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Admin Panel</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
        Manage users, view platform stats, and edit landing page texts.
      </p>
      {error && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200">
          {success}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card variant="elevated" padding="lg">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Total students</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.totalStudents}</p>
        </Card>
        <Card variant="elevated" padding="lg">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Active today</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.activeToday}</p>
        </Card>
      </div>

      <div className="mt-6">
        <Card variant="elevated" padding="lg">
          <CardHeader title="User activity charts" subtitle="Charts use current admin stats and loaded users page." />
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="h-[260px] w-full">
            <ResponsiveContainer>
              <BarChart data={activityData}>
                <CartesianGrid stroke={rc.gridStroke} strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={axisTick} />
                <YAxis allowDecimals={false} tick={axisTick} />
                <Tooltip content={<AnalyticsChartTooltip />} />
                <Legend wrapperStyle={legendStyle} />
                <Bar dataKey="value" fill="#2563eb" name="Students" />
              </BarChart>
            </ResponsiveContainer>
            </div>
            <div className="h-[260px] w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={roleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={84} label>
                  {roleData.map((entry, index) => (
                    <Cell key={`role-${entry.name}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<AnalyticsChartTooltip />} />
                <Legend wrapperStyle={legendStyle} />
              </PieChart>
            </ResponsiveContainer>
            </div>
            <div className="h-[260px] w-full">
            <ResponsiveContainer>
              <BarChart data={statusData}>
                <CartesianGrid stroke={rc.gridStroke} strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={axisTick} />
                <YAxis allowDecimals={false} tick={axisTick} />
                <Tooltip content={<AnalyticsChartTooltip />} />
                <Bar dataKey="value" fill="#16a34a" name="Users" />
              </BarChart>
            </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card variant="elevated" padding="lg">
          <CardHeader title="Users" subtitle="Browse and toggle user activity." />
          <div className="mt-6">
            {loading ? (
              <div className="text-sm text-slate-600 dark:text-slate-400">Loading users…</div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                  <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-900/40">
                      <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                        <th className="px-4 py-3">ID</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Username</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Active</th>
                        <th className="px-4 py-3">Created</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-900 dark:bg-slate-950">
                      {users.map((item) => {
                        const isSelf = String(item.id) === String(user?.id);
                        return (
                          <tr key={item.id} className="align-top">
                            <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">{item.id}</td>
                            <td className="px-4 py-3 text-slate-800 dark:text-slate-200">{item.email}</td>
                            <td className="px-4 py-3 text-slate-800 dark:text-slate-200">{item.username}</td>
                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.role}</td>
                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.enabled ? 'Yes' : 'No'}</td>
                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                              {item.createdAt ? new Date(item.createdAt).toLocaleString() : '—'}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant={item.enabled ? 'secondary' : 'primary'}
                                  onClick={() => onToggleUser(item)}
                                  disabled={isSelf}
                                >
                                  {item.enabled ? 'Deactivate' : 'Activate'}
                                </Button>
                                {isSelf ? <span className="text-xs text-slate-500 dark:text-slate-400">(you)</span> : null}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Total: {pageMeta.totalElements} · Page {pageMeta.page + 1} / {Math.max(1, pageMeta.totalPages)}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" disabled={!canPrev} onClick={() => loadAdminData(pageMeta.page - 1, pageMeta.size)}>
                      Prev
                    </Button>
                    <Button size="sm" variant="outline" disabled={!canNext} onClick={() => loadAdminData(pageMeta.page + 1, pageMeta.size)}>
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card variant="elevated" padding="lg">
          <CardHeader title="Learning analytics (raw preview)" subtitle="Inspect attempts and export CSV." />
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Select
                label="Student"
                value={analyticsUserId}
                onChange={(e) => setAnalyticsUserId(e.target.value)}
                options={[
                  ...(!users.length ? [{ value: '', label: 'No users', disabled: true }] : []),
                  ...(!studentUsers.length ? [{ value: '', label: 'No students found', disabled: true }] : []),
                  ...studentUsers.map((u) => ({ value: String(u.id), label: `${u.username} (${u.role})` })),
                ]}
              />
              <Select
                label="Window"
                value={String(analyticsWindowDays)}
                onChange={(e) => setAnalyticsWindowDays(Number(e.target.value))}
                options={[
                  { value: '7', label: '7 days' },
                  { value: '30', label: '30 days' },
                ]}
              />
              <div className="flex items-end">
                <Button
                  className="w-full"
                  onClick={() => loadRawAnalytics(analyticsUserId, analyticsWindowDays)}
                  disabled={!analyticsUserId || analyticsLoading}
                >
                  {analyticsLoading ? 'Loading…' : 'Refresh'}
                </Button>
              </div>
              <div className="flex items-end">
                <Button className="w-full" variant="outline" onClick={exportAnalyticsCsv} disabled={!filteredAttempts.length}>
                  Export CSV
                </Button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700"
                checked={onlyIncorrect}
                onChange={(e) => setOnlyIncorrect(e.target.checked)}
              />
              Only incorrect attempts
            </label>

            {analyticsError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                {analyticsError}
              </div>
            ) : (
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Attempts loaded: {attempts.length}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Accuracy', value: `${accuracyPercent}%` },
                { label: 'Avg time', value: avgTimeSeconds == null ? '—' : `${avgTimeSeconds}s` },
                { label: 'Top weak topic', value: topWeakTopic ? `${topWeakTopic.topic} (${Math.round(topWeakTopic.accuracy * 100)}%)` : '—' },
                { label: 'Unclassified errors', value: `${unclassifiedPercent}%` },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{item.label}</div>
                  <div className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">ErrorType breakdown</div>
                {!orderedErrorBreakdown.length ? (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">No attempts yet.</p>
                ) : (
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
                    {orderedErrorBreakdown.map(([key, count]) => (
                      <li key={key} title={errorTypeHint(key)}>
                        {errorTypeLabel(key)}: {count}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">ErrorType chart</div>
                {!errorChartData.length ? (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">No attempts yet.</p>
                ) : (
                  <div className="mt-3 h-[240px] w-full">
                    <ResponsiveContainer>
                      <BarChart data={errorChartData}>
                        <CartesianGrid stroke={rc.gridStroke} strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={axisTick} />
                        <YAxis allowDecimals={false} tick={axisTick} />
                        <Tooltip content={<AnalyticsChartTooltip />} />
                        <Bar dataKey="value" name="Attempts" fill="#7c3aed" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Latest attempts</div>
              {!latestAttempts.length ? (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">No attempts yet.</p>
              ) : (
                <table className="mt-4 min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                  <thead className="bg-slate-50 dark:bg-slate-900/40">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                      <th className="px-3 py-2">Time</th>
                      <th className="px-3 py-2">Topic</th>
                      <th className="px-3 py-2">Diff</th>
                      <th className="px-3 py-2">Result</th>
                      <th className="px-3 py-2">Spent(s)</th>
                      <th className="px-3 py-2">FirstAction(s)</th>
                      <th className="px-3 py-2">ErrorType</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-900 dark:bg-slate-950">
                    {latestAttempts.map((a, idx) => (
                      <tr key={`${a.createdAt || idx}-${idx}`}>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-300">
                          {a.createdAt ? new Date(a.createdAt).toLocaleString() : '—'}
                        </td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{a.topicSlug || '—'}</td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{a.difficultyAtAttempt || '—'}</td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{a.correct ? 'Correct' : 'Wrong'}</td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{a.timeSpentSeconds ?? '—'}</td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{a.timeToFirstActionSeconds ?? '—'}</td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-300" title={errorTypeHint(a.errorType || 'NONE')}>
                          {errorTypeLabel(a.errorType || 'NONE')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card variant="elevated" padding="lg">
          <CardHeader title="Landing page texts" subtitle="Edit public landing copy (stored in backend settings)." />
          <form className="mt-6 space-y-4" onSubmit={onSaveSettings}>
            <Textarea
              label="Welcome text"
              value={settings['landing.welcomeText']}
              onChange={(e) => setSettings((prev) => ({ ...prev, 'landing.welcomeText': e.target.value }))}
              rows={3}
              placeholder="Welcome headline shown on landing."
            />
            <Textarea
              label="Subtitle text"
              value={settings['landing.subtitleText']}
              onChange={(e) => setSettings((prev) => ({ ...prev, 'landing.subtitleText': e.target.value }))}
              rows={3}
              placeholder="Subtitle shown under the landing headline."
            />
            <div className="flex items-center justify-end">
              <Button type="submit" disabled={savingSettings}>
                {savingSettings ? 'Saving…' : 'Save texts'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </section>
  );
}
