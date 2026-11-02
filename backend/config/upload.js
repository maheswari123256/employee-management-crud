/**
 * config/upload.js
 * Multer configuration for employee photo uploads (disk storage).
 * Local: backend/uploads/employees · Vercel serverless: /tmp (only writable dir)
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

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base =
      path
        .basename(file.originalname, ext)
        .replace(/[^a-zA-Z0-9-_]/g, '')
        .slice(0, 40) || 'photo';
    cb(null, `${base}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

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
