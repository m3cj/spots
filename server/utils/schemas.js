import { z } from 'zod';
import { HttpError } from './HttpError.js';
import { clean } from './sanitize.js';

export const BEST_TIMES = ['morning', 'day', 'night', 'anytime'];
export const SPOT_STATUSES = ['active', 'draft', 'archived'];
export const EVENT_STATUSES = ['upcoming', 'ongoing', 'completed', 'cancelled'];
export const SUBMISSION_STATUSES = ['pending', 'approved', 'rejected'];

// --- building blocks -------------------------------------------------------

const blankToUndefined = (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value);
const blankToNull = (value) => (typeof value === 'string' && value.trim() === '' ? null : value);
// Number('') and Number(null) are 0, which would silently turn a missing coordinate into 0.
const numeric = (schema) => z.preprocess((value) => (value === '' || value === null ? undefined : value), schema);
const optional = (schema) => z.preprocess(blankToUndefined, schema.optional());
const nonEmptyPatch = (value) => Object.keys(value).length > 0;

const text = (max, min = 1) =>
  z
    .string({ required_error: 'Required', invalid_type_error: 'Must be text' })
    .transform(clean)
    .pipe(
      z
        .string()
        .min(min, min <= 1 ? 'Required' : `At least ${min} characters`)
        .max(max, `At most ${max} characters`),
    );

const nullableText = (max) =>
  z.preprocess(blankToNull, text(max, 0).transform((value) => value || null).nullable());

const httpUrl = (max = 2048) =>
  z
    .string()
    .trim()
    .max(max, `At most ${max} characters`)
    .refine((value) => {
      try {
        return ['http:', 'https:'].includes(new URL(value).protocol);
      } catch {
        return false;
      }
    }, 'Must be a valid http(s) URL');

const nullableUrl = (max = 2048) => z.preprocess(blankToNull, httpUrl(max).nullable());

export const slug = z
  .string()
  .trim()
  .toLowerCase()
  .min(2, 'At least 2 characters')
  .max(40, 'At most 40 characters')
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and single hyphens')
  .refine((value) => value !== 'all', '"all" is reserved');

const latitude = numeric(z.coerce.number({ invalid_type_error: 'Must be a number' }).gte(-90).lte(90));
const longitude = numeric(z.coerce.number({ invalid_type_error: 'Must be a number' }).gte(-180).lte(180));

