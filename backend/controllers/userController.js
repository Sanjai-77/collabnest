const multer = require('multer');
const path = require('path');
const User = require('../models/User');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Uploads directory relative to backend folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.user._id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter (images only)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// @desc    Upload profile image
// @route   POST /api/users/upload-profile
// @access  Private
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const hostUrl = req.protocol + '://' + req.get('host');
    const imageUrl = `${hostUrl}/uploads/${req.file.filename}`;

    // Update user record
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profileImage = imageUrl;
    await user.save();

    res.status(200).json({
      message: 'Profile image uploaded successfully',
      profileImage: imageUrl
    });
  } catch (error) {
    console.error('Upload profile image error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  upload,
  uploadProfileImage
};
