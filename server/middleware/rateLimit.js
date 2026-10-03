import rateLimit from 'express-rate-limit';

// PRD §5.3, per IP per minute. Each limiter keeps its own counter.
const limiter = (limit, message) =>
  rateLimit({
    windowMs: 60_000,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: { message, code: 'RATE_LIMITED' } },
  });

export const publicLimiter = limiter(100, 'Too many requests. Please slow down.');
export const writeLimiter = limiter(10, 'You are doing that too often. Please wait a minute.');
export const authLimiter = limiter(5, 'Too many sign-in attempts. Please wait a minute.');
export const adminLimiter = limiter(50, 'Too many admin requests. Please slow down.');
