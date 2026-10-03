import { Router } from 'express';
import { getEvent, listEvents } from '../db/events.js';
import { publicLimiter } from '../middleware/rateLimit.js';
import { notFound } from '../utils/HttpError.js';
import { eventListQuery, parseId } from '../utils/schemas.js';

const router = Router();

router.get('/', publicLimiter, async (req, res) => {
  res.json(await listEvents(eventListQuery.parse(req.query)));
});

router.get('/:id', publicLimiter, async (req, res) => {
  const event = await getEvent(parseId(req.params.id));
  if (!event) throw notFound('Event not found.');
  res.json(event);
});

export default router;
