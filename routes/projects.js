const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');
const { uploadProjectImage, cloudinary } = require('../middleware/upload');

// ─── GET /api/projects  (public) ────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { category, featured } = req.query;
    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (featured === 'true') filter.featured = true;

    const projects = await Project.find(filter).sort({ featured: -1, order: 1, createdAt: -1 });
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/projects/:id  (public) ────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST /api/projects  (admin only) ───────────────────────
router.post('/', protect, uploadProjectImage.single('image'), async (req, res) => {
  try {
    const { title, description, tech, category, github, live, featured, order } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    const techArray = tech ? (Array.isArray(tech) ? tech : tech.split(',').map(t => t.trim()).filter(Boolean)) : [];

    const project = new Project({
      title, description,
      tech: techArray,
      category: category || 'Other',
      github: github || '',
      live: live || '',
      featured: featured === 'true' || featured === true,
      order: order || 0,
      image: req.file ? { url: req.file.path, publicId: req.file.filename } : { url: null, publicId: null },
    });

    await project.save();
    res.status(201).json({ success: true, message: 'Project created', data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── PUT /api/projects/:id  (admin only) ────────────────────
router.put('/:id', protect, uploadProjectImage.single('image'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const { title, description, tech, category, github, live, featured, order } = req.body;

    if (title) project.title = title;
    if (description) project.description = description;
    if (tech) project.tech = Array.isArray(tech) ? tech : tech.split(',').map(t => t.trim()).filter(Boolean);
    if (category) project.category = category;
    if (github !== undefined) project.github = github;
    if (live !== undefined) project.live = live;
    if (featured !== undefined) project.featured = featured === 'true' || featured === true;
    if (order !== undefined) project.order = order;

    // New image uploaded
    if (req.file) {
      // Delete old image from Cloudinary
      if (project.image?.publicId) {
        await cloudinary.uploader.destroy(project.image.publicId);
      }
      project.image = { url: req.file.path, publicId: req.file.filename };
    }

    await project.save();
    res.json({ success: true, message: 'Project updated', data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── DELETE /api/projects/:id  (admin only) ─────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    // Delete image from Cloudinary
    if (project.image?.publicId) {
      await cloudinary.uploader.destroy(project.image.publicId);
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
