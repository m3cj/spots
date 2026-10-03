// Thin fetch wrapper shared by api/public.js and api/admin.js. Auth rides on httpOnly cookies,
// so the client never sees a token — it only sends credentials and reacts to status codes.

const API_BASE = `${(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')}/api`;

export class ApiError extends Error {
  constructor(message, { status = 0, code, details, unreachable = false } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    /** True when no API answered at all (network failure, dead dev proxy, SPA fallback page). */
    this.unreachable = unreachable;
  }
}

function buildUrl(path, query) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== '') params.append(key, String(value));
  }
  const search = params.toString();
  return `${API_BASE}${path}${search ? `?${search}` : ''}`;
}

async function send(path, { method = 'GET', body, query, signal } = {}) {
  const isForm = body instanceof FormData;

  let response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      signal,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && !isForm ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body === undefined || isForm ? body : JSON.stringify(body),
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('Cannot reach the server.', { unreachable: true });
  }

  const isJson = response.headers.get('content-type')?.includes('application/json') ?? false;
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (response.ok) {
    // A non-JSON 2xx means something other than the API answered (e.g. the SPA fallback page).
    if (response.status !== 204 && !isJson) {
      throw new ApiError('Unexpected response from the server.', {
        status: response.status,
        unreachable: true,
      });
    }
    return payload;
  }

  throw new ApiError(payload?.error?.message ?? `Request failed (${response.status}).`, {
    status: response.status,
    code: payload?.error?.code,
    details: payload?.error?.details,
    // The Vite dev proxy answers 500 with an empty text body while the backend is down.
    unreachable: response.status >= 500 && !isJson,
  });
}

let refreshInFlight = null;

function refreshSession() {
  refreshInFlight ??= send('/auth/refresh', { method: 'POST' })
    .then(
      () => true,
      () => false,
    )
    .finally(() => {
      refreshInFlight = null;
    });
  return refreshInFlight;
}

// One transparent refresh + retry when the 24h access cookie has lapsed.
// Pass { refresh: false } on the auth endpoints themselves to avoid loops.
async function request(path, options = {}) {
  try {
    return await send(path, options);
  } catch (error) {
    const canRefresh =
      options.refresh !== false &&
      error instanceof ApiError &&
      error.status === 401 &&
      error.code !== 'NO_SESSION';

    if (!canRefresh || !(await refreshSession())) throw error;
    return send(path, options);
  }
}

export const http = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};
