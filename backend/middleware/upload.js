/**
 * middleware/upload.js
 * Wraps the multer single('photo') handler so upload errors are
 * returned as clean JSON instead of crashing the request.
 */
const { upload } = require('../config/upload');

const uploadPhoto = (req, res, next) => {
  upload.single('photo')(req, res, (err) => {
    if (err) {
      const message =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'Photo must be smaller than 2 MB'
          : err.message || 'File upload failed';
      return res.status(400).json({ success: false, message });
    }
    next();
  });
};

module.exports = { uploadPhoto };
