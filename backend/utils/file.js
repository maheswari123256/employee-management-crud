/**
 * utils/file.js
 * Small helper to remove uploaded files from disk safely.
 */
const fs = require('fs');
const path = require('path');
const { UPLOAD_DIR } = require('../config/upload');

/** Delete a photo by its stored filename (ignores anything outside the upload dir). */
const deleteFile = (filename) => {
  if (!filename) return;
  const safeName = path.basename(filename);
  const filePath = path.join(UPLOAD_DIR, safeName);
  fs.unlink(filePath, (err) => {
    if (err && err.code !== 'ENOENT') console.warn(`Could not delete file ${safeName}: ${err.message}`);
  });
};

module.exports = { deleteFile };
