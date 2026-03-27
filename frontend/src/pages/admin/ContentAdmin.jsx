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

export default function ContentAdmin() {
  const { user } = useAuth();
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
  const axisTick = { fill: '#cbd5e1', fontSize: 12 };
  const legendStyle = { color: '#cbd5e1' };
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
    <section className="container mx-auto px-4 py-8" style={{ maxWidth: '1200px' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '1rem' }}>Admin Panel</h1>
      <p className="subtitle" style={{ marginBottom: '1rem' }}>
        Manage users, view platform stats, and edit landing page texts.
      </p>
      {error && <p style={{ color: '#b91c1c', marginBottom: '0.75rem' }}>{error}</p>}
      {success && <p style={{ color: '#166534', marginBottom: '0.75rem' }}>{success}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '.85rem', color: '#64748b' }}>Total Students</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{stats.totalStudents}</div>
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '.85rem', color: '#64748b' }}>Active Today</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{stats.activeToday}</div>
        </div>
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
        <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>User Activity Charts</h3>
        <div style={{ color: '#64748b', fontSize: '.9rem', marginBottom: '.75rem' }}>
          Charts use current admin stats and loaded users page.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1rem' }}>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={activityData}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={axisTick} />
                <YAxis allowDecimals={false} tick={axisTick} />
                <Tooltip content={<AnalyticsChartTooltip />} />
                <Legend wrapperStyle={legendStyle} />
                <Bar dataKey="value" fill="#2563eb" name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ width: '100%', height: 260 }}>
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
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={statusData}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={axisTick} />
                <YAxis allowDecimals={false} tick={axisTick} />
                <Tooltip content={<AnalyticsChartTooltip />} />
                <Bar dataKey="value" fill="#16a34a" name="Users" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
        <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Users</h3>
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '8px' }}>ID</th>
                    <th style={{ padding: '8px' }}>Email</th>
                    <th style={{ padding: '8px' }}>Username</th>
                    <th style={{ padding: '8px' }}>Role</th>
                    <th style={{ padding: '8px' }}>Active</th>
                    <th style={{ padding: '8px' }}>Created</th>
                    <th style={{ padding: '8px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((item) => {
                    const isSelf = String(item.id) === String(user?.id);
                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px' }}>{item.id}</td>
                        <td style={{ padding: '8px' }}>{item.email}</td>
                        <td style={{ padding: '8px' }}>{item.username}</td>
                        <td style={{ padding: '8px' }}>{item.role}</td>
                        <td style={{ padding: '8px' }}>{item.enabled ? 'Yes' : 'No'}</td>
                        <td style={{ padding: '8px' }}>{item.createdAt ? new Date(item.createdAt).toLocaleString() : '—'}</td>
                        <td style={{ padding: '8px' }}>
                          <button
                            type="button"
                            onClick={() => onToggleUser(item)}
                            disabled={isSelf}
                            style={{ opacity: isSelf ? 0.6 : 1 }}
                          >
                            {item.enabled ? 'Deactivate' : 'Activate'}
                          </button>
                          {isSelf && <span style={{ marginLeft: '8px', color: '#64748b', fontSize: '.8rem' }}>(you)</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', alignItems: 'center' }}>
              <div style={{ color: '#64748b', fontSize: '.9rem' }}>
                Total: {pageMeta.totalElements} · Page {pageMeta.page + 1} / {Math.max(1, pageMeta.totalPages)}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" disabled={!canPrev} onClick={() => loadAdminData(pageMeta.page - 1, pageMeta.size)}>
                  Prev
                </button>
                <button type="button" disabled={!canNext} onClick={() => loadAdminData(pageMeta.page + 1, pageMeta.size)}>
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
        <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Learning Analytics (Raw Preview)</h3>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', color: '#64748b', fontSize: '.85rem', marginBottom: '.25rem' }}>Student</label>
            <select
              value={analyticsUserId}
              onChange={(e) => setAnalyticsUserId(e.target.value)}
              style={{ minWidth: 220 }}
            >
              {!users.length && <option value="">No users</option>}
              {!studentUsers.length && <option value="">No students found</option>}
              {studentUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.username} ({u.role})</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', color: '#64748b', fontSize: '.85rem', marginBottom: '.25rem' }}>Window</label>
            <select
              value={analyticsWindowDays}
              onChange={(e) => setAnalyticsWindowDays(Number(e.target.value))}
            >
              <option value={7}>7 days</option>
              <option value={30}>30 days</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'end' }}>
            <button type="button" onClick={() => loadRawAnalytics(analyticsUserId, analyticsWindowDays)} disabled={!analyticsUserId || analyticsLoading}>
              {analyticsLoading ? 'Loading…' : 'Refresh'}
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'end', gap: '.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '.4rem', color: '#334155' }}>
              <input
                type="checkbox"
                checked={onlyIncorrect}
                onChange={(e) => setOnlyIncorrect(e.target.checked)}
              />
              Only incorrect attempts
            </label>
          </div>
          <div style={{ display: 'flex', alignItems: 'end' }}>
            <button type="button" onClick={exportAnalyticsCsv} disabled={!filteredAttempts.length}>
              Export CSV
            </button>
          </div>
        </div>
        {analyticsError && <p style={{ color: '#b91c1c', marginBottom: '0.75rem' }}>{analyticsError}</p>}
        {!analyticsError && (
          <div style={{ color: '#64748b', fontSize: '.9rem', marginBottom: '.75rem' }}>
            Attempts loaded: {attempts.length}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '.75rem', marginBottom: '.75rem' }}>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '.65rem .75rem' }}>
            <div style={{ color: '#64748b', fontSize: '.8rem' }}>Accuracy</div>
            <div style={{ fontWeight: 700, fontSize: '1.15rem' }}>{accuracyPercent}%</div>
          </div>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '.65rem .75rem' }}>
            <div style={{ color: '#64748b', fontSize: '.8rem' }}>Avg Time</div>
            <div style={{ fontWeight: 700, fontSize: '1.15rem' }}>{avgTimeSeconds == null ? '—' : `${avgTimeSeconds}s`}</div>
          </div>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '.65rem .75rem' }}>
            <div style={{ color: '#64748b', fontSize: '.8rem' }}>Top Weak Topic</div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>
              {topWeakTopic ? `${topWeakTopic.topic} (${Math.round(topWeakTopic.accuracy * 100)}%)` : '—'}
            </div>
          </div>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '.65rem .75rem' }}>
            <div style={{ color: '#64748b', fontSize: '.8rem' }}>Unclassified Errors</div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{unclassifiedPercent}%</div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }}>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.75rem' }}>
            <div style={{ fontWeight: 600, marginBottom: '.5rem' }}>ErrorType Breakdown</div>
            {!orderedErrorBreakdown.length ? (
              <p style={{ color: '#64748b', margin: 0 }}>No attempts yet.</p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                {orderedErrorBreakdown.map(([key, count]) => (
                  <li key={key} title={errorTypeHint(key)}>
                    {errorTypeLabel(key)}: {count}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.75rem' }}>
            <div style={{ fontWeight: 600, marginBottom: '.5rem' }}>ErrorType Chart</div>
            {!errorChartData.length ? (
              <p style={{ color: '#64748b', margin: 0 }}>No attempts yet.</p>
            ) : (
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer>
                  <BarChart data={errorChartData}>
                    <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={axisTick} />
                    <YAxis allowDecimals={false} tick={axisTick} />
                    <Tooltip content={<AnalyticsChartTooltip />} />
                    <Bar dataKey="value" name="Attempts" fill="#7c3aed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.75rem', overflowX: 'auto' }}>
            <div style={{ fontWeight: 600, marginBottom: '.5rem' }}>Latest Attempts</div>
            {!latestAttempts.length ? (
              <p style={{ color: '#64748b', margin: 0 }}>No attempts yet.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.9rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '6px' }}>Time</th>
                    <th style={{ padding: '6px' }}>Topic</th>
                    <th style={{ padding: '6px' }}>Diff</th>
                    <th style={{ padding: '6px' }}>Result</th>
                    <th style={{ padding: '6px' }}>Spent(s)</th>
                    <th style={{ padding: '6px' }}>FirstAction(s)</th>
                    <th style={{ padding: '6px' }}>ErrorType</th>
                  </tr>
                </thead>
                <tbody>
                  {latestAttempts.map((a, idx) => (
                    <tr key={`${a.createdAt || idx}-${idx}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '6px' }}>{a.createdAt ? new Date(a.createdAt).toLocaleString() : '—'}</td>
                      <td style={{ padding: '6px' }}>{a.topicSlug || '—'}</td>
                      <td style={{ padding: '6px' }}>{a.difficultyAtAttempt || '—'}</td>
                      <td style={{ padding: '6px' }}>{a.correct ? 'Correct' : 'Wrong'}</td>
                      <td style={{ padding: '6px' }}>{a.timeSpentSeconds ?? '—'}</td>
                      <td style={{ padding: '6px' }}>{a.timeToFirstActionSeconds ?? '—'}</td>
                      <td style={{ padding: '6px' }} title={errorTypeHint(a.errorType || 'NONE')}>
                        {errorTypeLabel(a.errorType || 'NONE')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={onSaveSettings} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '1rem' }}>
        <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Landing Page Texts</h3>
        <label style={{ display: 'block', marginBottom: '.5rem' }}>Welcome Text</label>
        <textarea
          value={settings['landing.welcomeText']}
          onChange={(e) => setSettings((prev) => ({ ...prev, 'landing.welcomeText': e.target.value }))}
          rows={3}
          style={{ width: '100%', marginBottom: '0.75rem' }}
        />
        <label style={{ display: 'block', marginBottom: '.5rem' }}>Subtitle Text</label>
        <textarea
          value={settings['landing.subtitleText']}
          onChange={(e) => setSettings((prev) => ({ ...prev, 'landing.subtitleText': e.target.value }))}
          rows={3}
          style={{ width: '100%', marginBottom: '0.75rem' }}
        />
        <button type="submit" disabled={savingSettings}>
          {savingSettings ? 'Saving...' : 'Save texts'}
        </button>
      </form>
    </section>
  );
}
