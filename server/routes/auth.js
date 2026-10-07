import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import config from '../config.js';
import { getUserById, upsertGoogleUser } from '../db/users.js';
import { optionalAuth } from '../middleware/auth.js';
import { noStore } from '../middleware/noStore.js';
import { authLimiter, publicLimiter } from '../middleware/rateLimit.js';
import { HttpError } from '../utils/HttpError.js';
import { clean } from '../utils/sanitize.js';
import { googleCodeSchema } from '../utils/schemas.js';
import { REFRESH_COOKIE, clearSessionCookies, setSessionCookies, verifyRefreshToken } from '../utils/tokens.js';

const router = Router();
router.use(noStore);

const oauth = new OAuth2Client({
  clientId: config.google.clientId,
  clientSecret: config.google.clientSecret,
  redirectUri: config.google.redirectUri,
});

async function fetchGoogleProfile(code, codeVerifier) {
  const { tokens } = await oauth.getToken({ code, codeVerifier });
  if (!tokens.id_token) throw new Error('Google returned no id_token');

  const ticket = await oauth.verifyIdToken({ idToken: tokens.id_token, audience: config.google.clientId });
  const profile = ticket.getPayload();
  if (!profile?.sub || !profile.email || !profile.email_verified) {
    throw new Error('Google account has no verified email');
  }
  return profile;
}

const sessionExpired = () =>
  new HttpError(401, 'Your session expired. Please sign in again.', { code: 'SESSION_EXPIRED' });

// Exchanges the authorization code for a Google identity, then starts a cookie session.
router.post('/google', authLimiter, async (req, res) => {
  const { code, codeVerifier } = googleCodeSchema.parse(req.body);

  let profile;
  try {
    profile = await fetchGoogleProfile(code, codeVerifier);
  } catch (error) {
    console.warn('[auth] Google code exchange failed:', error.message);
    throw new HttpError(401, 'Google sign-in failed. Please try again.', { code: 'GOOGLE_AUTH_FAILED' });
  }

  let user;
  try {
    user = await upsertGoogleUser({
      googleId: profile.sub,
      displayName: clean(profile.name || profile.email.split('@')[0]).slice(0, 120) || 'Explorer',
      email: profile.email.toLowerCase(),
      avatarUrl: profile.picture?.startsWith('https://') ? profile.picture : null,
    });
  } catch (error) {
    if (error.code === 'CONFLICT') {
      throw new HttpError(409, 'That email is already linked to a different Google account.', { code: 'EMAIL_IN_USE' });
    }
    throw error;
  }

  setSessionCookies(res, user.id);
  res.json(user);
});

// Rotates both cookies. Tokens are stateless, so an old refresh token stays valid until it expires.
router.post('/refresh', authLimiter, async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw new HttpError(401, 'Not signed in.', { code: 'NO_SESSION' });

  let userId;
  try {
    userId = verifyRefreshToken(token);
  } catch {
    clearSessionCookies(res);
    throw sessionExpired();
  }

  const user = await getUserById(userId);
  if (!user) {
    clearSessionCookies(res);
    throw sessionExpired();
  }

  setSessionCookies(res, user.id);
  res.json(user);
});

router.post('/logout', authLimiter, (_req, res) => {
  clearSessionCookies(res);
  res.status(204).end();
});

router.get('/me', publicLimiter, optionalAuth, async (req, res) => {
  if (!req.auth) {
    // The refresh cookie is only sent to /api/auth/*, which is how the client learns whether a refresh is worth trying.
    const refreshable = Boolean(req.cookies?.[REFRESH_COOKIE]);
    throw new HttpError(401, 'Not signed in.', { code: refreshable ? 'TOKEN_EXPIRED' : 'NO_SESSION' });
  }

  const user = await getUserById(req.auth.userId);
  if (!user) {
    clearSessionCookies(res);
    throw new HttpError(401, 'Not signed in.', { code: 'NO_SESSION' });
  }
  res.json(user);
});

if (!config.isProd) {
  router.post('/dev-login', async (_req, res) => {
    const user = await getUserById(1);
    if (!user) throw new HttpError(404, 'No dev user found');
    setSessionCookies(res, user.id);
    res.json(user);
  });
}

export default router;
