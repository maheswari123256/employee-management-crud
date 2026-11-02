/**
 * api/index.js  (Vercel serverless function — mounted at /api)
 *
 * vercel.json rewrites ALL /api/* and /uploads/* requests here as:
 *     /api?p=/api/auth/login   →   we restore req.url from `p` before Express sees it.
 * (Vercel's api/ folder does not support multi-segment catch-alls, so the
 *  original path is forwarded through the query string instead.)
 */
const mongoose = require('mongoose');
const { app } = require('../backend/app');
const seedAdmin = require('../backend/utils/seedAdmin');
const seedEmployees = require('../backend/utils/seedEmployees');

// Cache the connection promise across invocations (avoid reconnecting per request)
let ready = null;

const ensureReady = () => {
  if (!ready) {
    ready = (async () => {
      if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGO_URI, {
          bufferCommands: false,
          serverSelectionTimeoutMS: 10000,
        });
      }
      await seedAdmin();
      await seedEmployees();
    })().catch((err) => {
      ready = null; // allow retry on next cold invocation
      throw err;
    });
  }
  return ready;
};

module.exports = async (req, res) => {
  try {
    await ensureReady();

    // Restore the real path from the rewrite (?p=/api/... or ?p=/uploads/...)
    const p = req.query && req.query.p;
    if (p && typeof p === 'string' && p.startsWith('/')) {
      const qIndex = typeof req.url === 'string' ? req.url.indexOf('?') : -1;
      const qs = qIndex >= 0 ? req.url.slice(qIndex) : '';
      req.url = p + qs;
    }

    return app(req, res);
  } catch (err) {
    console.error('[VERCEL FUNCTION ERROR]', err.message);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
      });
    }
  }
};
