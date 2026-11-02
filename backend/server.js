/**
 * server.js
 * Application entry point — wires up middleware, routes and the database.
 * Pattern: MVC  (model / controller / route)  +  middleware layer.
 */
require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const authRoutes = require('./route/authRoutes');
const employeeRoutes = require('./route/employeeRoutes');
const { notFound, errorHandler } = require('./middleware/error');
const seedAdmin = require('./utils/seedAdmin');
const seedEmployees = require('./utils/seedEmployees');

const app = express();

/* ------------------------------ Global middleware ------------------------------ */
app.use(
  cors({
    origin: [process.env.CLIENT_URL || 'http://localhost:3000'],
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded photos:  http://localhost:5000/uploads/employees/xxx.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ---------------------------------- Routes ----------------------------------- */
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Wizinoa HR API is running', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);

/* ------------------------------- Error handling ------------------------------- */
app.use(notFound);
app.use(errorHandler);

/* ---------------------------------- Bootstrap -------------------------------- */
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
