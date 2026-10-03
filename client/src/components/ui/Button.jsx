import { forwardRef } from 'react';
import { PiSpinnerGap } from 'react-icons/pi';

// DESIGN-SYSTEM §8.4. Pick one `shape` per surface — never mix pill and rounded on one screen.
const VARIANTS = {
  primary:
    'bg-mithila-primary text-mithila-onPrimary hover:bg-mithila-primaryHover active:bg-mithila-primaryActive',
  secondary: 'border border-mithila-border bg-transparent text-mithila-text hover:bg-mithila-pill',
  // Destructive buttons always carry an icon + label (pass `icon`) so colour is never the only signal.
  destructive: 'bg-state-danger text-white hover:opacity-90',
};

const SHAPES = { pill: 'rounded-pill', rounded: 'rounded-sm' };

const Button = forwardRef(function Button(
  {
    as: Component = 'button',
    variant = 'primary',
    shape = 'pill',
    icon: Icon,
    loading = false,
    disabled = false,
    type,
    className = '',
    children,
    ...rest
  },
  ref,
) {
  const isButton = Component === 'button';
  const inactive = disabled || loading;

  return (
    <Component
      ref={ref}
      type={isButton ? (type ?? 'button') : type}
      disabled={isButton ? inactive : undefined}
      aria-disabled={!isButton && inactive ? true : undefined}
      aria-busy={loading || undefined}
      className={`press inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 px-5 text-button ${SHAPES[shape]} ${VARIANTS[variant]} ${inactive ? 'pointer-events-none opacity-50' : ''} ${className}`}
      {...rest}
    >
      {loading ? (
        <PiSpinnerGap aria-hidden="true" className="h-4 w-4 motion-safe:animate-spin" />
      ) : (
        Icon && <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
      )}
      {children}
    </Component>
  );
});

export default Button;
