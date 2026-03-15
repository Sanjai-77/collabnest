const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a project title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a project description'],
      trim: true,
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    teamSize: {
      type: Number,
      required: [true, 'Please specify team size'],
      min: 1,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes for production performance
projectSchema.index({ createdBy: 1 });
projectSchema.index({ members: 1 });
projectSchema.index({ title: 'text' }); // For title searches
projectSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);
