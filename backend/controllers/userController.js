const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

// Configure multer to use memory storage
const storage = multer.memoryStorage();

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

    // Convert multer buffer to Base64 URI so Cloudinary can process it directly from memory
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    // Upload to Cloudinary
    const cldRes = await cloudinary.uploader.upload(dataURI, {
      folder: 'collabnest/avatars',
      resource_type: 'auto'
    });

    const imageUrl = cldRes.secure_url;

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
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = {
  upload,
  uploadProfileImage
};
