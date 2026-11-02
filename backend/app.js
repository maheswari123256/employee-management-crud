/**
 * app.js
 * Express application factory — middleware + routes only (no listen, no DB connect).
 * Used by server.js (local) and api/[[...path]].js (Vercel serverless).
 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { UPLOAD_DIR } = require('./config/upload');
const authRoutes = require('./route/authRoutes');
const employeeRoutes = require('./route/employeeRoutes');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded photos:
//   local:  http://localhost:5000/uploads/employees/xxx.jpg
//   Vercel: /uploads/... (rewritten to /api/uploads/... in vercel.json)
app.use(['/uploads', '/api/uploads'], express.static(UPLOAD_DIR));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Wizinoa HR API is running', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = { app, UPLOAD_DIR };
