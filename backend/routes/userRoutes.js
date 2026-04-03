const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { upload, uploadProfileImage, updateUserProfile } = require('../controllers/userController');

// Upload profile image route
router.post('/upload-profile', protect, upload.single('image'), uploadProfileImage);

// Update user profile route
router.put('/update-profile', protect, updateUserProfile);

module.exports = router;
