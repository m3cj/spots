import { Router } from 'express';
import {
  adminCreateEvent,
  adminDeleteEvent,
  adminGetEvent,
  adminListEvents,
  adminUpdateEvent,
} from '../../db/events.js';
import { notFound } from '../../utils/HttpError.js';
import { adminEventListQuery, eventCreateSchema, eventUpdateSchema, parseId } from '../../utils/schemas.js';

const router = Router();

router.get('/', async (req, res) => {
  res.json(await adminListEvents(adminEventListQuery.parse(req.query)));
});

router.get('/:id', async (req, res) => {
  const event = await adminGetEvent(parseId(req.params.id));
  if (!event) throw notFound('Event not found.');
  res.json(event);
});

router.post('/', async (req, res) => {
  res.status(201).json(await adminCreateEvent(eventCreateSchema.parse(req.body)));
});

router.put('/:id', async (req, res) => {
  const updated = await adminUpdateEvent(parseId(req.params.id), eventUpdateSchema.parse(req.body));
  if (!updated) throw notFound('Event not found.');
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  if (!(await adminDeleteEvent(parseId(req.params.id)))) throw notFound('Event not found.');
  res.status(204).end();
});

export default router;
