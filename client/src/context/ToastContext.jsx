import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import Toast from '@/components/ui/Toast';

export const ToastContext = createContext(null);

const AUTO_DISMISS_MS = 3500;
// A toast that carries an action (e.g. Retry) stays long enough to be reached and used.
const ACTION_DISMISS_MS = 7000;
const MAX_VISIBLE = 3;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (type, message, options = {}) => {
      const id = nextId.current++;
      setToasts((current) =>
        [...current, { id, type, message, subtitle: options.subtitle, action: options.action }].slice(-MAX_VISIBLE),
      );
      timers.current.set(id, setTimeout(() => dismiss(id), options.action ? ACTION_DISMISS_MS : AUTO_DISMISS_MS));
      return id;
    },
    [dismiss],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const api = useMemo(
    () => ({
      show,
      dismiss,
      success: (message, options) => show('success', message, options),
      error: (message, options) => show('error', message, options),
      warning: (message, options) => show('warning', message, options),
      info: (message, options) => show('info', message, options),
    }),
    [show, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Mobile: centred, 16px above the nav, 16px edge insets. Desktop: bottom-right, 24px from the edges. */}
      <div className="pointer-events-none fixed inset-x-4 bottom-[calc(var(--bottom-nav-total)+16px)] z-toast flex flex-col gap-2 lg:inset-x-auto lg:bottom-6 lg:right-6 lg:w-[400px]">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <Toast key={toast.id} {...toast} onDismiss={() => dismiss(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
