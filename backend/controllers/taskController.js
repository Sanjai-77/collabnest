const Task = require('../models/Task');
const Project = require('../models/Project');
const { createNotification } = require('./notificationController');
const { recordActivity } = require('./activityController');
const socketModule = require('../socket');


const getIo = () => {
  try { return require('../server').io; } catch { return null; }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { projectId, title, description, assignedTo, dueDate } = req.body;

    const project = await Project.findById(projectId).populate('createdBy', 'username');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.members.some(m => m.toString() === req.user._id.toString()) ||
                     project.createdBy._id.toString() === req.user._id.toString();
    if (!isMember) {
      return res.status(401).json({ message: 'Not authorized to add tasks to this project' });
    }

    const task = await Task.create({
      projectId,
      title,
      description,
      assignedTo: assignedTo || null,
      assignedBy: req.user._id,
      dueDate,
    });

    // Record activity
    await recordActivity(req.user._id, projectId, 'task_created', `Added task "${title}" to project "${project.title}"`);
    if (assignedTo) {
      await recordActivity(assignedTo, projectId, 'task_assignment', `Assigned task "${title}" in project "${project.title}"`);
    }


    const populatedTask = await Task.findById(task._id).populate('assignedTo', 'username email avatar');

    // Notify assigned member (if different from assigner)
    if (assignedTo && assignedTo.toString() !== req.user._id.toString()) {
      await createNotification(getIo(), {
        userId: assignedTo,
        type: 'task_assignment',
        message: `You have been assigned a new task "${title}" in project "${project.title}".`,
        projectId: project._id,
        relatedId: task._id,
      });
    }

    // Emit socket event
    emitTaskEvent(projectId, 'task_created', populatedTask);

    res.status(201).json(populatedTask);
  } catch (error) {
    console.error('Create task error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper for task controller to emit events
const emitTaskEvent = (projectId, eventName, task) => {
  const io = socketModule.getIo();
  if (io) {
    io.to(projectId.toString()).emit(eventName, task);
  }
};

// @desc    Get tasks for a project
// @route   GET /api/tasks/:projectId
// @access  Private
const getTasks = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const tasks = await Task.find({ projectId: req.params.projectId })
      .populate('assignedTo', 'username email avatar')
      .populate('assignedBy', 'username');
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:taskId
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.taskId, req.body, { new: true })
      .populate('assignedTo', 'username email avatar')
      .populate('projectId', 'title');

    // Emit task_updated event for real-time synchronization
    emitTaskEvent(task.projectId, 'task_updated', updatedTask);

    // Record activity if completed
    if (req.body.status === 'completed') {
       await recordActivity(req.user._id, updatedTask.projectId._id, 'task_completed', `Completed task "${updatedTask.title}" in project "${updatedTask.projectId.title}"`);
    }

    res.status(200).json(updatedTask);

  } catch (error) {
    console.error('Update task error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:taskId
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.deleteOne();

    // Emit task_deleted event
    emitTaskEvent(task.projectId, 'task_deleted', req.params.taskId);

    res.status(200).json({ message: 'Task removed' });
  } catch (error) {
    console.error('Delete task error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Accept a task
// @route   PUT /api/tasks/:taskId/accept
// @access  Private
const acceptTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId).populate('projectId', 'title');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.assignedTo && task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to accept this task' });
    }

    task.status = 'in-progress';
    await task.save();

    await recordActivity(req.user._id, task.projectId._id, 'task_accepted', `Accepted task "${task.title}" in project "${task.projectId.title}"`);

    const updatedTask = await Task.findById(task._id).populate('assignedTo', 'name email avatar');
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Accept task error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Complete a task
// @route   PUT /api/tasks/:taskId/complete
// @access  Private
const completeTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId).populate('projectId', 'title');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.assignedTo && task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to complete this task' });
    }

    task.status = 'completed';
    await task.save();

    await recordActivity(req.user._id, task.projectId._id, 'task_completed', `Completed task "${task.title}" in project "${task.projectId.title}"`);

    const updatedTask = await Task.findById(task._id).populate('assignedTo', 'name email avatar');
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Complete task error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createTask, getTasks, updateTask, deleteTask, acceptTask, completeTask };
