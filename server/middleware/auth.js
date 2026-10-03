import { getUserById } from '../db/users.js';
import { HttpError } from '../utils/HttpError.js';
import { ACCESS_COOKIE, verifyAccessToken } from '../utils/tokens.js';

function readAccessToken(req) {
  const header = req.get('authorization');
  if (header?.startsWith('Bearer ')) return header.slice(7).trim();
  return req.cookies?.[ACCESS_COOKIE];
}

/** Sets req.auth when a valid access token is present; otherwise the request continues as anonymous. */
export function optionalAuth(req, _res, next) {
  const token = readAccessToken(req);
  if (token) {
    try {
      req.auth = { userId: verifyAccessToken(token) };
    } catch {
      // An expired or invalid token is simply not a session.
    }
  }
  next();
}

export function requireAuth(req, _res, next) {
  const token = readAccessToken(req);
  if (!token) return next(new HttpError(401, 'Please sign in.', { code: 'UNAUTHENTICATED' }));

  try {
    req.auth = { userId: verifyAccessToken(token) };
    return next();
  } catch (error) {
    const expired = error.name === 'TokenExpiredError';
    return next(
      new HttpError(401, expired ? 'Your session expired.' : 'Invalid session.', {
        code: expired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
      }),
    );
  }
}

/** Needs requireAuth first. Reads the role from the database, so a demotion applies immediately. */
export function requireRole(...roles) {
  return async (req, _res, next) => {
    req.user ??= await getUserById(req.auth.userId);
    if (!req.user) throw new HttpError(401, 'Please sign in again.', { code: 'UNAUTHENTICATED' });
    if (!roles.includes(req.user.role)) {
      throw new HttpError(403, 'You do not have access to this.', { code: 'FORBIDDEN' });
    }
    next();
  };
}
