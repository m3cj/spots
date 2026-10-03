import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ quiet: true });

const schema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    // Comma-separated browser origins allowed to call the API (the Vercel site in production).
    CLIENT_ORIGIN: z.string().optional(),
    // Proxy hops in front of the app, so rate limiting sees the real client IP. Defaults to 1 in production.
    TRUST_PROXY: z.coerce.number().int().min(0).optional(),
    COOKIE_SAMESITE: z.enum(['lax', 'strict', 'none']).default('lax'),

    SUPABASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
    SUPABASE_STORAGE_BUCKET: z.string().min(3).default('spots-media'),

    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    GOOGLE_REDIRECT_URI: z.string().url().default('http://localhost:5173/auth/callback'),

    JWT_ACCESS_SECRET: z.string().min(32, 'must be at least 32 characters'),
    JWT_REFRESH_SECRET: z.string().min(32, 'must be at least 32 characters'),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === 'production' && !env.CLIENT_ORIGIN) {
      ctx.addIssue({ code: 'custom', path: ['CLIENT_ORIGIN'], message: 'is required in production' });
    }
    if (env.JWT_ACCESS_SECRET === env.JWT_REFRESH_SECRET) {
      ctx.addIssue({ code: 'custom', path: ['JWT_REFRESH_SECRET'], message: 'must differ from JWT_ACCESS_SECRET' });
    }
  });

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const problems = parsed.error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`);
  console.error(`Invalid server configuration (see server/.env.example):\n${problems.join('\n')}`);
  process.exit(1);
}

const env = parsed.data;

const origins = (env.CLIENT_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

export default {
  isProd: env.NODE_ENV === 'production',
  port: env.PORT,
  allowedOrigins: new Set(origins),
  trustProxy: env.TRUST_PROXY ?? (env.NODE_ENV === 'production' ? 1 : 0),
  cookieSameSite: env.COOKIE_SAMESITE,
  // Browsers reject SameSite=None cookies that are not Secure.
  cookieSecure: env.NODE_ENV === 'production' || env.COOKIE_SAMESITE === 'none',
  supabase: {
    url: env.SUPABASE_URL,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    bucket: env.SUPABASE_STORAGE_BUCKET,
  },
  google: {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    redirectUri: env.GOOGLE_REDIRECT_URI,
  },
  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
  },
};
