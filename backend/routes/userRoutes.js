const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { upload, uploadProfileImage } = require('../controllers/userController');

// Upload profile image route
// Uses multer middleware first to process the 'image' field, then the controller logic
router.post('/upload-profile', protect, upload.single('image'), uploadProfileImage);

module.exports = router;
