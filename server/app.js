import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import config from './config.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { originGuard } from './middleware/originGuard.js';
import { publicLimiter } from './middleware/rateLimit.js';
import adminRouter from './routes/admin/index.js';
import authRouter from './routes/auth.js';
import bookmarksRouter from './routes/bookmarks.js';
import categoriesRouter from './routes/categories.js';
import eventsRouter from './routes/events.js';
import spotsRouter from './routes/spots.js';
import submissionsRouter from './routes/submissions.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      // Only the configured front-end origins get CORS headers; non-browser callers send no Origin.
      origin: (origin, callback) => callback(null, !origin || config.allowedOrigins.has(origin)),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 600,
    }),
  );
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  app.use('/api', originGuard);

  app.get('/api/health', publicLimiter, (_req, res) => {
    res.json({ ok: true });
  });
  app.use('/api/auth', authRouter);
  app.use('/api/spots', spotsRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/events', eventsRouter);
  app.use('/api/bookmarks', bookmarksRouter);
  app.use('/api/submissions', submissionsRouter);
  app.use('/api/admin', adminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
