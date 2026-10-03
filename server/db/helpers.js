import { HttpError } from '../utils/HttpError.js';

/** Maps a Supabase/PostgREST error to an HttpError. SQL details stay in the server log. */
export function dbError(error) {
  switch (error.code) {
    case '23505':
      return new HttpError(409, 'That already exists.', { code: 'CONFLICT', cause: error });
    // RESTRICT foreign keys raise 23001; NO ACTION ones raise 23503.
    case '23001':
      return new HttpError(409, 'This item is still in use and cannot be removed.', { code: 'IN_USE', cause: error });
    case '23503':
      if (/is not present/i.test(error.details ?? '')) {
        const message = /category_slug/.test(error.details) ? 'That category does not exist.' : 'A referenced item does not exist.';
        return new HttpError(400, message, { code: 'INVALID_REFERENCE', cause: error });
      }
      return new HttpError(409, 'This item is still in use and cannot be removed.', { code: 'IN_USE', cause: error });
    case '22P02':
    case '22003':
    case '23502':
    case '23514':
      return new HttpError(400, 'One of the values is not valid.', { code: 'VALIDATION_ERROR', cause: error });
    default:
      if (/fetch failed|network|ECONNREFUSED|ENOTFOUND/i.test(error.message ?? '')) {
        return new HttpError(503, 'The database is unreachable right now.', { code: 'UPSTREAM_UNAVAILABLE', cause: error });
      }
      return new HttpError(500, 'Something went wrong.', { code: 'INTERNAL_ERROR', cause: error });
  }
}

/** Returns { data, count } from a supabase-js response, throwing the mapped error if it failed. */
export function unwrap(result) {
  if (result.error) throw dbError(result.error);
  return result;
}

export const rangeFor = ({ page, pageSize }) => ({ from: (page - 1) * pageSize, to: page * pageSize - 1 });

export const pageOf = (items, total, { page, pageSize }) => ({
  items,
  page,
  pageSize,
  total,
  hasMore: page * pageSize < total,
});

/** Escapes LIKE wildcards so user input is matched literally. */
export const escapeLike = (value) => value.replace(/[\\%_]/g, (char) => `\\${char}`);
