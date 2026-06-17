const mongoose = require('mongoose');

const liveClassSchema = new mongoose.Schema({
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    required: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  scheduledDate: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number, // in minutes
    required: true,
  },
  maxParticipants: {
    type: Number,
    default: 100,
  },
  currentParticipants: {
    type: Number,
    default: 0,
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    joinedAt: Date,
    leftAt: Date,
  }],
  status: {
    type: String,
    enum: ['scheduled', 'live', 'completed', 'cancelled'],
    default: 'scheduled',
  },
  streamUrl: {
    type: String, // For live streaming integration
  },
  recordingUrl: {
    type: String, // After class ends
  },
  thumbnail: {
    type: String,
  },
  tags: [{
    type: String,
  }],
  isFree: {
    type: Boolean,
    default: false,
  },
  price: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes
liveClassSchema.index({ scheduledDate: 1, status: 1 });
liveClassSchema.index({ instructor: 1 });

module.exports = mongoose.model('LiveClass', liveClassSchema);