import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import config from '../config.js';

const ISSUER = 'spots-api';
const AUDIENCE = 'spots-web';

export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';
// The refresh token is only ever sent to the auth routes.
const REFRESH_COOKIE_PATH = '/api/auth';

const ACCESS_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const REFRESH_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function sign(type, secret, maxAgeMs, userId) {
  return jwt.sign({ type, jti: randomUUID() }, secret, {
    algorithm: 'HS256',
    subject: String(userId),
    issuer: ISSUER,
    audience: AUDIENCE,
    expiresIn: Math.floor(maxAgeMs / 1000),
  });
}

function verify(type, token, secret) {
  const payload = jwt.verify(token, secret, { algorithms: ['HS256'], issuer: ISSUER, audience: AUDIENCE });
  const userId = Number(payload.sub);
  if (payload.type !== type || !Number.isInteger(userId) || userId < 1) {
    throw new jwt.JsonWebTokenError('unexpected token type');
  }
  return userId;
}

export const verifyAccessToken = (token) => verify('access', token, config.jwt.accessSecret);
export const verifyRefreshToken = (token) => verify('refresh', token, config.jwt.refreshSecret);

const cookieBase = {
  httpOnly: true,
  secure: config.cookieSecure,
  sameSite: config.cookieSameSite,
};

/** Issues a fresh access + refresh pair; calling it on every refresh is what rotates the refresh token. */
export function setSessionCookies(res, userId) {
  res.cookie(ACCESS_COOKIE, sign('access', config.jwt.accessSecret, ACCESS_MAX_AGE_MS, userId), {
    ...cookieBase,
    path: '/',
    maxAge: ACCESS_MAX_AGE_MS,
  });
  res.cookie(REFRESH_COOKIE, sign('refresh', config.jwt.refreshSecret, REFRESH_MAX_AGE_MS, userId), {
    ...cookieBase,
    path: REFRESH_COOKIE_PATH,
    maxAge: REFRESH_MAX_AGE_MS,
  });
}

export function clearSessionCookies(res) {
  res.clearCookie(ACCESS_COOKIE, { ...cookieBase, path: '/' });
  res.clearCookie(REFRESH_COOKIE, { ...cookieBase, path: REFRESH_COOKIE_PATH });
}
