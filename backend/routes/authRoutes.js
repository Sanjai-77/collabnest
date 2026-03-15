const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateProfile, getProfile, googleLogin } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/login
router.post('/login', loginUser);

// POST /api/auth/google
router.post('/google', googleLogin);

// PUT /api/auth/profile
router.put('/profile', protect, updateProfile);

// GET /api/auth/profile
router.get('/profile', protect, getProfile);

module.exports = router;
