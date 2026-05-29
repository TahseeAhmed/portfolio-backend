const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const { protect } = require('../middleware/auth');
const { uploadProfileImage, uploadCV, cloudinary } = require('../middleware/upload');

// ─── GET /api/profile  (public) ─────────────────────────────
router.get('/', async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      // Create default profile if none exists
      profile = new Profile({});
      await profile.save();
    }
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── PUT /api/profile  (admin only) ─────────────────────────
router.put('/', protect, async (req, res) => {
  try {
    const allowedFields = ['name', 'title', 'subtitle', 'bio', 'email', 'location', 'institute', 'github', 'linkedin', 'available'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    let profile = await Profile.findOne();
    if (!profile) {
      profile = new Profile(updates);
    } else {
      Object.assign(profile, updates);
    }

    await profile.save();
    res.json({ success: true, message: 'Profile updated', data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST /api/profile/image  (admin only) ──────────────────
router.post('/image', protect, uploadProfileImage.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' });

    let profile = await Profile.findOne();
    if (!profile) profile = new Profile({});

    // Delete old image
    if (profile.profileImage?.publicId) {
      await cloudinary.uploader.destroy(profile.profileImage.publicId);
    }

    profile.profileImage = { url: req.file.path, publicId: req.file.filename };
    await profile.save();

    res.json({ success: true, message: 'Profile image updated', imageUrl: req.file.path });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST /api/profile/cv  (admin only) ─────────────────────
router.post('/cv', protect, uploadCV.single('cv'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No PDF uploaded' });

    let profile = await Profile.findOne();
    if (!profile) profile = new Profile({});

    profile.cvUrl = req.file.path;
    await profile.save();

    res.json({ success: true, message: 'CV uploaded successfully', cvUrl: req.file.path });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
