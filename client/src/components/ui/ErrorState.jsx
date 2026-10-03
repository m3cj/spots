import { PiWarning, PiWifiSlash } from 'react-icons/pi';
import Button from '@/components/ui/Button';

/**
 * Centred error state — DESIGN-SYSTEM §8.13. Pass the caught `error` and the component picks the
 * WifiSlash or Warning treatment (ApiError.unreachable marks connectivity failures); `onRetry` shows the
 * primary "Retry" button.
 */
export default function ErrorState({ error, title, description, onRetry, className = '' }) {
  const offline = Boolean(error?.unreachable);
  const Icon = offline ? PiWifiSlash : PiWarning;

  const heading = title ?? (offline ? 'Connection issue' : 'Something went wrong');
  const detail =
    description ??
    (offline ? 'Check your internet connection and try again.' : error?.message || 'Please try again in a moment.');

  return (
    <div role="alert" className={`flex flex-col items-center justify-center px-edge py-12 text-center ${className}`}>
      <Icon aria-hidden="true" className="h-12 w-12 text-state-danger" />
      <h2 className="mt-4 text-[16px] font-semibold text-mithila-text">{heading}</h2>
      <p className="mt-1 max-w-xs text-[13px] text-mithila-muted">{detail}</p>
      {onRetry && (
        <Button onClick={onRetry} className="mt-5">
          Retry
        </Button>
      )}
    </div>
  );
}
