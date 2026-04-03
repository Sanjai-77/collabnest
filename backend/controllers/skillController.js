const Skill = require('../models/Skill');

// @desc    Get all skills (grouped by category, sorted alphabetically)
// @route   GET /api/skills
// @access  Public
const getSkills = async (req, res) => {
  try {
    const skills = await Skill.find()
      .sort({ category: 1, name: 1 })
      .lean();

    res.status(200).json(skills);
  } catch (error) {
    console.error('Get skills error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new skill
// @route   POST /api/skills
// @access  Protected
const createSkill = async (req, res) => {
  try {
    const { name, category } = req.body;

    if (!name || !category) {
      return res.status(400).json({ message: 'Please provide skill name and category' });
    }

    // Check for existing skill (case-insensitive)
    const existing = await Skill.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) {
      return res.status(409).json({ message: 'Skill already exists', skill: existing });
    }

    const skill = await Skill.create({ name: name.trim(), category: category.trim() });
    res.status(201).json(skill);
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Skill already exists' });
    }
    console.error('Create skill error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getSkills, createSkill };
