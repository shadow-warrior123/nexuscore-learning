/**
 * Backend API Client with offline/localStorage fallback
 */

const getBackendUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:3001';
  if (window.location.port === '3001') return '';
  return `${window.location.protocol}//${window.location.hostname}:3001`;
};

const BACKEND_URL = getBackendUrl();

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/health`, { signal: AbortSignal.timeout(1500) });
    if (res.ok) {
      const data = await res.json();
      return { isOnline: true, ...data };
    }
    return { isOnline: false };
  } catch (e) {
    return { isOnline: false };
  }
}

export async function submitProblemToBackend(payload) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000)
    });
    return await res.json();
  } catch (e) {
    console.warn("Backend unavailable, falling back to client-only mode:", e.message);
    return null;
  }
}

export async function getSubmissionHistory(problemId) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/submissions/${problemId}`, {
      signal: AbortSignal.timeout(2000)
    });
    if (res.ok) {
      const data = await res.json();
      return data.submissions || [];
    }
    return [];
  } catch (e) {
    return [];
  }
}

export async function saveCodeDraftToBackend(payload) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/progress/save-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(2000)
    });
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function getBackendStats() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/stats`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch (e) {
    return null;
  }
}
