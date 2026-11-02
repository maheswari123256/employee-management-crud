/**
 * api/[[...path]].js  (Vercel serverless function)
 * Mounts the SAME Express MVC app for every /api/* request
 * and runs the DB connection with a module-level cache (warm invocations reuse it).
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
