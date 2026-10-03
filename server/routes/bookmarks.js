import { Router } from 'express';
import { addBookmark, listBookmarks, removeBookmark } from '../db/engagement.js';
import { requireAuth } from '../middleware/auth.js';
import { noStore } from '../middleware/noStore.js';
import { publicLimiter, writeLimiter } from '../middleware/rateLimit.js';
import { notFound } from '../utils/HttpError.js';
import { pageQuery, parseId } from '../utils/schemas.js';

const router = Router();
router.use(noStore);

router.get('/', publicLimiter, requireAuth, async (req, res) => {
  res.json(await listBookmarks(req.auth.userId, pageQuery.parse(req.query)));
});

router.post('/:spotId', writeLimiter, requireAuth, async (req, res) => {
  const saved = await addBookmark(req.auth.userId, parseId(req.params.spotId));
  if (!saved) throw notFound('Spot not found.');
  res.json({ bookmarked: true });
});

router.delete('/:spotId', writeLimiter, requireAuth, async (req, res) => {
  await removeBookmark(req.auth.userId, parseId(req.params.spotId));
  res.json({ bookmarked: false });
});

export default router;