const tag = z
  .string()
  .transform((value) => clean(value).replace(/^#+/, '').replace(/\s+/g, ' ').trim())
  .pipe(z.string().min(1, 'Empty tag').max(30, 'At most 30 characters'));

const tags = z
  .array(tag)
  .max(12, 'At most 12 tags')
  .transform((list) => {
    const seen = new Set();
    return list.filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  });

// --- ids and paging --------------------------------------------------------

const idSchema = z.coerce.number().int().positive().max(2_147_483_647);

/** Unknown or malformed ids are a 404, not a validation error. */
export function parseId(value) {
  const result = idSchema.safeParse(value);
  if (!result.success) throw new HttpError(404, 'Not found.', { code: 'NOT_FOUND' });
  return result.data;
}

const pagination = {
  page: z.coerce.number().int().min(1).max(1000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
};

export const pageQuery = z.object(pagination);

// --- public queries --------------------------------------------------------

export const spotListQuery = z.object({
  ...pagination,
  q: optional(z.string().trim().max(100)),
  category: optional(slug),
  area: optional(z.string().trim().max(80)),
  pincode: optional(z.string().trim().regex(/^\d{6}$/, 'Pincode must be 6 digits')),
  time: optional(z.enum(BEST_TIMES)),
  sort: z.preprocess(blankToUndefined, z.enum(['newest', 'popular']).default('newest')),
});

// ?status=upcoming,ongoing — defaults to what the Events tab shows first.
export const eventListQuery = z.object({
  ...pagination,
  status: z.preprocess(blankToUndefined, z.string().max(80).optional()).transform((value, ctx) => {
    if (!value) return ['upcoming', 'ongoing'];
    const list = [...new Set(value.split(',').map((item) => item.trim()).filter(Boolean))];
    if (!list.length || !list.every((item) => EVENT_STATUSES.includes(item))) {
      ctx.addIssue({ code: 'custom', message: `status must be a comma-separated list of: ${EVENT_STATUSES.join(', ')}` });
      return z.NEVER;
    }
    return list;
  }),
});

// --- auth ------------------------------------------------------------------

export const googleCodeSchema = z.object({
  code: z.string().min(10).max(2048),
  // PKCE verifier: 43–128 unreserved characters (RFC 7636).
  codeVerifier: z.string().regex(/^[A-Za-z0-9\-._~]{43,128}$/, 'Invalid code verifier'),
});

// --- submissions -----------------------------------------------------------

// Multipart bodies arrive as strings, hence the coercion in latitude/longitude.
export const submissionSchema = z.object({
  name: text(120),
  category_slug: slug,
  lat: latitude,
  lng: longitude,
  description: text(2000, 10),
  best_time_to_visit: z.enum(BEST_TIMES),
});

// --- admin: spots ----------------------------------------------------------

const spotShape = {
  name: text(120),
  category_slug: slug,
  status: z.enum(SPOT_STATUSES),
  hero_img: nullableUrl(),
  lat: latitude,
  lng: longitude,
  gmap_link: nullableUrl(),
  description: nullableText(4000),
  direction: nullableText(2000),
  tags,
  best_time_to_visit: z.enum(BEST_TIMES),
  street: nullableText(160),
  area: nullableText(80),
  pincode: z.preprocess(blankToNull, z.string().trim().regex(/^\d{6}$/, 'Pincode must be 6 digits').nullable()),
  state: text(60),
  contacts: nullableText(200),
};

export const spotCreateSchema = z.object({
  ...spotShape,
  status: spotShape.status.default('draft'),
  best_time_to_visit: spotShape.best_time_to_visit.default('anytime'),
  state: spotShape.state.default('Bihar'),
  tags: spotShape.tags.default([]),
  hero_img: spotShape.hero_img.optional(),
  gmap_link: spotShape.gmap_link.optional(),
  description: spotShape.description.optional(),
  direction: spotShape.direction.optional(),
  street: spotShape.street.optional(),
  area: spotShape.area.optional(),
  pincode: spotShape.pincode.optional(),
  contacts: spotShape.contacts.optional(),
});

export const spotUpdateSchema = z.object(spotShape).partial().refine(nonEmptyPatch, 'Nothing to update');

/** Fields an admin may adjust while approving a submission; the new spot always starts as a draft. */
export const spotOverridesSchema = z.object(spotShape).omit({ status: true }).partial();

export const spotImagesSchema = z.object({
  images: z
    .array(z.object({ image_url: httpUrl(), caption: nullableText(200).optional() }))
    .max(20, 'At most 20 gallery images'),
});

export const adminSpotListQuery = z.object({
  ...pagination,
  q: optional(z.string().trim().max(100)),
  status: optional(z.enum(SPOT_STATUSES)),
  category: optional(slug),
});

// --- admin: categories -----------------------------------------------------

const categoryShape = {
  name: text(60),
  // A React Icons component name such as FiCoffee or MdTempleHindu.
  icon: z.string().trim().regex(/^[A-Z][A-Za-z0-9]{2,59}$/, 'Use a React Icons component name, e.g. FiCoffee'),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Use a 6-digit hex colour such as #F97316')
    .transform((value) => value.toUpperCase()),
  sort_order: z.coerce.number().int().min(0).max(1000),
};

export const categoryCreateSchema = z.object({
  slug,
  ...categoryShape,
  sort_order: categoryShape.sort_order.default(0),
});

// The slug is fixed once created: spots, events and submissions all point at it.
export const categoryUpdateSchema = z.object(categoryShape).partial().refine(nonEmptyPatch, 'Nothing to update');

// --- admin: events ---------------------------------------------------------

const eventDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
  .refine((value) => new Date(`${value}T00:00:00Z`).toISOString().startsWith(value), 'Not a real date');

const startTime = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Use HH:MM (24-hour)');

// Stored as a comma-separated string, as in the schema; accepts an array too.
const categoriesCsv = z
  .union([z.string(), z.array(z.string())])
  .transform((value) => (Array.isArray(value) ? value : value.split(',')))
  .transform((list) => [...new Set(list.map((item) => item.trim().toLowerCase()).filter(Boolean))])
  .pipe(z.array(slug).max(6, 'At most 6 categories'))
  .transform((list) => list.join(','));

const eventShape = {
  title: text(160),
  spot_id: z.coerce.number().int().positive(),
  event_date: eventDate,
  start_time: startTime,
  categories: categoriesCsv,
  status: z.enum(EVENT_STATUSES),
  age_limit: z.preprocess(blankToNull, z.coerce.number().int().min(0).max(120).nullable()),
  price: z.preprocess(
    blankToNull,
    z.coerce
      .number()
      .min(0)
      .max(1_000_000)
      .transform((value) => Math.round(value * 100) / 100)
      .nullable(),
  ),
  booking_link: nullableUrl(),
  hero_img: nullableUrl(),
};

export const eventCreateSchema = z.object({
  ...eventShape,
  categories: eventShape.categories.default(''),
  status: eventShape.status.default('upcoming'),
  age_limit: eventShape.age_limit.optional(),
  price: eventShape.price.optional(),
  booking_link: eventShape.booking_link.optional(),
  hero_img: eventShape.hero_img.optional(),
});

export const eventUpdateSchema = z.object(eventShape).partial().refine(nonEmptyPatch, 'Nothing to update');

export const adminEventListQuery = z.object({
  ...pagination,
  q: optional(z.string().trim().max(100)),
  status: optional(z.enum(EVENT_STATUSES)),
});

// --- admin: submissions ----------------------------------------------------

export const adminSubmissionListQuery = z.object({
  ...pagination,
  status: z.preprocess(blankToUndefined, z.enum([...SUBMISSION_STATUSES, 'all']).default('pending')),
});

export const submissionReviewSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('rejected') }),
  z.object({ status: z.literal('approved'), spot: spotOverridesSchema.optional() }),
]);

// --- admin: media ----------------------------------------------------------

export const MEDIA_FOLDERS = ['admin', 'submissions'];

export const mediaListQuery = z.object({
  folder: z.preprocess(blankToUndefined, z.enum(MEDIA_FOLDERS).default('admin')),
  page: pagination.page,
  pageSize: z.coerce.number().int().min(1).max(60).default(24),
});

export const mediaDeleteQuery = z.object({
  path: z.string().regex(/^(admin|submissions)\/[A-Za-z0-9][A-Za-z0-9._-]{0,120}$/, 'Invalid media path'),
});
