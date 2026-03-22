const MATH_ENGINE_BASE = '/api/v1';
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

// ── Math Engine ──────────────────────────────────────────────────────────────

// URL paths match backend router prefixes (underscores, trailing slash)
export function calcCombinatorics(payload) {
  return request(`${MATH_ENGINE_BASE}/combinatorics/`, { method: 'POST', body: JSON.stringify(payload) });
}

export function calcLogic(payload) {
  return request(`${MATH_ENGINE_BASE}/logic/`, { method: 'POST', body: JSON.stringify(payload) });
}

export function calcSetTheory(payload) {
  return request(`${MATH_ENGINE_BASE}/set_theory/`, { method: 'POST', body: JSON.stringify(payload) });
}

export function calcGraphTheory(payload) {
  return request(`${MATH_ENGINE_BASE}/graph_theory/`, { method: 'POST', body: JSON.stringify(payload) });
}

export function calcAutomata(payload) {
  return request(`${MATH_ENGINE_BASE}/automata/`, { method: 'POST', body: JSON.stringify(payload) });
}

export function calcNumberTheory(payload) {
  return request(`${MATH_ENGINE_BASE}/number_theory/`, { method: 'POST', body: JSON.stringify(payload) });
}

export function calcProbability(payload) {
  return request(`${MATH_ENGINE_BASE}/probability/`, { method: 'POST', body: JSON.stringify(payload) });
}

export function calcLinearAlgebra(payload) {
  return request(`${MATH_ENGINE_BASE}/linear_algebra/`, { method: 'POST', body: JSON.stringify(payload) });
}

export function calcAlgorithms(payload) {
  return request(`${MATH_ENGINE_BASE}/algorithms/`, { method: 'POST', body: JSON.stringify(payload) });
}

export function calcAdjacencyMatrix(subPath, payload) {
  return request(`${MATH_ENGINE_BASE}/adjacency_matrix/${subPath}`, { method: 'POST', body: JSON.stringify(payload) });
}

export function sendChatMessage(messages) {
  return request(`${MATH_ENGINE_BASE}/chat/`, { method: 'POST', body: JSON.stringify({ messages }) });
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
