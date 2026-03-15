const express = require('express');
const router = express.Router();
const { createJoinRequest, getProjectJoinRequests, getMyJoinRequests, updateJoinRequestStatus } = require('../controllers/joinRequestController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/join-requests
router.post('/', protect, createJoinRequest);

// GET /api/join-requests/my — Current user's sent requests
router.get('/my', protect, getMyJoinRequests);

// GET /api/join-requests — Requests for projects owned by user
router.get('/', protect, getProjectJoinRequests);

// PUT /api/join-requests/:id
router.put('/:id', protect, updateJoinRequestStatus);

module.exports = router;
