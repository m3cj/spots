import { Router } from 'express';
import { uploadImage } from '../../db/storage.js';
import { imageUpload } from '../../middleware/upload.js';
import { HttpError } from '../../utils/HttpError.js';
import { processImage } from '../../utils/image.js';

const router = Router();

// multipart/form-data with a single `file`; resolves to the public URL to store on a spot or event.
router.post('/', imageUpload.single('file'), async (req, res) => {
  if (!req.file) throw new HttpError(400, 'Attach an image in the "file" field.', { code: 'NO_FILE' });

  const image = await processImage(req.file.buffer);
  const stored = await uploadImage(image.buffer, 'admin', image.thumbBuffer);

  res.status(201).json({ ...stored, width: image.width, height: image.height, size: image.size, mime: 'image/webp' });
});

export default router;
