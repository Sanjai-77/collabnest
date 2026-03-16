const JoinRequest = require('../models/JoinRequest');
const Project = require('../models/Project');
const { createNotification } = require('./notificationController');
const { recordActivity } = require('./activityController');


const socketModule = require('../socket');

// @desc    Create a join request
// @route   POST /api/join-requests
// @access  Private
const createJoinRequest = async (req, res) => {
  try {
    const { projectId, message, github, resume } = req.body;

    const project = await Project.findById(projectId).populate('createdBy', '_id username');
    if (!project) {
      return res.status(404).json({ message: 'Project not found [createJoinRequest]' });
    }

    if (project.createdBy._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You are the creator of this project' });
    }

    if (project.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'You are already a member of this project' });
    }

    const existingRequest = await JoinRequest.findOne({
      project: projectId,
      user: req.user._id,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending request for this project' });
    }

    const joinRequest = await JoinRequest.create({
      project: projectId,
      user: req.user._id,
      message,
      github,
      resume
    });

    // Record activity
    await recordActivity(req.user._id, projectId, 'join_request_sent', `Requested to join project "${project.title}"`);


    // Notify project leader
    await createNotification(socketModule.getIo(), {
      userId: project.createdBy._id,
      type: 'join_request',
      message: `${req.user.username} requested to join your project "${project.title}".`,
      projectId: project._id,
      relatedId: joinRequest._id,
    });

    res.status(201).json(joinRequest);
  } catch (error) {
    console.error('Create join request error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get join requests for user's projects
// @route   GET /api/join-requests
// @access  Private
const getProjectJoinRequests = async (req, res) => {
  try {
    const projects = await Project.find({ createdBy: req.user._id });
    const projectIds = projects.map(p => p._id);

    const requests = await JoinRequest.find({
      project: { $in: projectIds },
      status: 'pending'
    })
    .populate('user', 'username email skills github resume avatar')
    .populate('project', 'title');

    res.status(200).json(requests);
  } catch (error) {
    console.error('Get join requests error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get the current user's own sent join requests (with status)
// @route   GET /api/join-requests/my
// @access  Private
const getMyJoinRequests = async (req, res) => {
  try {
    const requests = await JoinRequest.find({ user: req.user._id })
      .populate('project', 'title description createdBy')
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    console.error('Get my join requests error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update join request status (Accept/Reject)
// @route   PUT /api/join-requests/:id
// @access  Private
const updateJoinRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const joinRequest = await JoinRequest.findById(req.params.id).populate('user', '_id username');
    if (!joinRequest) {
      return res.status(404).json({ message: 'Join request not found' });
    }

    const project = await Project.findById(joinRequest.project);
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    joinRequest.status = status;
    await joinRequest.save();

      if (status === 'accepted') {
        const isAlreadyMember = project.members.some(m => m.toString() === joinRequest.user._id.toString());
        if (!isAlreadyMember) {
          project.members.push(joinRequest.user._id);
          await project.save();
        }


        // Record activity
        await recordActivity(joinRequest.user._id, project._id, 'member_joined', `Joined the project "${project.title}"`);
        await recordActivity(req.user._id, project._id, 'join_request_accepted', `Accepted ${joinRequest.user.username}'s request for "${project.title}"`);
      }


    // Notify the requesting user
    await createNotification(socketModule.getIo(), {
      userId: joinRequest.user._id,
      type: status === 'accepted' ? 'join_accepted' : 'join_rejected',
      message: status === 'accepted'
        ? `Your request to join "${project.title}" was accepted! 🎉`
        : `Your request to join "${project.title}" was declined.`,
      projectId: project._id,
      relatedId: joinRequest._id,
    });

    res.status(200).json(joinRequest);
  } catch (error) {
    console.error('Update join request status error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createJoinRequest,
  getProjectJoinRequests,
  getMyJoinRequests,
  updateJoinRequestStatus
};
