import { Router } from 'express';
import { getDashboardStats } from '../../db/stats.js';

const router = Router();

router.get('/', async (_req, res) => {
  res.json(await getDashboardStats());
});

export default router;
