const Project = require('../models/Project');
const JoinRequest = require('../models/JoinRequest');
const { createNotification } = require('./notificationController');
const { recordActivity } = require('./activityController');


const socketModule = require('../socket');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const { title, description, requiredSkills, teamSize } = req.body;

    if (!title || !description || !teamSize) {
      return res.status(400).json({ message: 'Please provide title, description, and teamSize' });
    }

    const project = await Project.create({
      title,
      description,
      requiredSkills: requiredSkills || [],
      teamSize,
      createdBy: req.user._id,
      members: [req.user._id],
    });

    // Record activity
    await recordActivity(req.user._id, project._id, 'project_created', `Created a new project: "${title}"`);

    res.status(201).json({
      message: 'Project created successfully',
      project,
    });
  } catch (error) {
    console.error('[TRACE] ERROR in createProject:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('createdBy', 'username email')
      .populate('members', 'username email skills github avatar role')
      .sort({ createdAt: -1 });

    res.status(200).json(projects);
  } catch (error) {
    console.error('Get projects error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's projects (creator or member)
// @route   GET /api/projects/my
// @access  Private
const getMyProjects = async (req, res) => {
  try {
    console.log('Fetching projects for user ID:', req.user._id);
    const projects = await Project.find({
      $or: [
        { createdBy: req.user._id },
        { members: req.user._id }
      ]
    })
      .populate('createdBy', 'username email')
      .populate('members', 'username email skills github avatar role')
      .sort({ updatedAt: -1 });

    console.log(`Found ${projects.length} projects for user ${req.user.username}`);
    res.status(200).json(projects);
  } catch (error) {
    console.error('Get my projects error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get a single project by ID
// @route   GET /api/projects/:id
// @access  Public
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'username email')
      .populate('members', 'username email skills github avatar role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json(project);
  } catch (error) {
    // Handle invalid ObjectId format
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Project not found' });
    }
    console.error('Get project error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Request to join a project
// @route   POST /api/projects/:id/join
// @access  Private
const joinProject = async (req, res) => {
  try {
    console.log('Join request received for project:', req.params.id);
    console.log('Request body:', req.body);
    console.log('User:', req.user._id);

    const project = await Project.findById(req.params.id);

    if (!project) {
      console.log('Project not found [joinProject]');
      return res.status(404).json({ message: 'Project not found [joinProject]' });
    }

    // Check if user is already a member
    const isMember = project.members.some(m => m.toString() === req.user._id.toString());
    const isCreator = project.createdBy.toString() === req.user._id.toString();

    if (isMember || isCreator) {
      console.log('User is already a member or creator');
      return res.status(400).json({ message: 'You are already a member or creator of this project' });
    }

    // Check if there's already a pending request
    const existingRequest = await JoinRequest.findOne({
      user: req.user._id,
      project: project._id,
      status: 'pending'
    });

    if (existingRequest) {
      console.log('Join request already pending');
      return res.status(400).json({ message: 'Join request already pending' });
    }

    const { message, github, resume } = req.body;

    const joinRequest = await JoinRequest.create({
      user: req.user._id,
      project: project._id,
      message,
      github,
      resume: typeof resume === 'string' ? resume : '', // Ensure string
      status: 'pending'
    });

    // Notify project leader
    await createNotification(socketModule.getIo(), {
      userId: project.createdBy,
      type: 'join_request',
      message: `${req.user.username} requested to join your project "${project.title}".`,
      projectId: project._id,
      relatedId: joinRequest._id,
    });

    console.log('Join request created:', joinRequest._id);
    res.status(201).json({
      message: 'Join request submitted successfully',
      joinRequest
    });
  } catch (error) {
    console.error('Join project error DETAILS:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Make sure user owns project
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to update this project' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedProject);
  } catch (error) {
    console.error('Update project error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Make sure user owns project
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to delete this project' });
    }

    await project.deleteOne();

    res.status(200).json({ id: req.params.id, message: 'Project removed' });
  } catch (error) {
    console.error('Delete project error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove a member from a project
// @route   DELETE /api/projects/:projectId/members/:userId
// @access  Private
const removeMember = async (req, res) => {
  try {
    const { projectId, userId } = req.params;

    const project = await Project.findById(projectId).populate('createdBy', '_id username');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Verify requester is project leader
    if (project.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to remove members' });
    }

    // Prevent removing the creator
    if (userId === project.createdBy._id.toString()) {
      return res.status(400).json({ message: 'Cannot remove the project leader' });
    }

    // Check if user is a member
    if (!project.members.includes(userId)) {
      return res.status(400).json({ message: 'User is not a member of this project' });
    }

    // Remove member
    project.members = project.members.filter(m => m.toString() !== userId);
    await project.save();

    // Record activity
    const removedUser = await require('../models/User').findById(userId);
    const removedUserName = removedUser ? removedUser.username : 'Unknown User';
    await recordActivity(req.user._id, project._id, 'member_joined', `Removed ${removedUserName} from the project team`);

    // Notify removed user
    await createNotification(getIo(), {
      userId: userId,
      type: 'join_rejected', // Reuse or add new type
      message: `You have been removed from the project "${project.title}" by the leader.`,
      projectId: project._id,
    });

    const updatedProject = await Project.findById(projectId)
      .populate('createdBy', 'username email')
      .populate('members', 'username email skills github avatar role');

    res.status(200).json(updatedProject);
  } catch (error) {
    console.error('Remove member error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createProject, getProjects, getMyProjects, getProjectById, joinProject, updateProject, deleteProject, removeMember };

