import { useState } from 'react';
import { Link, Navigate, NavLink, Route, Routes } from 'react-router-dom';
import {
  PiArrowLeft,
  PiCalendar,
  PiChartBar,
  PiClipboardText,
  PiDotsThreeOutlineVertical,
  PiHouse,
  PiImages,
  PiMapPin,
  PiSignOut,
  PiTag,
  PiUser,
  PiX,
} from 'react-icons/pi';
import { useAuth } from '@/hooks/useAuth';
import AdminCategories from './AdminCategories';
import AdminDashboard from './AdminDashboard';
import AdminEvents from './AdminEvents';
import AdminMedia from './AdminMedia';
import AdminSpotEditPage from './AdminSpotEditPage';
import AdminSpots from './AdminSpots';
import AdminSubmissionReviewPage from './AdminSubmissionReviewPage';
import AdminSubmissions from './AdminSubmissions';

const NAV = [
  { to: '/admin', end: true, icon: PiChartBar, label: 'Dashboard', superOnly: true },
  { to: '/admin/spots', icon: PiMapPin, label: 'Spots', superOnly: false },
  { to: '/admin/submissions', icon: PiClipboardText, label: 'Submissions', superOnly: true },
  { to: '/admin/events', icon: PiCalendar, label: 'Events', superOnly: true },
  { to: '/admin/categories', icon: PiTag, label: 'Categories', superOnly: true },
  { to: '/admin/media', icon: PiImages, label: 'Media', superOnly: true },
];

