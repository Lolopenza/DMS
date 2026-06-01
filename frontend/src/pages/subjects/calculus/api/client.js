/**
 * Calculus calculator — proxied via Spring POST /api/calculator/calculus → math-engine /api/v1/calculus/
 */
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
      const error = new Error(apiMessage || legacyMessage || `HTTP ${res.status}`);
      error.status = data?.error?.status || res.status;
      throw error;
    }
    return data ?? {};
  } catch (err) {
    if (err.name === 'AbortError') {
      const timeout = new Error('Request timed out. Please try again.');
      timeout.status = 408;
      throw timeout;
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/** Body must include `module` + `operation` plus fields expected by math-engine. */
export function calcCalculus(payload) {
  return request(`${MATH_ENGINE_BASE}/calculus`, { method: 'POST', body: JSON.stringify(payload) });
}
