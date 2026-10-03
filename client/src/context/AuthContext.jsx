import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { exchangeGoogleCode, getCurrentUser, logoutUser } from '@/api/public';
import { consumeGoogleCallback, startGoogleLogin } from '@/utils/googleOAuth';

export const AuthContext = createContext(null);

// status: 'loading' until /auth/me answers, then 'authenticated' | 'anonymous'.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const controller = new AbortController();

    getCurrentUser({ signal: controller.signal })
      .then((current) => {
        setUser(current);
        setStatus(current ? 'authenticated' : 'anonymous');
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        // Backend unreachable: browsing still works, only signed-in features are unavailable.
        setUser(null);
        setStatus('anonymous');
      });

    return () => controller.abort();
  }, []);

  /** Sends the browser to Google. Rejects if sign-in is misconfigured so callers can show a toast. */
  const login = useCallback((returnTo) => startGoogleLogin(returnTo), []);

  /** Finishes the redirect back from Google; resolves to the path to navigate to. */
  const completeLogin = useCallback(async (searchParams) => {
    const { code, codeVerifier, returnTo } = consumeGoogleCallback(searchParams);
    const signedIn = await exchangeGoogleCode({ code, codeVerifier });
    setUser(signedIn);
    setStatus('authenticated');
    return returnTo;
  }, []);

  /** Rejects if the server could not clear the cookies, so the UI never fakes a sign-out. */
  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
    setStatus('anonymous');
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      isLoading: status === 'loading',
      isAuthenticated: status === 'authenticated',
      isStaff: user?.role === 'spoter' || user?.role === 'super_admin',
      isSuperAdmin: user?.role === 'super_admin',
      login,
      completeLogin,
      logout,
    }),
    [user, status, login, completeLogin, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