function AdminSidebar({ isSuperAdmin, user, logout }) {
  const links = NAV.filter((item) => !item.superOnly || isSuperAdmin);

  return (
    <aside
      aria-label="Admin sidebar"
      className="hidden lg:flex lg:w-[220px] lg:flex-col lg:justify-between lg:h-screen lg:sticky lg:top-0 lg:shrink-0 lg:border-r lg:border-mithila-border lg:bg-mithila-card"
    >
      <div>
        {/* Brand */}
        <div className="border-b border-mithila-border px-5 py-4">
          <Link to="/" className="inline-block">
            <span className="font-handwritten text-[22px] font-bold text-mithila-primary">SpotS</span>
            <span className="ml-1.5 font-sans text-[12px] font-semibold uppercase tracking-wider text-mithila-text">Admin</span>
          </Link>
          <p className="mt-0.5 text-[11px] text-mithila-muted">Curation Console</p>
        </div>

        {/* Navigation links */}
        <nav className="p-2 space-y-1">
          {links.map(({ to, end, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `press flex items-center gap-2.5 rounded-sm px-3 py-2.5 text-button transition-colors ${
                  isActive
                    ? 'bg-mithila-pill font-semibold text-mithila-primary'
                    : 'text-mithila-textSecondary hover:bg-mithila-pill/60 hover:text-mithila-text'
                }`
              }
            >
              <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer info & exit */}
      <div className="border-t border-mithila-border p-3 space-y-2">
        {/* User chip */}
        <div className="flex items-center gap-2.5 rounded-xs bg-mithila-bg/60 p-2">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt=""
              referrerPolicy="no-referrer"
              className="h-8 w-8 rounded-pill object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-pill bg-mithila-pill text-mithila-muted">
              <PiUser aria-hidden="true" className="h-4 w-4" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-semibold text-mithila-text">{user?.name || 'Curator'}</p>
            <span className="inline-block text-[10px] text-mithila-muted font-medium">
              {isSuperAdmin ? 'Super Admin' : 'Spoter'}
            </span>
          </div>
        </div>

        {/* Action links */}
        <div className="pt-1 space-y-1">
          <Link
            to="/"
            className="press flex w-full items-center gap-2 rounded-xs px-2.5 py-1.5 text-[12px] font-medium text-mithila-textSecondary hover:bg-mithila-pill hover:text-mithila-text"
          >
            <PiHouse aria-hidden="true" className="h-4 w-4 text-mithila-primary" />
            <span>Back to Consumer App</span>
          </Link>
          <button
            type="button"
            onClick={logout}
            className="press flex w-full items-center gap-2 rounded-xs px-2.5 py-1.5 text-[12px] font-medium text-state-danger hover:bg-mithila-pill"
          >
            <PiSignOut aria-hidden="true" className="h-4 w-4" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

function AdminMobileNav({ isSuperAdmin, user, logout }) {
  const [showMore, setShowMore] = useState(false);
  const links = NAV.filter((item) => !item.superOnly || isSuperAdmin);
  // Show first 4 in bottom bar, overflow in "More"
  const primaryLinks = links.slice(0, 4);
  const overflowLinks = links.slice(4);

  return (
    <>
      {/* Top Mobile Bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-mithila-border bg-mithila-card px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <Link to="/" className="font-handwritten text-[20px] font-bold text-mithila-primary">
            SpotS
          </Link>
          <span className="rounded-pill bg-mithila-pill px-2 py-0.5 text-[10px] font-semibold text-mithila-text">
            {isSuperAdmin ? 'Admin' : 'Spoter'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            title="Back to consumer app"
            className="press flex items-center gap-1 rounded-pill border border-mithila-border px-3 py-1 text-[12px] font-medium text-mithila-text"
          >
            <PiHouse aria-hidden="true" className="h-3.5 w-3.5 text-mithila-primary" />
            <span>App</span>
          </Link>
        </div>
      </header>

      {/* Bottom Mobile Tab Bar */}
      <nav
        aria-label="Mobile admin navigation"
        className="fixed bottom-0 left-0 right-0 z-nav flex items-center justify-around border-t border-mithila-border bg-mithila-card shadow-nav lg:hidden pb-[calc(env(safe-area-inset-bottom,0px))]"
      >
        {primaryLinks.map(({ to, end, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `press flex flex-1 flex-col items-center py-2 text-[11px] font-medium transition-colors ${
                isActive
                  ? 'text-mithila-primary'
                  : 'text-mithila-muted hover:text-mithila-text'
              }`
            }
          >
            <Icon aria-hidden="true" className="h-5 w-5" />
            <span className="mt-0.5">{label}</span>
          </NavLink>
        ))}

        {overflowLinks.length > 0 && (
          <button
            type="button"
            onClick={() => setShowMore(true)}
            className="press flex flex-1 flex-col items-center py-2 text-[11px] font-medium text-mithila-muted hover:text-mithila-text"
          >
            <PiDotsThreeOutlineVertical aria-hidden="true" className="h-5 w-5" />
            <span className="mt-0.5">More</span>
          </button>
        )}
      </nav>

      {/* Overflow Sheet for Mobile */}
      {showMore && (
        <div className="fixed inset-0 z-modal flex flex-col justify-end bg-black/50 lg:hidden">
          <div className="rounded-t-lg bg-mithila-card p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-mithila-border pb-3">
              <h3 className="text-body font-bold text-mithila-text">More Options</h3>
              <button
                type="button"
                onClick={() => setShowMore(false)}
                className="press rounded-pill p-1 text-mithila-muted"
              >
                <PiX aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-1">
              {overflowLinks.map(({ to, end, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setShowMore(false)}
                  className="press flex items-center gap-3 rounded-xs p-2.5 text-body text-mithila-text hover:bg-mithila-pill"
                >
                  <Icon aria-hidden="true" className="h-5 w-5 text-mithila-primary" />
                  <span>{label}</span>
                </NavLink>
              ))}
              <button
                type="button"
                onClick={() => {
                  setShowMore(false);
                  logout();
                }}
                className="press flex w-full items-center gap-3 rounded-xs p-2.5 text-body text-state-danger hover:bg-mithila-pill"
              >
                <PiSignOut aria-hidden="true" className="h-5 w-5" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function AdminApp() {
  const { isSuperAdmin, user, logout } = useAuth();

  return (
    <div className="flex h-screen flex-col bg-mithila-canvas lg:flex-row overflow-hidden">
      {/* Desktop Sidebar */}
      <AdminSidebar isSuperAdmin={isSuperAdmin} user={user} logout={logout} />

      {/* Mobile Top Header & Mobile Bottom Bar */}
      <AdminMobileNav isSuperAdmin={isSuperAdmin} user={user} logout={logout} />

      {/* Main Content Area */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-20 lg:pb-6">
        <Routes>
          {/* Index route: super admin goes to Dashboard; spoter redirects to Spots */}
          <Route
            index
            element={
              isSuperAdmin ? <AdminDashboard /> : <Navigate to="/admin/spots" replace />
            }
          />

          {/* Spots routes: accessible to spoter & super_admin */}
          <Route path="spots" element={<AdminSpots />} />
          <Route path="spots/new" element={<AdminSpotEditPage />} />
          <Route path="spots/:id" element={<AdminSpotEditPage />} />

          {/* Super admin only routes */}
          {isSuperAdmin ? (
            <>
              <Route path="submissions" element={<AdminSubmissions />} />
              <Route path="submissions/:id" element={<AdminSubmissionReviewPage />} />
              <Route path="events/*" element={<AdminEvents />} />
              <Route path="categories/*" element={<AdminCategories />} />
              <Route path="media" element={<AdminMedia />} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/admin/spots" replace />} />
          )}

          <Route path="*" element={<Navigate to="/admin/spots" replace />} />
        </Routes>
      </div>
    </div>
  );
}
