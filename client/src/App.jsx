import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import RequireAuth from '@/components/RequireAuth';
import AuthCallbackPage from '@/pages/AuthCallbackPage';
import BookmarksPage from '@/pages/BookmarksPage';
import EventDetailPage from '@/pages/EventDetailPage';
import EventsPage from '@/pages/EventsPage';
import HotSpotsPage from '@/pages/HotSpotsPage';
import MapPage from '@/pages/MapPage';
import NotFoundPage from '@/pages/NotFoundPage';
import ProfilePage from '@/pages/ProfilePage';
import SpotDetailPage from '@/pages/SpotDetailPage';
import SpotsPage from '@/pages/SpotsPage';
import SuggestSpotPage from '@/pages/SuggestSpotPage';
import MySubmissionsPage from '@/pages/MySubmissionsPage';

// Admin code stays out of the consumer bundle (PRD §9.1).
const AdminApp = lazy(() => import('@/pages/admin/AdminApp'));

const ADMIN_ROLES = ['spoter', 'super_admin'];

function RouteFallback() {
  return (
    <p role="status" className="px-edge py-10 text-body text-mithila-muted">
      Loading…
    </p>
  );
}

// Route table mirrors PRD §7.1. `auth/callback` is the Google OAuth return URL from PRD §5.2.
export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<ErrorBoundary section><MapPage /></ErrorBoundary>} />
          <Route path="spots" element={<ErrorBoundary section><SpotsPage /></ErrorBoundary>} />
          <Route path="spots/hotspots" element={<ErrorBoundary section><HotSpotsPage /></ErrorBoundary>} />
          <Route path="spot/:id" element={<ErrorBoundary section><SpotDetailPage /></ErrorBoundary>} />
          <Route path="spots/:id" element={<ErrorBoundary section><SpotDetailPage /></ErrorBoundary>} />
          <Route path="events" element={<ErrorBoundary section><EventsPage /></ErrorBoundary>} />
          <Route path="event/:id" element={<ErrorBoundary section><EventDetailPage /></ErrorBoundary>} />
          <Route
            path="suggest"
            element={
              <RequireAuth>
                <ErrorBoundary section><SuggestSpotPage /></ErrorBoundary>
              </RequireAuth>
            }
          />
          <Route
            path="profile"
            element={
              <RequireAuth>
                <ErrorBoundary section><ProfilePage /></ErrorBoundary>
              </RequireAuth>
            }
          />
          <Route
            path="profile/bookmarks"
            element={
              <RequireAuth>
                <ErrorBoundary section><BookmarksPage /></ErrorBoundary>
              </RequireAuth>
            }
          />
          <Route
            path="profile/submissions"
            element={
              <RequireAuth>
                <ErrorBoundary section><MySubmissionsPage /></ErrorBoundary>
              </RequireAuth>
            }
          />
          <Route path="auth/callback" element={<AuthCallbackPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Standalone Admin Console (no consumer shell) */}
        <Route
          path="admin/*"
          element={
            <RequireAuth roles={ADMIN_ROLES}>
              <ErrorBoundary>
                <Suspense fallback={<RouteFallback />}>
                  <AdminApp />
                </Suspense>
              </ErrorBoundary>
            </RequireAuth>
          }
        />
      </Routes>
    </ErrorBoundary>
  );
}

