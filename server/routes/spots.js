import { Router } from 'express';
import { likeSpot, unlikeSpot } from '../db/engagement.js';
import { bumpViews, getHotSpots, getSpotDetail, getSpotFacets, getViewerState, listSpots } from '../db/spots.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { noStore } from '../middleware/noStore.js';
import { publicLimiter, writeLimiter } from '../middleware/rateLimit.js';
import { notFound } from '../utils/HttpError.js';
import { parseId, spotListQuery } from '../utils/schemas.js';

const router = Router();

router.get('/', publicLimiter, async (req, res) => {
  res.json(await listSpots(spotListQuery.parse(req.query)));
});

// Static segments must stay above /:id.
router.get('/hotspots', publicLimiter, async (_req, res) => {
  res.json(await getHotSpots());
});

router.get('/facets', publicLimiter, async (_req, res) => {
  res.json(await getSpotFacets());
});

router.get('/:id', publicLimiter, optionalAuth, async (req, res) => {
  const id = parseId(req.params.id);
  const spot = await getSpotDetail(id);
  if (!spot) throw notFound('Spot not found.');

  const [views, viewer] = await Promise.all([
    bumpViews(id),
    req.auth ? getViewerState(req.auth.userId, id) : { liked: false, bookmarked: false },
  ]);

  // Carries per-user state, so it must not sit in a shared cache.
  res.set('Cache-Control', 'private, no-store');
  res.json({ ...spot, views: views ?? spot.views, viewer });
});

router.post('/:id/like', noStore, writeLimiter, requireAuth, async (req, res) => {
  const result = await likeSpot(req.auth.userId, parseId(req.params.id));
  if (!result) throw notFound('Spot not found.');
  res.json(result);
});

router.delete('/:id/like', noStore, writeLimiter, requireAuth, async (req, res) => {
  const result = await unlikeSpot(req.auth.userId, parseId(req.params.id));
  if (!result) throw notFound('Spot not found.');
  res.json(result);
});

export default router;
