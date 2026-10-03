// Dev-only convenience: simulated session for mockApi.js, so likes/bookmarks/submissions are
// demoable offline. Has no effect once the real API answers — see withMockFallback().
const VIEWER_KEY = 'spots-mock-viewer-id';
const SIGNED_OUT_KEY = 'spots-mock-signed-out';

export const isDevFallbackEnabled = import.meta.env.DEV;

/**
 * Calls the real endpoint; if it is unreachable (network error, dead dev proxy, non-JSON 2xx)
 * and this is a dev build, falls back to local mock data instead. Rethrows any other failure
 * (4xx/5xx from a live API) so real errors are never hidden, in dev or production.
 */
export async function withMockFallback(call, mock) {
  try {
    return await call();
  } catch (error) {
    if (isDevFallbackEnabled && error?.unreachable) {
      console.warn(`[mock fallback] ${error.message} — using mockData.js`);
      return mock();
    }
    throw error;
  }
}

export function getMockViewerId() {
  const stored = Number(localStorage.getItem(VIEWER_KEY));
  return Number.isInteger(stored) && stored > 0 ? stored : 1; // defaults to Asha (explorer)
}

export function setMockViewerId(userId) {
  localStorage.setItem(VIEWER_KEY, String(userId));
  localStorage.removeItem(SIGNED_OUT_KEY);
}

export const isMockSignedOut = () => localStorage.getItem(SIGNED_OUT_KEY) === '1';
export const setMockSignedOut = () => localStorage.setItem(SIGNED_OUT_KEY, '1');
export const clearMockSignedOut = () => localStorage.removeItem(SIGNED_OUT_KEY);
