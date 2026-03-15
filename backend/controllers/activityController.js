const Activity = require('../models/Activity');
const Project = require('../models/Project');

// Helper to record an activity
const recordActivity = async (userId, projectId, type, message) => {
  try {
    await Activity.create({
      userId,
      projectId,
      type,
      message
    });
  } catch (err) {
    console.error('Error recording activity:', err.message);
  }
};

// @desc    Get recent activities related to the user
// @route   GET /api/dashboard/activity
// @access  Private
const getActivities = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find projects where user is creator or member to show relevant activities
    const userProjects = await Project.find({
      $or: [
        { createdBy: userId },
        { members: userId }
      ]
    }).select('_id');
    
    const projectIds = userProjects.map(p => p._id);

    // Fetch activities:
    // 1. Where creator is the user
    // 2. Where activity is related to user's projects
    const activities = await Activity.find({
      $or: [
        { userId: userId },
        { projectId: { $in: projectIds } }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('userId', 'username avatar')
    .populate('projectId', 'title');

    res.status(200).json(activities);
  } catch (error) {
    console.error('Get activities error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  recordActivity,
  getActivities
};
