// Browser half of the Google OAuth 2.0 authorization-code flow (PRD §5.2) with PKCE.
// Only the one-time `state`, PKCE verifier and return path sit in sessionStorage — never a token.

const AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const SESSION_KEY = 'spots-oauth';

export const CALLBACK_PATH = '/auth/callback';

const toBase64Url = (bytes) =>
  btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');

const randomToken = (byteLength) => toBase64Url(crypto.getRandomValues(new Uint8Array(byteLength)));

// Only same-origin paths may be used as a post-login destination.
const safePath = (path) => (typeof path === 'string' && /^\/(?![/\\])/.test(path) ? path : '/');

export async function startGoogleLogin(returnTo = `${window.location.pathname}${window.location.search}`) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error('Google sign-in is not configured (set VITE_GOOGLE_CLIENT_ID).');
  if (!window.crypto?.subtle) throw new Error('Sign-in needs a secure (HTTPS) connection.');

  const state = randomToken(16);
  const codeVerifier = randomToken(32);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier));

  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ state, codeVerifier, returnTo: safePath(returnTo) }),
  );

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${window.location.origin}${CALLBACK_PATH}`,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    code_challenge: toBase64Url(new Uint8Array(digest)),
    code_challenge_method: 'S256',
    prompt: 'select_account',
  });

  window.location.assign(`${AUTHORIZE_URL}?${params}`);
}

/** Validates the redirect from Google. Single use: the stored session is removed on read. */
export function consumeGoogleCallback(searchParams) {
  let saved = null;
  try {
    saved = JSON.parse(sessionStorage.getItem(SESSION_KEY));
  } catch {
    // Treated as a missing session below.
  }
  sessionStorage.removeItem(SESSION_KEY);

  if (!saved) throw new Error('Your sign-in session expired. Please try again.');

  const error = searchParams.get('error');
  if (error) {
    throw new Error(error === 'access_denied' ? 'Sign-in was cancelled.' : 'Google sign-in failed.');
  }
  if (searchParams.get('state') !== saved.state) {
    throw new Error('Sign-in could not be verified. Please try again.');
  }

  const code = searchParams.get('code');
  if (!code) throw new Error('Google did not return an authorization code.');

  return { code, codeVerifier: saved.codeVerifier, returnTo: safePath(saved.returnTo) };
}
