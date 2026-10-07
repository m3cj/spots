import { Link } from 'react-router-dom';
import {
  PiBookmarkSimple,
  PiGear,
  PiMoon,
  PiPaperPlaneTilt,
  PiSignOut,
  PiSun,
  PiUser,
} from 'react-icons/pi';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { useSeo } from '@/hooks/useSeo';
import Button from '@/components/ui/Button';

export default function ProfilePage() {
  const { user, logout, isStaff } = useAuth();
  const { isDark, toggle } = useTheme();
  const toast = useToast();
  useSeo({ title: 'Profile', description: 'Your SpotS profile — bookmarks, submissions, and settings.' });

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      toast.error("Couldn't sign out", { subtitle: 'Check your connection and try again.' });
    }
  };

  return (
    <div className="min-h-full bg-mithila-canvas">
      <div className="border-b border-mithila-border px-edge py-4">
        <div className="mx-auto max-w-screen-xl">
          <h1 className="font-handwritten text-display text-mithila-text">Profile</h1>
        </div>
      </div>

      <main className="mx-auto max-w-screen-xl space-y-6 px-edge py-6">
        {/* User card */}
        <section className="flex items-center gap-4 rounded-md border border-mithila-border bg-mithila-card px-5 py-4 shadow-sm">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt=""
              referrerPolicy="no-referrer"
              className="h-14 w-14 rounded-pill object-cover"
            />
          ) : (
            <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-mithila-pill text-mithila-muted">
              <PiUser aria-hidden="true" className="h-7 w-7" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-body font-bold text-mithila-text">
              {user?.name ?? 'Anonymous'}
            </p>
            <p className="truncate text-caption text-mithila-muted">{user?.email}</p>
            {isStaff && (
              <span className="mt-1 inline-block rounded-pill bg-mithila-primary px-2.5 py-0.5 text-tag text-white font-medium">
                {user?.role === 'super_admin' ? 'Super Admin' : 'Curator / Spoter'}
              </span>
            )}
          </div>
        </section>

        {/* Navigation menu actions */}
        <section className="grid gap-2">
          <Link
            to="/profile/bookmarks"
            className="press flex items-center gap-3 rounded-md border border-mithila-border bg-mithila-card px-4 py-3.5 shadow-sm hover:border-mithila-primary/50"
          >
            <PiBookmarkSimple aria-hidden="true" className="h-5 w-5 text-mithila-primary" />
            <span className="flex-1 text-body font-medium text-mithila-text">Saved spots</span>
            <span aria-hidden="true" className="text-mithila-muted">›</span>
          </Link>

          <Link
            to="/profile/submissions"
            className="press flex items-center gap-3 rounded-md border border-mithila-border bg-mithila-card px-4 py-3.5 shadow-sm hover:border-mithila-primary/50"
          >
            <PiPaperPlaneTilt aria-hidden="true" className="h-5 w-5 text-mithila-primary" />
            <span className="flex-1 text-body font-medium text-mithila-text">My submissions</span>
            <span aria-hidden="true" className="text-mithila-muted">›</span>
          </Link>

          {isStaff && (
            <Link
              to="/admin"
              className="press flex items-center gap-3 rounded-md border border-mithila-border bg-mithila-card px-4 py-3.5 shadow-sm hover:border-mithila-primary/50"
            >
              <PiGear aria-hidden="true" className="h-5 w-5 text-mithila-primary" />
              <span className="flex-1 text-body font-medium text-mithila-text">Admin Console</span>
              <span aria-hidden="true" className="text-mithila-muted">›</span>
            </Link>
          )}

          <button
            type="button"
            id="profile-theme-toggle"
            onClick={toggle}
            className="press flex items-center gap-3 rounded-md border border-mithila-border bg-mithila-card px-4 py-3.5 shadow-sm text-left hover:border-mithila-primary/50"
          >
            {isDark ? (
              <PiSun aria-hidden="true" className="h-5 w-5 text-mithila-secondary" />
            ) : (
              <PiMoon aria-hidden="true" className="h-5 w-5 text-mithila-textSecondary" />
            )}
            <span className="flex-1 text-body font-medium text-mithila-text">
              {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            </span>
          </button>
        </section>

        {/* Sign out */}
        <div className="pt-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
          <Button
            id="profile-sign-out"
            variant="destructive"
            onClick={handleLogout}
            className="w-full"
          >
            <PiSignOut aria-hidden="true" className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </main>
    </div>
  );
}
