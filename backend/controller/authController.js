/**
 * controller/authController.js
 * Login + "who am I" endpoints.
 */
const jwt = require('jsonwebtoken');
const User = require('../model/User');

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }

    return res.json({
      success: true,
      message: 'Login successful',
      token: signToken(user._id),
      user: publicUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/auth/me  (protected)
 * Returns the authenticated user's data from req.user (set by auth middleware).
 */
exports.getMe = async (req, res) => {
  res.json({ success: true, message: 'Authenticated user', data: req.user });
};
