import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
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
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<MapPage />} />
        <Route path="spots" element={<SpotsPage />} />
        <Route path="spots/hotspots" element={<HotSpotsPage />} />
        <Route path="spot/:id" element={<SpotDetailPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="event/:id" element={<EventDetailPage />} />
        <Route
          path="profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route
          path="profile/bookmarks"
          element={
            <RequireAuth>
              <BookmarksPage />
            </RequireAuth>
          }
        />
        <Route
          path="admin/*"
          element={
            <RequireAuth roles={ADMIN_ROLES}>
              <Suspense fallback={<RouteFallback />}>
                <AdminApp />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route path="auth/callback" element={<AuthCallbackPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
