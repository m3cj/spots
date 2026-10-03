/** Personal and admin responses must never sit in a shared cache. */
export function noStore(_req, res, next) {
  res.set('Cache-Control', 'no-store');
  next();
}
