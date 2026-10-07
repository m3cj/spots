import { Router } from 'express';
import { adminCreateSpot } from '../../db/spots.js';
import {
  adminGetSubmission,
  adminListSubmissions,
  adminUpdateSubmission,
  restorePendingSubmission,
  transitionSubmission,
} from '../../db/submissions.js';
import { HttpError, notFound } from '../../utils/HttpError.js';
import {
  adminSubmissionListQuery,
  parseId,
  spotCreateSchema,
  submissionReviewSchema,
  submissionSchema,
} from '../../utils/schemas.js';

const router = Router();

const alreadyReviewed = () =>
  new HttpError(409, 'This suggestion has already been reviewed.', { code: 'ALREADY_REVIEWED' });

router.get('/', async (req, res) => {
  res.json(await adminListSubmissions(adminSubmissionListQuery.parse(req.query)));
});

router.get('/:id', async (req, res) => {
  const submission = await adminGetSubmission(parseId(req.params.id));
  if (!submission) throw notFound('Suggestion not found.');
  res.json(submission);
});

// Edit submission details while in triage
router.patch('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  const submission = await adminGetSubmission(id);
  if (!submission) throw notFound('Suggestion not found.');
  if (submission.status !== 'pending') throw alreadyReviewed();

  const patch = submissionSchema.partial().parse(req.body);
  const updated = await adminUpdateSubmission(id, patch);
  res.json(updated);
});

// { status: 'rejected', reason?: string } or { status: 'approved', spot?: {...enrichment} }.
router.put('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  const review = submissionReviewSchema.parse(req.body);

  const submission = await adminGetSubmission(id);
  if (!submission) throw notFound('Suggestion not found.');

  if (review.status === 'rejected') {
    const rejected = await transitionSubmission(id, 'rejected', {
      reject_reason: review.reason ?? null,
    });
    if (!rejected) throw alreadyReviewed();
    res.json({ submission: rejected, spot: null });
    return;
  }

  // Claim first, so two admins approving at once cannot create two spots.
  const approved = await transitionSubmission(id, 'approved');
  if (!approved) throw alreadyReviewed();

  try {
    const targetStatus = review.spot?.status ?? 'draft';
    const draft = spotCreateSchema.parse({
      name: submission.name,
      category_slug: submission.category_slug,
      lat: submission.lat,
      lng: submission.lng,
      description: submission.description,
      best_time_to_visit: submission.best_time_to_visit,
      hero_img: submission.image_url,
      street: submission.street ?? undefined,
      landmark: submission.landmark ?? undefined,
      area: submission.area ?? undefined,
      city: submission.city ?? 'Patna',
      state: submission.state ?? 'Bihar',
      pincode: submission.pincode ?? undefined,
      ...review.spot,
      status: targetStatus,
    });
    const spot = await adminCreateSpot({ ...draft, created_by: null });
    res.json({ submission: approved, spot });
  } catch (error) {
    await restorePendingSubmission(id).catch((restoreError) =>
      console.error('[submissions] could not return suggestion', id, 'to pending:', restoreError.message),
    );
    throw error;
  }
});

export default router;
