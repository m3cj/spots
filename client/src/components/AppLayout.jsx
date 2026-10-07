import { useLocation } from 'react-router-dom';
import BottomNav from '@/components/ui/BottomNav';
import FAB from '@/components/ui/FAB';
import Sidebar from '@/components/ui/Sidebar';
import { Outlet } from 'react-router-dom';

// Hide the FAB on routes that have their own primary CTA (admin, suggest form itself, auth callback).
const FAB_HIDDEN_ROUTES = ['/admin', '/suggest', '/auth'];

export default function AppLayout() {
  const { pathname } = useLocation();
  const hideFab = FAB_HIDDEN_ROUTES.some((prefix) => pathname.startsWith(prefix));

  return (
    <>
      <Sidebar>{!hideFab && <FAB floating={false} />}</Sidebar>
      <main className="min-h-dvh pb-nav-total lg:pl-sidebar">
        <Outlet />
      </main>
      <BottomNav />
      {!hideFab && <FAB />}
    </>
  );
}
