import { Router } from 'express';
import { countPendingSubmissions, createSubmission, listUserSubmissions } from '../db/submissions.js';
import { removeObject, uploadImage } from '../db/storage.js';
import { requireAuth } from '../middleware/auth.js';
import { noStore } from '../middleware/noStore.js';
import { publicLimiter, writeLimiter } from '../middleware/rateLimit.js';
import { imageUpload } from '../middleware/upload.js';
import { HttpError } from '../utils/HttpError.js';
import { processImage } from '../utils/image.js';
import { pageQuery, submissionSchema } from '../utils/schemas.js';

// Keeps the triage queue from being flooded by a single account.
const MAX_PENDING = 10;

const router = Router();
router.use(noStore);

// The signed-in user's own suggestions, for the Profile screen.
router.get('/', publicLimiter, requireAuth, async (req, res) => {
  res.json(await listUserSubmissions(req.auth.userId, pageQuery.parse(req.query)));
});

// multipart/form-data: the text fields plus one optional `image` file.
router.post('/', writeLimiter, requireAuth, imageUpload.single('image'), async (req, res) => {
  const input = submissionSchema.parse(req.body);

  if ((await countPendingSubmissions(req.auth.userId)) >= MAX_PENDING) {
    throw new HttpError(429, `You already have ${MAX_PENDING} suggestions waiting for review.`, {
      code: 'TOO_MANY_PENDING',
    });
  }

  let uploaded = null;
  if (req.file) {
    const image = await processImage(req.file.buffer);
    uploaded = await uploadImage(image.buffer, 'submissions', image.thumbBuffer);
  }

  try {
    const submission = await createSubmission(req.auth.userId, { ...input, image_url: uploaded?.url ?? null });
    res.status(201).json(submission);
  } catch (error) {
    if (uploaded) {
      await removeObject(uploaded.path).catch((cleanupError) =>
        console.warn('[submissions] orphaned upload', uploaded.path, cleanupError.message),
      );
    }
    throw error;
  }
});

export default router;
