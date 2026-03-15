const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateTask, deleteTask, acceptTask, completeTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createTask);
router.get('/:projectId', protect, getTasks);
router.put('/:taskId', protect, updateTask);
router.put('/:taskId/accept', protect, acceptTask);
router.put('/:taskId/complete', protect, completeTask);
router.delete('/:taskId', protect, deleteTask);

module.exports = router;
