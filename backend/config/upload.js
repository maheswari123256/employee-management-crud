/**
 * config/upload.js
 * Multer configuration for employee photo uploads (memory storage).
 * The buffer is converted to a base64 data-URL and stored in MongoDB —
 * Vercel's /tmp is ephemeral, so disk files would vanish across invocations.
 */
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const UPLOAD_DIR = process.env.VERCEL
  ? path.join('/tmp', 'wizinoa-uploads')
  : path.join(__dirname, '..', 'uploads', 'employees');

// Make sure the upload folder always exists
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

// In-memory: no temp file on disk. Controller stores `req.file.buffer`
// as a data-URL in the Employee.photo field (serverless-safe).
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, WEBP or GIF images are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

module.exports = { upload, UPLOAD_DIR, ALLOWED_TYPES, MAX_FILE_SIZE };
