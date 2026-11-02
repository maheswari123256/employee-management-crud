/**
 * api/index.js  (Vercel serverless function — mounted at /api)
 *
 * vercel.json rewrites ALL /api/* and /uploads/* requests here as:
 *     /api?p=/api/auth/login   ->  we restore req.url from `p` before Express sees it.
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
    const rawUrl = typeof req.url === 'string' ? req.url : '';

    // 1) Restore the real path from the rewrite (?p=/api/... or ?p=/uploads/...)
    //    Parsed from req.url directly (does not depend on req.query being populated).
    let restored = false;
    if (rawUrl.includes('?')) {
      const qs = rawUrl.slice(rawUrl.indexOf('?') + 1);
      const p = new URLSearchParams(qs).get('p');
      if (p && p.startsWith('/')) {
        req.url = p + '?' + qs;
        restored = true;
      }
    }

    // 2) MONGO_URI not configured yet -> clean, friendly response (never leak raw mongoose errors)
    if (!process.env.MONGO_URI) {
      const isHealth = req.url.startsWith('/api/health');
      return res.status(isHealth ? 200 : 503).json({
        success: isHealth,
        message: isHealth
          ? 'API is running'
          : 'Database not configured yet (MONGO_URI missing on Vercel). Set MONGO_URI in project settings and redeploy.',
        db: 'disconnected',
        // debug: proves the rewrite (?p=) forwarding + path restore + query preservation
        debug: { raw: rawUrl, restored: req.url, restoredOk: restored },
      });
    }

    // 3) Connect (cached) + auto-seed, then hand over to Express
    await ensureReady();
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
