import { PiMapTrifold } from 'react-icons/pi';

/** Shown in place of a map when the Google Maps key is missing or the API fails to load. */
export default function MapUnavailable({ className = '', children }) {
  return (
    <div
      role="status"
      className={`flex flex-col items-center justify-center gap-2 rounded-md bg-mithila-pill px-edge py-8 text-center ${className}`}
    >
      <PiMapTrifold aria-hidden="true" className="h-10 w-10 text-mithila-muted" />
      <p className="text-[16px] font-semibold text-mithila-text">Map unavailable</p>
      <p className="max-w-xs text-[13px] text-mithila-muted">The map couldn’t be loaded right now.</p>
      {children}
    </div>
  );
}
