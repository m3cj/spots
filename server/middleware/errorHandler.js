import multer from 'multer';
import { ZodError } from 'zod';
import { HttpError } from '../utils/HttpError.js';

export function notFoundHandler(_req, _res, next) {
  next(new HttpError(404, 'Not found.', { code: 'NOT_FOUND' }));
}

function normalize(error) {
  if (error instanceof HttpError) return error;

  if (error instanceof ZodError) {
    return new HttpError(400, 'Please check the highlighted fields.', {
      code: 'VALIDATION_ERROR',
      details: error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
    });
  }

  if (error instanceof multer.MulterError) {
    return error.code === 'LIMIT_FILE_SIZE'
      ? new HttpError(413, 'That image is larger than 5 MB.', { code: 'FILE_TOO_LARGE' })
      : new HttpError(400, 'The upload could not be read.', { code: 'INVALID_UPLOAD' });
  }

  if (error?.type === 'entity.parse.failed') {
    return new HttpError(400, 'The request body is not valid JSON.', { code: 'INVALID_JSON' });
  }
  if (error?.type === 'entity.too.large') {
    return new HttpError(413, 'The request body is too large.', { code: 'PAYLOAD_TOO_LARGE' });
  }

  return new HttpError(500, 'Something went wrong.', { code: 'INTERNAL_ERROR', cause: error });
}

// Every failure leaves as { error: { message, code, details? } }; internals only reach the server log.
export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  const failure = normalize(error);
  if (failure.status >= 500) console.error(`[${req.method} ${req.originalUrl}]`, failure.cause ?? failure);

  return res.status(failure.status).json({
    error: {
      message: failure.message,
      code: failure.code,
      ...(failure.details ? { details: failure.details } : {}),
    },
  });
}
