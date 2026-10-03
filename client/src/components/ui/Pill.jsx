/** Tag pill — DESIGN-SYSTEM §8.1. Shared by spot and event cards. */
export default function Pill({ children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-pill bg-mithila-pill px-2.5 py-1.5 text-tag text-mithila-muted ${className}`}
    >
      {children}
    </span>
  );
}
