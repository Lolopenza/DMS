/**
 * API: Set Theory module
 * 
 * Endpoint: POST /api/v1/set_theory/
 */

// In dev/prod we call the Spring Boot proxy, not math-engine directly.
// Backend forwards to math-engine and injects X-Internal-Api-Key.
const MATH_ENGINE_BASE = (import.meta.env.VITE_API_BASE_URL || '/api') + '/calculator';

const TIMEOUT_MATH_MS = 30_000;

async function request(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MATH_MS);

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
  } catch (err) {
    if (err.name === 'AbortError') {
      const timeout = new Error('Request timed out. Please try again.');
      timeout.status = 408;
      timeout.code = 'TIMEOUT';
      throw timeout;
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export function calcSetTheory(payload) {
  return request(`${MATH_ENGINE_BASE}/set_theory`, { method: 'POST', body: JSON.stringify(payload) });
}
