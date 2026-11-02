/**
 * route/employeeRoutes.js
 * GET    /api/employees        → list + pagination (any authenticated user)
 * GET    /api/employees/stats  → dashboard counters
 * GET    /api/employees/:id    → single employee
 * POST   /api/employees        → create  (admin only, multipart photo optional)
 * PUT    /api/employees/:id    → update  (admin only, multipart photo optional)
 * DELETE /api/employees/:id    → delete  (admin only)
 */
const router = require('express').Router();
const {
  getEmployees,
  getStats,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controller/employeeController');
const { protect, adminOnly } = require('../middleware/auth');
const { uploadPhoto } = require('../middleware/upload');

router.use(protect); // 🔐 all employee routes require a valid token

router.route('/').get(getEmployees).post(adminOnly, uploadPhoto, createEmployee);
router.route('/stats').get(getStats);
router.route('/:id').get(getEmployeeById).put(adminOnly, uploadPhoto, updateEmployee).delete(adminOnly, deleteEmployee);

module.exports = router;
