import { createContext, useCallback, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

export const AuthPromptContext = createContext(null);

const DEFAULT_REASON = 'Sign in with Google to continue.';

/**
 * Anonymous visitors may browse but never like, bookmark or suggest (PRD §4.1). Call `requireAuth(reason)`
 * from any action handler: it returns true when signed in, otherwise opens a Google sign-in prompt and
 * returns false so the caller can stop.
 */
export function AuthPromptProvider({ children }) {
  const { isAuthenticated, login } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(DEFAULT_REASON);
  const [busy, setBusy] = useState(false);

  const requireAuth = useCallback(
    (message = DEFAULT_REASON) => {
      if (isAuthenticated) return true;
      setReason(message);
      setOpen(true);
      return false;
    },
    [isAuthenticated],
  );

  const close = useCallback(() => setOpen(false), []);

  const signIn = async () => {
    setBusy(true);
    try {
      // The prompt can open over a spot modal; come back to whatever page the visitor is on.
      await login(`${location.pathname}${location.search}`);
    } catch (error) {
      toast.error(error.message || 'Sign-in failed. Please try again.');
      setBusy(false);
    }
  };

  const value = useMemo(() => ({ requireAuth }), [requireAuth]);

  return (
    <AuthPromptContext.Provider value={value}>
      {children}
      <Modal
        open={open && !isAuthenticated}
        onClose={close}
        title="Sign in to SpotS"
        footer={
          <Button onClick={signIn} loading={busy} icon={FcGoogle} className="w-full">
            Continue with Google
          </Button>
        }
      >
        <p className="text-body text-mithila-textSecondary">{reason}</p>
        <p className="mt-3 text-caption text-mithila-muted">
          Browsing the map, spots and events never needs an account.
        </p>
      </Modal>
    </AuthPromptContext.Provider>
  );
}
