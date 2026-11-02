/**
 * server.js
 * Local/dev entry point: connect DB → seed → listen.
 * (The app itself lives in app.js so Vercel can reuse it serverless.)
 */
require('dotenv').config();

const connectDB = require('./config/db');
const { app } = require('./app');
const seedAdmin = require('./utils/seedAdmin');
const seedEmployees = require('./utils/seedEmployees');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  await seedAdmin();      // guarantees at least one admin can log in
  await seedEmployees();  // optional demo data (SEED_DEMO_DATA=true)
  app.listen(PORT, () => {
    console.log(`🚀  API server listening on http://localhost:${PORT}`);
    console.log(`👤  Admin login → ${process.env.ADMIN_EMAIL || 'admin@wizinoa.com'} / ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
  });
};

start();

module.exports = app; // exported for supertest / automated testing
