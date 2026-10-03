import { randomUUID } from 'node:crypto';
import config from '../config.js';
import { HttpError } from '../utils/HttpError.js';
import { supabase } from './supabase.js';
import { unwrap } from './helpers.js';

const bucket = config.supabase.bucket;
const MAX_BYTES = 5 * 1024 * 1024;

let bucketReady = null;

/** Creates the public media bucket on first use, so setup needs no manual dashboard step. */
function ensureBucket() {
  bucketReady ??= (async () => {
    const existing = await supabase.storage.getBucket(bucket);
    if (existing.data) return;

    const created = await supabase.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: MAX_BYTES,
      allowedMimeTypes: ['image/webp', 'image/jpeg', 'image/png'],
    });
    if (created.error && !/already exists/i.test(created.error.message)) throw created.error;
  })().catch((error) => {
    bucketReady = null;
    throw new HttpError(502, 'Image storage is unavailable.', { code: 'STORAGE_ERROR', cause: error });
  });
  return bucketReady;
}

export const publicUrl = (path) => supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;

/** Stores a processed WebP under folder/ and resolves to { path, url }. */
export async function uploadImage(buffer, folder) {
  await ensureBucket();

  const path = `${folder}/${randomUUID()}.webp`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, { contentType: 'image/webp', cacheControl: '31536000', upsert: false });
  if (error) throw new HttpError(502, 'Could not store the image.', { code: 'STORAGE_ERROR', cause: error });

  return { path, url: publicUrl(path) };
}

export async function removeObject(path) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw new HttpError(502, 'Could not remove the image.', { code: 'STORAGE_ERROR', cause: error });
}

/** One page of a folder, newest first. Storage has no total count, so one extra row signals hasMore. */
export async function listObjects(folder, { page, pageSize }) {
  await ensureBucket();

  const { data, error } = await supabase.storage.from(bucket).list(folder, {
    limit: pageSize + 1,
    offset: (page - 1) * pageSize,
    sortBy: { column: 'created_at', order: 'desc' },
  });
  if (error) throw new HttpError(502, 'Could not list images.', { code: 'STORAGE_ERROR', cause: error });

  const files = data.filter((entry) => entry.id && !entry.name.startsWith('.'));
  const items = files.slice(0, pageSize).map((entry) => {
    const path = `${folder}/${entry.name}`;
    return {
      name: entry.name,
      path,
      url: publicUrl(path),
      size: entry.metadata?.size ?? null,
      mime: entry.metadata?.mimetype ?? null,
      created_at: entry.created_at,
    };
  });

  return { items, page, pageSize, hasMore: files.length > pageSize };
}

/** Where an uploaded image is still referenced; deleting it while in use would leave broken images. */
export async function countMediaUsage(url) {
  const count = async (table, column) =>
    unwrap(await supabase.from(table).select('id', { count: 'exact', head: true }).eq(column, url)).count ?? 0;

  const [spots, gallery, events, submissions] = await Promise.all([
    count('spots', 'hero_img'),
    count('spot_images', 'image_url'),
    count('events', 'hero_img'),
    count('spot_submissions', 'image_url'),
  ]);
  return { spots, gallery, events, submissions, total: spots + gallery + events + submissions };
}
