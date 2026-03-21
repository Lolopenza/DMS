/**
 * API: Logic module
 * 
 * Endpoint: POST /api/v1/logic/
 */

const MATH_ENGINE_BASE = '/api/v1';

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

export function calcLogic(payload) {
  return request(`${MATH_ENGINE_BASE}/logic/`, { method: 'POST', body: JSON.stringify(payload) });
}
