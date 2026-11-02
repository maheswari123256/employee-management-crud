/**
 * utils/seedAdmin.js
 * Creates the first admin account if none exists (so login always works).
 */
const User = require('../model/User');

const seedAdmin = async () => {
  try {
    const email = (process.env.ADMIN_EMAIL || 'admin@wizinoa.com').toLowerCase();
    const existing = await User.findOne({ email });

    if (existing) return;

    try {
      await User.create({
        name: process.env.ADMIN_NAME || 'Super Admin',
        email,
        password: process.env.ADMIN_PASSWORD || 'Admin@123',
        role: 'admin',
        isActive: true,
      });
      console.log(`👤 Seeded admin account: ${email}`);
    } catch (error) {
      // tolerate the (rare) case where another instance created it first
      if (error.code !== 11000) throw error;
    }
  } catch (error) {
    console.error(`❌ Admin seed failed: ${error.message}`);
  }
};

module.exports = seedAdmin;
