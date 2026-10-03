import { Router } from 'express';
import {
  adminCreateSpot,
  adminDeleteSpot,
  adminGetSpot,
  adminListSpots,
  adminUpdateSpot,
  replaceSpotImages,
} from '../../db/spots.js';
import { HttpError, notFound } from '../../utils/HttpError.js';
import {
  adminSpotListQuery,
  parseId,
  spotCreateSchema,
  spotImagesSchema,
  spotUpdateSchema,
} from '../../utils/schemas.js';

const router = Router();

const isSuperAdmin = (req) => req.user.role === 'super_admin';

async function loadAccessibleSpot(req) {
  const spot = await adminGetSpot(parseId(req.params.id));
  // Spoters only ever see their own spots; anything else looks like it does not exist.
  if (!spot || (!isSuperAdmin(req) && spot.created_by !== req.user.id)) throw notFound('Spot not found.');
  return spot;
}

// Quality gate: nothing reaches the public feed without a hero image and a description. It applies when a spot
// is being published or its hero/description change, so unrelated edits to a live spot are never blocked.
function assertPublishable(next, patch, previous = null) {
  if (next.status !== 'active') return;

  const affected = previous?.status !== 'active' || 'hero_img' in patch || 'description' in patch;
  if (affected && (!next.hero_img || !next.description)) {
    throw new HttpError(400, 'A published spot needs a hero image and a description.', { code: 'NOT_PUBLISHABLE' });
  }
}

router.get('/', async (req, res) => {
  const query = adminSpotListQuery.parse(req.query);
  res.json(await adminListSpots({ ...query, ownerId: isSuperAdmin(req) ? undefined : req.user.id }));
});

router.get('/:id', async (req, res) => {
  res.json(await loadAccessibleSpot(req));
});

router.post('/', async (req, res) => {
  const input = spotCreateSchema.parse(req.body);
  assertPublishable(input, input);
  res.status(201).json(await adminCreateSpot({ ...input, created_by: req.user.id }));
});

router.put('/:id', async (req, res) => {
  const existing = await loadAccessibleSpot(req);
  const patch = spotUpdateSchema.parse(req.body);
  assertPublishable({ ...existing, ...patch }, patch, existing);
  res.json(await adminUpdateSpot(existing.id, patch));
});

router.delete('/:id', async (req, res) => {
  const existing = await loadAccessibleSpot(req);
  try {
    await adminDeleteSpot(existing.id);
  } catch (error) {
    if (error.code === 'IN_USE') {
      throw new HttpError(409, 'Events are scheduled at this spot. Remove them first, or archive the spot instead.', {
        code: 'IN_USE',
      });
    }
    throw error;
  }
  res.status(204).end();
});

// Replaces the gallery; the array order becomes the display order.
router.put('/:id/images', async (req, res) => {
  const existing = await loadAccessibleSpot(req);
  const { images } = spotImagesSchema.parse(req.body);
  res.json(await replaceSpotImages(existing.id, images));
});

export default router;
