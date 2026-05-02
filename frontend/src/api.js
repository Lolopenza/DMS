const BACKEND_BASE = '/api';
const DEFAULT_TIMEOUT = 10_000;
const TIMEOUT_MATH_MS = 30_000;
const TIMEOUT_AI_MS = 60_000;

// ── Auth bridge ───────────────────────────────────────────────────────────────
// AuthContext registers a callback here so api.js can clear the session
// when a 401 refresh fails, without creating a circular import.

let onSessionExpired = null;

/**
 * Register a callback that will be invoked when the refresh token is also
 * expired (i.e. even POST /api/auth/refresh returned 401).
 *
 * AuthContext should call this in a useEffect to wire up automatic logout.
 */
export function registerSessionExpiryHandler(handler) {
  onSessionExpired = handler;
}

// ── Network error bridge ─────────────────────────────────────────────────────
// ToastProvider registers a handler so api.js can show toast notifications
// for network-level failures (server unreachable, timeout, DNS errors).

let onNetworkError = null;

export function registerNetworkErrorHandler(handler) {
  onNetworkError = handler;
}

function notifyNetworkError(message) {
  if (onNetworkError) {
    onNetworkError(message);
  }
}

// ── 401 refresh queue ────────────────────────────────────────────────────────

let isRefreshing = false;
let pendingQueue = [];

