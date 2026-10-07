import multer from 'multer';

// Files stay in memory just long enough to be validated and re-encoded; nothing is written to disk.
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 1, fields: 20, fieldSize: 16 * 1024 },
});
