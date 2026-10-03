import config from '../config.js';
import { HttpError } from '../utils/HttpError.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * CSRF guard for cookie auth: a browser always sends Origin on cross-site writes, so any write from an
 * origin we do not serve is refused. Requests without Origin (curl, server-to-server) cannot be forged by a browser.
 */
export function originGuard(req, _res, next) {
  if (SAFE_METHODS.has(req.method)) return next();

  const origin = req.get('origin');
  if (origin && !config.allowedOrigins.has(origin)) {
    return next(new HttpError(403, 'Origin not allowed.', { code: 'FORBIDDEN_ORIGIN' }));
  }
  return next();
}
