const Notification = require('../models/Notification');

// Helper to create a notification and emit via socket
const createNotification = async (io, { userId, type, message, projectId, relatedId }) => {
  try {
    const notification = await Notification.create({ userId, type, message, projectId, relatedId });
    // Emit real-time event to the target user's personal room
    if (io) {
      io.to(`user_${userId}`).emit('new_notification', notification);
    }
    return notification;
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
};

// @desc    Get current user's notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user._id, read: false });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markOneRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Mark all read error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createNotification, getNotifications, getUnreadCount, markOneRead, markAllRead };
