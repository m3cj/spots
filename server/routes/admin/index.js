import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { noStore } from '../../middleware/noStore.js';
import { adminLimiter } from '../../middleware/rateLimit.js';
import categories from './categories.js';
import dashboard from './dashboard.js';
import events from './events.js';
import media from './media.js';
import spots from './spots.js';
import submissions from './submissions.js';
import upload from './upload.js';

const router = Router();

router.use(noStore, adminLimiter, requireAuth, requireRole('spoter', 'super_admin'));

// Spoters manage their own spots and upload the images for them.
router.use('/spots', spots);
router.use('/upload', upload);

// Everything below is super_admin only.
router.use(requireRole('super_admin'));
router.use('/dashboard', dashboard);
router.use('/categories', categories);
router.use('/events', events);
router.use('/submissions', submissions);
router.use('/media', media);

export default router;
