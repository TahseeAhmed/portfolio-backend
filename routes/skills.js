const express = require('express');
const router = express.Router();
const Skill = require('../models/Skill');
const { protect } = require('../middleware/auth');

// ─── GET /api/skills  (public) ───────────────────────────────
router.get('/', async (req, res) => {
  try {
    const skills = await Skill.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, data: skills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST /api/skills  (admin only) ─────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { name, category, level, icon, order } = req.body;

    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Name and category are required' });
    }

    const skill = new Skill({ name, category, level, icon, order });
    await skill.save();

    res.status(201).json({ success: true, message: 'Skill added', data: skill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── PUT /api/skills/:id  (admin only) ──────────────────────
router.put('/:id', protect, async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });
    res.json({ success: true, message: 'Skill updated', data: skill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── DELETE /api/skills/:id  (admin only) ───────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });
    res.json({ success: true, message: 'Skill deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST /api/skills/seed  (admin only) ────────────────────
// Seed initial skills into MongoDB
router.post('/seed', protect, async (req, res) => {
  try {
    await Skill.deleteMany({});
    const defaultSkills = [
      { name: 'React.js',    category: 'Frontend', level: 'Advanced',     icon: '⚛️', order: 1 },
      { name: 'Node.js',     category: 'Backend',  level: 'Advanced',     icon: '🟢', order: 2 },
      { name: 'JavaScript',  category: 'Frontend', level: 'Advanced',     icon: '🟡', order: 3 },
      { name: 'MongoDB',     category: 'Database', level: 'Intermediate', icon: '🍃', order: 4 },
      { name: 'Express.js',  category: 'Backend',  level: 'Advanced',     icon: '🚂', order: 5 },
      { name: 'Tailwind CSS',category: 'Frontend', level: 'Advanced',     icon: '🎨', order: 6 },
      { name: 'Java',        category: 'Language', level: 'Intermediate', icon: '☕', order: 7 },
      { name: 'Python',      category: 'Language', level: 'Intermediate', icon: '🐍', order: 8 },
      { name: 'Git & GitHub',category: 'Tools',    level: 'Advanced',     icon: '🔧', order: 9 },
      { name: 'REST APIs',   category: 'Backend',  level: 'Advanced',     icon: '🔌', order: 10 },
    ];
    await Skill.insertMany(defaultSkills);
    res.json({ success: true, message: 'Skills seeded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
