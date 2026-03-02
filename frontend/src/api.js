const MATH_ENGINE_BASE = '/api/v1';
const BACKEND_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('jwt_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || data.error || `HTTP ${res.status}`);
  }
  return data;
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
