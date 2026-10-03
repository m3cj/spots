import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

// Google redirects here with ?code=...&state=...; the code is exchanged for httpOnly cookies by the API.
export default function AuthCallbackPage() {
  const { completeLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);
  const started = useRef(false);

  useEffect(() => {
    // The authorization code is single-use; StrictMode would otherwise run this twice in development.
    if (started.current) return;
    started.current = true;

    completeLogin(searchParams)
      .then((returnTo) => navigate(returnTo, { replace: true }))
      .catch((err) => setError(err.message));
  }, [completeLogin, navigate, searchParams]);

  return (
    <section
      aria-live="polite"
      className="mx-auto flex min-h-dvh max-w-content flex-col items-center justify-center px-edge text-center"
    >
      <h1 className="font-handwritten text-display text-mithila-text">
        {error ? 'Sign-in did not finish' : 'Signing you in…'}
      </h1>
      {error && (
        <>
          <p role="alert" className="mt-2 text-body text-mithila-textSecondary">
            {error}
          </p>
          <Link
            to="/"
            replace
            className="press mt-6 inline-flex min-h-[44px] items-center justify-center rounded-pill border border-mithila-border px-6 text-button text-mithila-text"
          >
            Back to the map
          </Link>
        </>
      )}
    </section>
  );
}
