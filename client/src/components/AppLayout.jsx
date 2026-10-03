import { Outlet } from 'react-router-dom';
import BottomNav from '@/components/ui/BottomNav';
import Sidebar from '@/components/ui/Sidebar';

// The "Suggest a spot" FAB joins this shell with its form in Phase 4: <Sidebar><FAB /></Sidebar> plus <FAB floating />.
export default function AppLayout() {
  return (
    <>
      <Sidebar />
      <main className="min-h-dvh pb-nav-total lg:pl-sidebar">
        <Outlet />
      </main>
      <BottomNav />
    </>
  );
}
