import { ApiError, http } from './http';
import * as mock from './mockApi';
import { clearMockSignedOut, setMockSignedOut, withMockFallback } from '@/utils/devFallback';

// Public + authenticated endpoints (PRD §5.1–§5.2). Every call falls back to mockApi.js (backed by
// mockData.js) when the real API is unreachable in a dev build — see withMockFallback().

// --- session -----------------------------------------------------------------

/** Resolves to the signed-in user, or null when there is no valid session. */
export async function getCurrentUser({ signal } = {}) {
  return withMockFallback(
    async () => {
      try {
        return await http.get('/auth/me', { signal });
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }
    },
    () => mock.currentUser(),
  );
}

export function exchangeGoogleCode({ code, codeVerifier }) {
  return withMockFallback(
    () => http.post('/auth/google', { code, codeVerifier }, { refresh: false }),
    () => {
      // There is no real backend to validate the code against; dev fallback just resumes the mock session.
      clearMockSignedOut();
      return mock.currentUser();
    },
  );
}

export function logoutUser() {
  return withMockFallback(
    () => http.post('/auth/logout', undefined, { refresh: false }),
    () => setMockSignedOut(),
  );
}

// --- categories ----------------------------------------------------------------

export function getCategories() {
  return withMockFallback(
    () => http.get('/categories'),
    () => mock.listCategories(),
  );
}

// --- spots -----------------------------------------------------------------

export function getSpots(params, { signal } = {}) {
  return withMockFallback(
    () => http.get('/spots', { query: params, signal }),
    () => mock.listSpots(params),
  );
}

export function getHotSpots({ signal } = {}) {
  return withMockFallback(
    () => http.get('/spots/hotspots', { signal }),
    () => mock.getHotSpots(),
  );
}

export function getSpotFacets({ signal } = {}) {
  return withMockFallback(
    () => http.get('/spots/facets', { signal }),
    () => mock.getSpotFacets(),
  );
}

export function getSpot(id, { signal } = {}) {
  return withMockFallback(
    () => http.get(`/spots/${id}`, { signal }),
    () => mock.getSpotDetail(Number(id)),
  );
}

export function likeSpot(id) {
  return withMockFallback(
    () => http.post(`/spots/${id}/like`),
    () => mock.likeSpot(Number(id)),
  );
}

export function unlikeSpot(id) {
  return withMockFallback(
    () => http.delete(`/spots/${id}/like`),
    () => mock.unlikeSpot(Number(id)),
  );
}

// --- events ------------------------------------------------------------------

export function getEvents(params, { signal } = {}) {
  return withMockFallback(
    () => http.get('/events', { query: params, signal }),
    () => mock.listEvents({ ...params, status: (params?.status ?? 'upcoming,ongoing').split(',') }),
  );
}

export function getEvent(id, { signal } = {}) {
  return withMockFallback(
    () => http.get(`/events/${id}`, { signal }),
    () => mock.getEvent(Number(id)),
  );
}

// --- bookmarks ---------------------------------------------------------------

export function getBookmarks(params, { signal } = {}) {
  return withMockFallback(
    () => http.get('/bookmarks', { query: params, signal }),
    () => mock.listBookmarks(params),
  );
}

export function addBookmark(spotId) {
  return withMockFallback(
    () => http.post(`/bookmarks/${spotId}`),
    () => mock.addBookmark(Number(spotId)),
  );
}

export function removeBookmark(spotId) {
  return withMockFallback(
    () => http.delete(`/bookmarks/${spotId}`),
    () => mock.removeBookmark(Number(spotId)),
  );
}

// --- submissions ---------------------------------------------------------------

/** `input` is the PRD §7.8 form fields; `imageFile` is the optional single image. */
export function createSubmission(input, imageFile) {
  return withMockFallback(
    () => {
      const form = new FormData();
      for (const [key, value] of Object.entries(input)) form.append(key, value);
      if (imageFile) form.append('image', imageFile);
      return http.post('/submissions', form);
    },
    () => mock.createSubmission(input, imageFile),
  );
}

export function getMySubmissions(params, { signal } = {}) {
  return withMockFallback(
    () => http.get('/submissions', { query: params, signal }),
    () => mock.listUserSubmissions(params),
  );
}
