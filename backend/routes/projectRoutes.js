const express = require('express');
const router = express.Router();
const { createProject, getProjects, getMyProjects, getProjectById, joinProject, updateProject, deleteProject, removeMember } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/projects — Create project (protected)
router.post('/', protect, createProject);

// DELETE /api/projects/:projectId/members/:userId — Remove member (protected)
router.delete('/:projectId/members/:userId', protect, removeMember);

// GET /api/projects — Get all projects
router.get('/', getProjects);

// GET /api/projects/my — Get user's projects (protected)
router.get('/my', protect, getMyProjects);

// GET /api/projects/:id — Get single project
router.get('/:id', getProjectById);

// POST /api/projects/:id/join — Request to join (protected)
router.post('/:id/join', protect, joinProject);

// PUT /api/projects/:id — Update project (protected)
router.put('/:id', protect, updateProject);

// DELETE /api/projects/:id — Delete project (protected)
router.delete('/:id', protect, deleteProject);

module.exports = router;
