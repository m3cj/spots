import { PiPlus } from 'react-icons/pi';

/**
 * 56px kumkum FAB with glow — DESIGN-SYSTEM §8.5. Unpositioned by default so it can sit in the
 * Sidebar; pass `floating` for the fixed mobile placement (16px from the right, 16px above the nav).
 */
export default function FAB({ label = 'Suggest a spot', floating = false, className = '', ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`press-fab flex h-14 w-14 items-center justify-center rounded-pill bg-mithila-primary text-white shadow-glow-red hover:bg-mithila-primaryHover active:bg-mithila-primaryActive ${
        floating
          ? 'fixed right-4 z-fab bottom-[calc(var(--bottom-nav-total)+16px)] lg:hidden'
          : ''
      } ${className}`}
      {...rest}
    >
      <PiPlus aria-hidden="true" className="h-6 w-6" />
    </button>
  );
}
