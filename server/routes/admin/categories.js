import { Router } from 'express';
import {
  createCategory,
  deleteCategory,
  getCategory,
  listCategories,
  updateCategory,
} from '../../db/categories.js';
import { HttpError, notFound } from '../../utils/HttpError.js';
import { categoryCreateSchema, categoryUpdateSchema, parseId } from '../../utils/schemas.js';

const router = Router();

router.get('/', async (_req, res) => {
  res.json(await listCategories());
});

router.post('/', async (req, res) => {
  res.status(201).json(await createCategory(categoryCreateSchema.parse(req.body)));
});

router.put('/:id', async (req, res) => {
  const existing = await getCategory(parseId(req.params.id));
  if (!existing) throw notFound('Category not found.');

  if (req.body?.slug !== undefined && req.body.slug !== existing.slug) {
    throw new HttpError(400, 'A category slug cannot be changed once it is created.', { code: 'SLUG_IMMUTABLE' });
  }

  res.json(await updateCategory(existing.id, categoryUpdateSchema.parse(req.body)));
});

router.delete('/:id', async (req, res) => {
  let deleted;
  try {
    deleted = await deleteCategory(parseId(req.params.id));
  } catch (error) {
    if (error.code === 'IN_USE') {
      throw new HttpError(409, 'Spots still use this category. Move or archive them first.', { code: 'IN_USE' });
    }
    throw error;
  }

  if (!deleted) throw notFound('Category not found.');
  res.status(204).end();
});

export default router;
