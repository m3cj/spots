import sharp from 'sharp';
import { HttpError } from './HttpError.js';

const ACCEPTED_FORMATS = new Set(['jpeg', 'png', 'webp']);
const MAX_SIDE = 1600;

/**
 * Decodes the upload (so a renamed non-image is rejected), applies EXIF rotation, then re-encodes to WebP.
 * Re-encoding drops all metadata, including the GPS tags phones embed in photos.
 */
export async function processImage(buffer) {
  try {
    const image = sharp(buffer, { limitInputPixels: 50_000_000, failOn: 'error' });
    const { format } = await image.metadata();
    if (!ACCEPTED_FORMATS.has(format)) {
      throw new HttpError(415, 'Use a JPEG, PNG or WebP image.', { code: 'UNSUPPORTED_IMAGE' });
    }

    const { data, info } = await image
      .rotate()
      .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });

    const thumb = await sharp(buffer, { limitInputPixels: 50_000_000, failOn: 'error' })
      .rotate()
      .resize({ width: 400, height: 400, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer({ resolveWithObject: true });

    return {
      buffer: data,
      thumbBuffer: thumb.data,
      width: info.width,
      height: info.height,
      size: info.size,
    };
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, 'That file could not be read as an image.', { code: 'INVALID_IMAGE', cause: error });
  }
}
