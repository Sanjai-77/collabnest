const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      required: [true, 'Skill category is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Case-insensitive unique index on name
skillSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
// Index on category for grouped queries
skillSchema.index({ category: 1 });

module.exports = mongoose.model('Skill', skillSchema);
