const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { protect } = require('../middleware/auth');

// Generate JWT token
const generateToken = (id, username) => {
  return jwt.sign({ id, username }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ─── POST /api/auth/login ────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    // Find admin
    const admin = await Admin.findOne({ username: username.toLowerCase().trim() });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(admin._id, admin.username);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: { id: admin._id, username: admin.username },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/auth/verify ────────────────────────────────────
// Verify if token is still valid
router.get('/verify', protect, (req, res) => {
  res.json({ success: true, message: 'Token is valid', admin: req.admin });
});

// ─── POST /api/auth/seed ─────────────────────────────────────
// Run ONCE to create the admin account. Then remove or protect this route.
router.post('/seed', async (req, res) => {
  try {
    const existing = await Admin.findOne({ username: process.env.ADMIN_USERNAME });
    if (existing) {
      return res.json({ success: false, message: 'Admin already exists' });
    }

    const admin = new Admin({
      username: process.env.ADMIN_USERNAME || 'tahseen',
      password: process.env.ADMIN_PASSWORD || 'Admin123!',
    });

    await admin.save();
    res.json({ success: true, message: `Admin created: ${admin.username}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
