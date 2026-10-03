export class HttpError extends Error {
  constructor(status, message, { code = 'ERROR', details, cause } = {}) {
    super(message, { cause });
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const notFound = (what = 'Not found.') => new HttpError(404, what, { code: 'NOT_FOUND' });
