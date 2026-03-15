const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    type: {
      type: String,
      enum: [
        'project_created',
        'task_created',
        'task_assignment',
        'task_completed',
        'member_joined',
        'join_request_sent',
        'join_request_accepted',
        'message_sent'
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for production performance
activitySchema.index({ userId: 1 });
activitySchema.index({ projectId: 1 });
activitySchema.index({ createdAt: -1 });
activitySchema.index({ type: 1 });

module.exports = mongoose.model('Activity', activitySchema);
