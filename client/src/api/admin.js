import { http } from './http';
import * as mock from './mockApi';
import { withMockFallback } from '@/utils/devFallback';

// Admin console endpoints (PRD §8), role-guarded server-side. Every call falls back to mockApi.js
// when the real API is unreachable in a dev build — see withMockFallback().

// --- dashboard ---------------------------------------------------------------

export function getDashboardStats() {
  return withMockFallback(
    () => http.get('/admin/dashboard'),
    () => mock.adminDashboardStats(),
  );
}

// --- spots (spoter: own only, super_admin: all) -------------------------------

export function getAdminSpots(params, { signal } = {}) {
  return withMockFallback(
    () => http.get('/admin/spots', { query: params, signal }),
    () => mock.adminListSpots(params),
  );
}

export function getAdminSpot(id, { signal } = {}) {
  return withMockFallback(
    () => http.get(`/admin/spots/${id}`, { signal }),
    () => mock.adminGetSpot(Number(id)),
  );
}

export function createAdminSpot(input) {
  return withMockFallback(
    () => http.post('/admin/spots', input),
    () => mock.adminCreateSpot(input),
  );
}

export function updateAdminSpot(id, patch) {
  return withMockFallback(
    () => http.put(`/admin/spots/${id}`, patch),
    () => mock.adminUpdateSpot(Number(id), patch),
  );
}

export function deleteAdminSpot(id) {
  return withMockFallback(
    () => http.delete(`/admin/spots/${id}`),
    () => mock.adminDeleteSpot(Number(id)),
  );
}

/** Replaces the gallery; array order becomes the display order. */
export function replaceSpotImages(id, images) {
  return withMockFallback(
    () => http.put(`/admin/spots/${id}/images`, { images }),
    () => mock.replaceSpotImages(Number(id), images),
  );
}

// --- image upload --------------------------------------------------------------

/** Uploads one image file; resolves to { path, url, width, height, size, mime }. */
export function uploadImage(file) {
  return withMockFallback(
    () => {
      const form = new FormData();
      form.append('file', file);
      return http.post('/admin/upload', form);
    },
    () => mock.adminUploadImage(file),
  );
}

// --- categories (super_admin only) ----------------------------------------------

export function getAdminCategories({ signal } = {}) {
  return withMockFallback(
    () => http.get('/admin/categories', { signal }),
    () => mock.adminListCategories(),
  );
}

export function createCategory(input) {
  return withMockFallback(
    () => http.post('/admin/categories', input),
    () => mock.adminCreateCategory(input),
  );
}

export function updateCategory(id, patch) {
  return withMockFallback(
    () => http.put(`/admin/categories/${id}`, patch),
    () => mock.adminUpdateCategory(Number(id), patch),
  );
}

export function deleteCategory(id) {
  return withMockFallback(
    () => http.delete(`/admin/categories/${id}`),
    () => mock.adminDeleteCategory(Number(id)),
  );
}

// --- events (super_admin only) --------------------------------------------------

export function getAdminEvents(params, { signal } = {}) {
  return withMockFallback(
    () => http.get('/admin/events', { query: params, signal }),
    () => mock.adminListEvents(params),
  );
}

export function getAdminEvent(id, { signal } = {}) {
  return withMockFallback(
    () => http.get(`/admin/events/${id}`, { signal }),
    () => mock.adminGetEvent(Number(id)),
  );
}

export function createEvent(input) {
  return withMockFallback(
    () => http.post('/admin/events', input),
    () => mock.adminCreateEvent(input),
  );
}

export function updateEvent(id, patch) {
  return withMockFallback(
    () => http.put(`/admin/events/${id}`, patch),
    () => mock.adminUpdateEvent(Number(id), patch),
  );
}

export function deleteEvent(id) {
  return withMockFallback(
    () => http.delete(`/admin/events/${id}`),
    () => mock.adminDeleteEvent(Number(id)),
  );
}

// --- submission triage (super_admin only) ---------------------------------------

export function getAdminSubmissions(params, { signal } = {}) {
  return withMockFallback(
    () => http.get('/admin/submissions', { query: params, signal }),
    () => mock.adminListSubmissions(params),
  );
}

export function getAdminSubmission(id, { signal } = {}) {
  return withMockFallback(
    () => http.get(`/admin/submissions/${id}`, { signal }),
    () => mock.adminGetSubmission(Number(id)),
  );
}

export function rejectSubmission(id) {
  return withMockFallback(
    () => http.put(`/admin/submissions/${id}`, { status: 'rejected' }),
    () => mock.reviewSubmission(Number(id), { status: 'rejected' }),
  );
}

/** Approves a suggestion, creating a draft spot seeded from it plus any enrichment in `spotOverrides`. */
export function approveSubmission(id, spotOverrides) {
  return withMockFallback(
    () => http.put(`/admin/submissions/${id}`, { status: 'approved', spot: spotOverrides }),
    () => mock.reviewSubmission(Number(id), { status: 'approved', spot: spotOverrides }),
  );
}

// --- media library (super_admin only) -------------------------------------------

export function getMedia(params, { signal } = {}) {
  return withMockFallback(
    () => http.get('/admin/media', { query: params, signal }),
    () => mock.adminListMedia(params ?? {}),
  );
}

export function deleteMedia(path) {
  return withMockFallback(
    () => http.delete('/admin/media', { query: { path } }),
    () => mock.adminDeleteMedia(path),
  );
}
