import { isValidElement } from 'react';
import Button from '@/components/ui/Button';

// Hand-drawn folk marginalia — DESIGN-SYSTEM §8.12. Strokes use currentColor (--text-tertiary), kept
// loose and slightly uneven on purpose so they read as notebook doodles, not polished vector art.
const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

function Lotus() {
  return (
    <g {...common}>
      <path d="M60 30c-9 10-12 22-1 36 11-14 8-26 1-36Z" />
      <path d="M58 68C44 62 33 50 31 37c13 1 24 9 29 22" />
      <path d="M62 68c14-6 24-18 27-31-13 1-24 9-29 22" />
      <path d="M57 69C44 70 30 64 20 52c11-4 24-2 36 9" />
      <path d="M63 69c13 1 26-5 37-17-12-4-25-1-37 9" />
      <path d="M26 79c10 6 22 9 34 9s25-3 35-9" />
      <path d="M44 94c5 3 10 4 16 4s11-1 16-4" strokeDasharray="1 5" />
    </g>
  );
}

function Compass() {
  return (
    <g {...common}>
      <circle cx="60" cy="60" r="38" />
      <circle cx="60" cy="60" r="31" strokeDasharray="2 6" />
      <path d="M60 22v7M60 91v7M22 60h7M91 60h7" />
      <path d="M76 44 66 66 44 76l10-22 22-10Z" />
      <circle cx="60" cy="60" r="2.5" />
    </g>
  );
}

function MapDoodle() {
  return (
    <g {...common}>
      <path d="M24 34 46 26l28 9 22-8v58l-22 8-28-9-22 8V34Z" />
      <path d="M46 26v58M74 35v58" strokeDasharray="1 6" />
      <path d="M60 52c-6 0-10 4-10 9 0 7 10 17 10 17s10-10 10-17c0-5-4-9-10-9Z" />
      <circle cx="60" cy="61" r="2.5" />
    </g>
  );
}

const ILLUSTRATIONS = { lotus: Lotus, compass: Compass, map: MapDoodle };

/** Centred empty state — DESIGN-SYSTEM §8.12. `action` is an optional ghost Button. */
export default function EmptyState({ illustration = 'lotus', title, description, action, className = '' }) {
  const Illustration = ILLUSTRATIONS[illustration] ?? Lotus;

  const actionContent = isValidElement(action)
    ? action
    : action?.label
      ? (() => {
          const { label, as: Component, ...rest } = action;
          return (
            <Button as={Component} variant="secondary" {...rest}>
              {label}
            </Button>
          );
        })()
      : null;

  return (
    <div className={`flex flex-col items-center justify-center px-edge py-12 text-center ${className}`}>
      <svg aria-hidden="true" viewBox="0 0 120 120" className="h-[120px] w-[120px] text-mithila-muted opacity-70">
        <Illustration />
      </svg>
      <h2 className="mt-4 text-[16px] font-semibold text-mithila-text">{title}</h2>
      {description && <p className="mt-1 max-w-xs text-[13px] text-mithila-muted">{description}</p>}
      {actionContent && <div className="mt-5">{actionContent}</div>}
    </div>
  );
}
