const BACKEND_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('jwt_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
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
}

// ── Math Engine via Backend Proxy ───────────────────────────────────────────

// URL paths match backend router prefixes (underscores, trailing slash)
export function calcCombinatorics(payload) {
  return request(`${BACKEND_BASE}/calculator/combinatorics`, { method: 'POST', body: JSON.stringify(payload) });
}

export function calcLogic(payload) {
  return request(`${BACKEND_BASE}/calculator/logic`, { method: 'POST', body: JSON.stringify(payload) });
}

export function calcSetTheory(payload) {
  return request(`${BACKEND_BASE}/calculator/set_theory`, { method: 'POST', body: JSON.stringify(payload) });
}

export function calcGraphTheory(payload) {
  return request(`${BACKEND_BASE}/calculator/graph_theory`, { method: 'POST', body: JSON.stringify(payload) });
}

export function calcAutomata(payload) {
  return request(`${BACKEND_BASE}/calculator/automata`, { method: 'POST', body: JSON.stringify(payload) });
}

export function calcNumberTheory(payload) {
  return request(`${BACKEND_BASE}/calculator/number_theory`, { method: 'POST', body: JSON.stringify(payload) });
}

export function calcProbability(payload) {
  return request(`${BACKEND_BASE}/calculator/probability`, { method: 'POST', body: JSON.stringify(payload) });
}

export function calcLinearAlgebra(payload) {
  return request(`${BACKEND_BASE}/calculator/linear_algebra`, { method: 'POST', body: JSON.stringify(payload) });
}

export function calcAlgorithms(payload) {
  return request(`${BACKEND_BASE}/calculator/algorithms`, { method: 'POST', body: JSON.stringify(payload) });
}

export function calcAdjacencyMatrix(subPath, payload) {
  return request(`${BACKEND_BASE}/calculator/adjacency_matrix/${subPath}`, { method: 'POST', body: JSON.stringify(payload) });
}

export function sendChatMessage(messages, scope = {}) {
  return request(`${BACKEND_BASE}/calculator/chat`, {
    method: 'POST',
    body: JSON.stringify({ messages, subject: scope.subject, module: scope.module }),
  });
}

// ── Java Backend ─────────────────────────────────────────────────────────────

export function loginUser(credentials) {
  return request(`${BACKEND_BASE}/auth/login`, { method: 'POST', body: JSON.stringify(credentials) });
}

export function registerUser(data) {
  return request(`${BACKEND_BASE}/auth/register`, { method: 'POST', body: JSON.stringify(data) });
}

export function refreshAuth() {
  return request(`${BACKEND_BASE}/auth/refresh`, { method: 'POST' });
}

export function getCurrentUser() {
  return request(`${BACKEND_BASE}/auth/me`);
}

export function logoutCurrentSession() {
  return request(`${BACKEND_BASE}/auth/logout`, { method: 'POST' });
}

export function logoutAllSessions() {
  return request(`${BACKEND_BASE}/auth/logout-all`, { method: 'POST' });
}

export function getActiveSessions() {
  return request(`${BACKEND_BASE}/auth/sessions`);
}

export function requestPasswordReset(email) {
  return request(`${BACKEND_BASE}/auth/password/reset-request`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function confirmPasswordReset(token, newPassword) {
  return request(`${BACKEND_BASE}/auth/password/reset-confirm`, {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
}

// ── Learning / Content Management ───────────────────────────────────────────

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
  });
}

export function listMyGeneratedProblems() {
  return request(`${BACKEND_BASE}/problems/generated/me`);
}

export function submitGeneratedProblemAttempt(generatedProblemId, payload) {
  return request(`${BACKEND_BASE}/problems/generated/${generatedProblemId}/attempt`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
