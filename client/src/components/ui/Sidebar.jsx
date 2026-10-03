import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '@/components/ui/navItems';

/**
 * Desktop navigation — DESIGN-SYSTEM §5.4. Logo, then the four destinations, then `children`
 * pinned to the bottom (the FAB lives there on desktop, §8.5).
 */
export default function Sidebar({ children }) {
  const { pathname } = useLocation();

  return (
    <aside className="fixed inset-y-0 left-0 z-nav hidden w-sidebar flex-col border-r border-mithila-border bg-mithila-card shadow-md lg:flex">
      <Link
        to="/"
        className="press mx-4 mb-4 mt-6 inline-flex min-h-[44px] items-center text-[22px] font-bold leading-none text-mithila-primary"
      >
        SpotS
      </Link>

      <nav aria-label="Primary" className="flex-1 px-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ to, label, icon, activeIcon, match }) => {
            const active = match(pathname);
            const Icon = active ? activeIcon : icon;
            return (
              <li key={to}>
                <Link
                  to={to}
                  aria-current={active ? 'page' : undefined}
                  className={`press flex min-h-[44px] items-center gap-3 rounded-sm px-3 text-[14px] font-medium ${
                    active
                      ? 'bg-mithila-pill text-mithila-primary'
                      : 'text-mithila-textSecondary hover:bg-mithila-pill hover:text-mithila-text'
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

      {children && <div className="flex justify-center pb-4">{children}</div>}
    </aside>
  );
}
