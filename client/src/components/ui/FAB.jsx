import { Link } from 'react-router-dom';
import { PiPlus } from 'react-icons/pi';
import { useRequireAuth } from '@/hooks/useRequireAuth';

/**
 * 56px kumkum FAB with glow — DESIGN-SYSTEM §8.5.
 * Tapping as anonymous prompts Google sign-in first (PRD §4.1, §7.8).
 * Pass `floating={false}` to unposition it (e.g. inside a sidebar column).
 */
export default function FAB({
  label = 'Suggest a spot',
  to = '/suggest',
  floating = true,
  className = '',
  as: Tag,
  onClick,
  ...rest
}) {
  const { requireAuth } = useRequireAuth();
  const Comp = Tag ?? Link;

  const handleClick = (e) => {
    if (onClick) onClick(e);
    if (e.defaultPrevented) return;

    if (!requireAuth('Sign in with Google to suggest a spot in Patna.')) {
      e.preventDefault();
    }
  };

  return (
    <Comp
      to={to}
      onClick={handleClick}
      aria-label={label}
      className={`press-fab flex h-14 w-14 items-center justify-center rounded-pill bg-mithila-primary text-white shadow-glow-red hover:bg-mithila-primaryHover active:bg-mithila-primaryActive ${
        floating
          ? 'fixed right-4 z-fab bottom-[calc(var(--bottom-nav-total)+16px)] lg:hidden'
          : ''
      } ${className}`}
      {...rest}
    >
      <PiPlus aria-hidden="true" className="h-6 w-6" />
    </Comp>
  );
}
