import { Router } from 'express';
import { countMediaUsage, listObjects, publicUrl, removeObject } from '../../db/storage.js';
import { HttpError } from '../../utils/HttpError.js';
import { mediaDeleteQuery, mediaListQuery } from '../../utils/schemas.js';

const router = Router();

router.get('/', async (req, res) => {
  const { folder, page, pageSize } = mediaListQuery.parse(req.query);
  res.json(await listObjects(folder, { page, pageSize }));
});

// Refuses to delete an image that a spot, event or suggestion still points at.
router.delete('/', async (req, res) => {
  const { path } = mediaDeleteQuery.parse(req.query);

  const usage = await countMediaUsage(publicUrl(path));
  if (usage.total > 0) {
    throw new HttpError(409, 'This image is still used by a spot, event or suggestion.', {
      code: 'IN_USE',
      details: usage,
    });
  }

  await removeObject(path);
  res.status(204).end();
});

export default router;
