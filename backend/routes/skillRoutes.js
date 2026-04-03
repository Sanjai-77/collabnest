const express = require('express');
const router = express.Router();
const { getSkills, createSkill } = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/skills — Get all skills (public)
router.get('/', getSkills);

// POST /api/skills — Create a skill (protected)
router.post('/', protect, createSkill);

module.exports = router;
