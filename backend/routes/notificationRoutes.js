const express = require('express');
const router = express.Router();
const { getNotifications, getUnreadCount, markOneRead, markAllRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.put('/read-all', protect, markAllRead);
router.put('/:id/read', protect, markOneRead);

module.exports = router;
