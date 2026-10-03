import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '@/components/ui/navItems';

/** Mobile / tablet tab bar — DESIGN-SYSTEM §5.3. Hidden on desktop, where the Sidebar takes over. */
export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-nav bg-mithila-card pb-safe shadow-nav lg:hidden"
    >
      <ul className="mx-auto flex h-nav max-w-content">
        {NAV_ITEMS.map(({ to, label, icon, activeIcon, match }) => {
          const active = match(pathname);
          const Icon = active ? activeIcon : icon;
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                aria-current={active ? 'page' : undefined}
                className={`press flex h-full min-h-[44px] flex-col items-center justify-center gap-0.5 text-[11px] font-medium leading-none ${
                  active ? 'text-mithila-primary' : 'text-mithila-muted'
                }`}
              >
                <Icon aria-hidden="true" className="h-6 w-6" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
