import { Router } from 'express';
import { listCategories } from '../db/categories.js';
import { publicLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Small, admin-managed taxonomy: returned whole rather than paginated.
router.get('/', publicLimiter, async (_req, res) => {
  res.json(await listCategories());
});

export default router;