async function rawFetch(url, options = {}) {
  const controller = new AbortController();
  const timer = options.timeoutMs ? setTimeout(() => controller.abort(), options.timeoutMs) : null;

  try {
    const res = await fetch(url, {
      ...options,
      credentials: 'include',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    return res;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function rawRefresh() {
  const res = await rawFetch(`${BACKEND_BASE}/auth/refresh`, { method: 'POST' });
  if (!res.ok) {
    const err = new Error('Session expired');
    err.status = 401;
    err.code = 'SESSION_EXPIRED';
    throw err;
  }
}

function scheduleRetry(url, options) {
  return new Promise((resolve, reject) => {
    pendingQueue.push({ url, options, resolve, reject });

    if (!isRefreshing) {
      isRefreshing = true;
      rawRefresh()
        .then(() => {
          isRefreshing = false;
          processQueue();
        })
        .catch(() => {
          isRefreshing = false;
          const queue = pendingQueue;
          pendingQueue = [];
          for (const { reject: rej } of queue) {
            const expiryErr = new Error('Session expired. Please log in again.');
            expiryErr.status = 401;
            expiryErr.code = 'SESSION_EXPIRED';
            rej(expiryErr);
          }
          if (onSessionExpired) {
            onSessionExpired();
          }
        });
    }
  });
}

async function processQueue() {
  const queue = pendingQueue;
  pendingQueue = [];
  for (const { url, options, resolve, reject } of queue) {
    try {
      const result = await performRequest(url, options);
      resolve(result);
    } catch (e) {
      reject(e);
    }
  }
}

// ── Core request ──────────────────────────────────────────────────────────────

async function performRequest(url, options = {}) {
  const { timeoutMs, skipAuthRefresh, ...fetchOptions } = options;

  const effectiveTimeout = timeoutMs ?? DEFAULT_TIMEOUT;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), effectiveTimeout);

  try {
    const res = await fetch(url, {
      ...fetchOptions,
      credentials: 'include',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(fetchOptions.headers || {}),
      },
    });

    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (!res.ok) {
      if (res.status === 401 && !skipAuthRefresh) {
        return scheduleRetry(url, { timeoutMs: effectiveTimeout, skipAuthRefresh, ...fetchOptions });
      }

      const apiMessage = data?.error?.message;
      const legacyMessage = data?.detail || data?.error;
      const fallback = `HTTP ${res.status}`;
      const error = new Error(apiMessage || legacyMessage || fallback);
      error.status = data?.error?.status || res.status;
      error.code = data?.error?.code || null;
      error.details = data?.error?.details || null;
      throw error;
    }

    return data ?? {};
  } catch (err) {
    if (err.name === 'AbortError') {
      notifyNetworkError('Request timed out. Please try again.');
      const timeout = new Error('Request timed out. Please try again.');
      timeout.status = 408;
      timeout.code = 'TIMEOUT';
      throw timeout;
    }
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      notifyNetworkError('Network error. Check your connection.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function request(url, options = {}) {
  return performRequest(url, options);
}

// ── Math Engine via Backend Proxy ───────────────────────────────────────────

export function calcCombinatorics(payload) {
  return request(`${BACKEND_BASE}/calculator/combinatorics`, { method: 'POST', body: JSON.stringify(payload), timeoutMs: TIMEOUT_MATH_MS });
}

export function calcLogic(payload) {
  return request(`${BACKEND_BASE}/calculator/logic`, { method: 'POST', body: JSON.stringify(payload), timeoutMs: TIMEOUT_MATH_MS });
}

export function calcSetTheory(payload) {
  return request(`${BACKEND_BASE}/calculator/set_theory`, { method: 'POST', body: JSON.stringify(payload), timeoutMs: TIMEOUT_MATH_MS });
}

export function calcGraphTheory(payload) {
  return request(`${BACKEND_BASE}/calculator/graph_theory`, { method: 'POST', body: JSON.stringify(payload), timeoutMs: TIMEOUT_MATH_MS });
}

export function calcAutomata(payload) {
  return request(`${BACKEND_BASE}/calculator/automata`, { method: 'POST', body: JSON.stringify(payload), timeoutMs: TIMEOUT_MATH_MS });
}

export function calcNumberTheory(payload) {
  return request(`${BACKEND_BASE}/calculator/number_theory`, { method: 'POST', body: JSON.stringify(payload), timeoutMs: TIMEOUT_MATH_MS });
}

export function calcProbability(payload) {
  return request(`${BACKEND_BASE}/calculator/probability`, { method: 'POST', body: JSON.stringify(payload), timeoutMs: TIMEOUT_MATH_MS });
}

export function calcLinearAlgebra(payload) {
  return request(`${BACKEND_BASE}/calculator/linear_algebra`, { method: 'POST', body: JSON.stringify(payload), timeoutMs: TIMEOUT_MATH_MS });
}

export function calcAlgorithms(payload) {
  return request(`${BACKEND_BASE}/calculator/algorithms`, { method: 'POST', body: JSON.stringify(payload), timeoutMs: TIMEOUT_MATH_MS });
}

export function calcAdjacencyMatrix(subPath, payload) {
  return request(`${BACKEND_BASE}/calculator/adjacency_matrix/${subPath}`, { method: 'POST', body: JSON.stringify(payload), timeoutMs: TIMEOUT_MATH_MS });
}

export function sendChatMessage(messages, scope = {}) {
  return request(`${BACKEND_BASE}/calculator/chat`, {
    method: 'POST',
    body: JSON.stringify({ messages, subject: scope.subject, module: scope.module }),
    timeoutMs: TIMEOUT_AI_MS,
  });
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export function loginUser(credentials) {
  return request(`${BACKEND_BASE}/auth/login`, { method: 'POST', body: JSON.stringify(credentials), skipAuthRefresh: true });
}

export function registerUser(data) {
  return request(`${BACKEND_BASE}/auth/register`, { method: 'POST', body: JSON.stringify(data), skipAuthRefresh: true });
}

export function refreshAuth() {
  return request(`${BACKEND_BASE}/auth/refresh`, { method: 'POST', skipAuthRefresh: true });
}

export function getCurrentUser() {
  return request(`${BACKEND_BASE}/auth/me`);
}

export function updateUserProfile(payload) {
  return request(`${BACKEND_BASE}/auth/profile`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function logoutCurrentSession() {
  return request(`${BACKEND_BASE}/auth/logout`, { method: 'POST', skipAuthRefresh: true });
}

export function logoutAllSessions() {
  return request(`${BACKEND_BASE}/auth/logout-all`, { method: 'POST', skipAuthRefresh: true });
}

export function getActiveSessions() {
  return request(`${BACKEND_BASE}/auth/sessions`);
}

export function requestPasswordReset(email) {
  return request(`${BACKEND_BASE}/auth/password/reset-request`, {
    method: 'POST',
    body: JSON.stringify({ email }),
    skipAuthRefresh: true,
  });
}

export function confirmPasswordReset(token, newPassword) {
  return request(`${BACKEND_BASE}/auth/password/reset-confirm`, {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
    skipAuthRefresh: true,
  });
}

// ── Learning / Content Management ───────────────────────────────────────────

export function getLearningRecommendations() {
  return request(`${BACKEND_BASE}/learning/recommendations`);
}

export function getAdaptivePracticeTopic() {
  return request(`${BACKEND_BASE}/learning/adaptive-practice-topic`);
}

/** Calculator catalog: route segment → BKT skillTopicSlug */
export function getLearningModuleCatalog() {
  return request(`${BACKEND_BASE}/learning/catalog/modules`);
}

export function getLearningProgressSubjects() {
  return request(`${BACKEND_BASE}/learning/progress/subjects`);
}

export function getLearningJourneySnapshot() {
  return request(`${BACKEND_BASE}/learning/progress/journey`);
}

/** Streak, daily goal, achievement badges (authenticated) */
export function getGamificationSummary() {
  return request(`${BACKEND_BASE}/user/gamification/summary`);
}

export function listCourses() {
  return request(`${BACKEND_BASE}/learning/courses`);
}

export function listModules(courseId) {
  return request(`${BACKEND_BASE}/learning/courses/${courseId}/modules`);
}

export function listLessons(moduleId) {
  return request(`${BACKEND_BASE}/learning/modules/${moduleId}/lessons`);
}

export function createCourse(payload) {
  return request(`${BACKEND_BASE}/admin/courses`, { method: 'POST', body: JSON.stringify(payload) });
}

export function createModule(payload) {
  return request(`${BACKEND_BASE}/admin/modules`, { method: 'POST', body: JSON.stringify(payload) });
}

export function createLesson(payload) {
  return request(`${BACKEND_BASE}/admin/lessons`, { method: 'POST', body: JSON.stringify(payload) });
}

// ── Interactive AI Problem Generation ─────────────────────────────────────

export function generateInteractiveProblem(payload) {
  return request(`${BACKEND_BASE}/problems/generated`, {
    method: 'POST',
    body: JSON.stringify(payload),
    timeoutMs: TIMEOUT_AI_MS,
  });
}

export function listMyGeneratedProblems() {
  return request(`${BACKEND_BASE}/problems/generated/me`);
}

export function submitGeneratedProblemAttempt(generatedProblemId, payload) {
  return request(`${BACKEND_BASE}/problems/generated/${generatedProblemId}/attempt`, {
    method: 'POST',
    body: JSON.stringify(payload),
    timeoutMs: TIMEOUT_AI_MS,
  });
}

export function getUserSkills() {
  return request(`${BACKEND_BASE}/problems/skills/me`);
}

export function getLearningFeedback(payload = {}) {
  return request(`${BACKEND_BASE}/problems/learning/feedback`, {
    method: 'POST',
    body: JSON.stringify(payload),
    timeoutMs: TIMEOUT_AI_MS,
  });
}

export function getMyAnalyticsCsvUrl(windowDays = 30) {
  return `${BACKEND_BASE}/v1/analytics/me/raw.csv?windowDays=${encodeURIComponent(windowDays)}`;
}

export function getMyColabStarter(windowDays = 30, lessonMode = true) {
  const qs = new URLSearchParams({
    windowDays: String(windowDays),
    lessonMode: String(Boolean(lessonMode)),
  });
  return request(`${BACKEND_BASE}/v1/analytics/me/colab-starter?${qs.toString()}`);
}

export function getMyRawAnalytics(windowDays = 30) {
  return request(`${BACKEND_BASE}/v1/analytics/me/raw?windowDays=${encodeURIComponent(windowDays)}`);
}

/** Rolling accuracy timeline for one BKT topic (authenticated) */
export function getMySkillTrajectory(topicSlug, windowDays = 30) {
  const qs = new URLSearchParams({
    topicSlug: String(topicSlug || ''),
    windowDays: String(windowDays),
  });
  return request(`${BACKEND_BASE}/v1/analytics/me/skill-trajectory?${qs.toString()}`);
}

export function submitStudentFeedback(payload) {
  return request(`${BACKEND_BASE}/v1/feedback`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getStudentFeedbackStatus() {
  return request(`${BACKEND_BASE}/v1/feedback/status`);
}

// ── Admin panel API ─────────────────────────────────────────────────────────

export function getAdminStats() {
  return request(`${BACKEND_BASE}/v1/admin/stats`);
}

export function getAdminUsers(page = 0, size = 20) {
  return request(`${BACKEND_BASE}/v1/admin/users?page=${encodeURIComponent(page)}&size=${encodeURIComponent(size)}`);
}

export function deactivateAdminUser(userId) {
  return request(`${BACKEND_BASE}/v1/admin/users/${userId}/deactivate`, {
    method: 'PATCH',
  });
}

export function activateAdminUser(userId) {
  return request(`${BACKEND_BASE}/v1/admin/users/${userId}/activate`, {
    method: 'PATCH',
  });
}

export function getPublicSetting(key) {
  return request(`${BACKEND_BASE}/v1/public/settings/${encodeURIComponent(key)}`);
}

export function putAdminSetting(key, value) {
  return request(`${BACKEND_BASE}/v1/admin/settings/${encodeURIComponent(key)}`, {
    method: 'PUT',
    body: JSON.stringify({ value }),
  });
}

export function getAdminRawAnalytics(userId, windowDays = 30) {
  return request(
    `${BACKEND_BASE}/v1/admin/analytics/raw-preview?userId=${encodeURIComponent(userId)}&windowDays=${encodeURIComponent(windowDays)}`
  );
}

export function getAdminRawAnalyticsCsvUrl(userId, windowDays = 30) {
  return `${BACKEND_BASE}/v1/admin/analytics/raw-preview.csv?userId=${encodeURIComponent(userId)}&windowDays=${encodeURIComponent(windowDays)}`;
}
