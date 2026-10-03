import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Route guard. Anonymous visitors get a sign-in prompt in place (PRD §7.9) rather than a redirect.
export default function RequireAuth({ roles, children }) {
  const { status, user, login } = useAuth();
  const [error, setError] = useState(null);

  if (status === 'loading') {
    return (
      <p role="status" className="px-edge py-10 text-body text-mithila-muted">
        Checking your session…
      </p>
    );
  }

  if (status === 'anonymous') {
    return (
      <section className="mx-auto max-w-content px-edge py-10">
        <h1 className="font-handwritten text-display text-mithila-text">Sign in to continue</h1>
        <p className="mt-2 text-body text-mithila-textSecondary">
          Sign in with Google to see this page.
        </p>
        {error && (
          <p role="alert" className="mt-3 text-body text-state-danger">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={() => login().catch((err) => setError(err.message))}
          className="press mt-6 inline-flex min-h-[44px] items-center justify-center rounded-pill bg-mithila-primary px-6 text-button text-mithila-onPrimary hover:bg-mithila-primaryHover active:bg-mithila-primaryActive"
        >
          Sign in with Google
        </button>
      </section>
    );
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <section className="mx-auto max-w-content px-edge py-10">
        <h1 className="font-handwritten text-display text-mithila-text">No access</h1>
        <p className="mt-2 text-body text-mithila-textSecondary">
          Your account does not have permission to open this page.
        </p>
      </section>
    );
  }

  return children;
}
