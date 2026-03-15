const Project = require('../models/Project');
const Task = require('../models/Task');
const JoinRequest = require('../models/JoinRequest');

// @desc    Get dashboard statistics for the logged-in user
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Active Projects: Count projects where user is leader or member
    const activeProjects = await Project.countDocuments({
      $or: [
        { createdBy: userId },
        { members: userId }
      ]
    });

    // 2. Pending Tasks: Count tasks assigned to user with status 'todo' or 'in-progress'
    const pendingTasks = await Task.countDocuments({
      assignedTo: userId,
      status: { $in: ['todo', 'in-progress'] }
    });

    // 3. Completed Tasks: Count tasks assigned to user with status 'completed'
    const completedTasks = await Task.countDocuments({
      assignedTo: userId,
      status: 'completed'
    });

    // 4. Join Requests: Count pending join requests for projects led by the user
    // First find projects led by user
    const userProjects = await Project.find({ createdBy: userId }).select('_id');
    const projectIds = userProjects.map(p => p._id);

    const joinRequests = await JoinRequest.countDocuments({
      project: { $in: projectIds },
      status: 'pending'
    });

    res.status(200).json({
      activeProjects,
      pendingTasks,
      completedTasks,
      joinRequests
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDashboardStats
};
