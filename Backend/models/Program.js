const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
  },
  category: {
    type: String,
    enum: ['strength', 'cardio', 'yoga', 'meditation', 'dance', 'hiit', 'pilates', 'crossfit', 'nutrition', 'wellness'],
    required: true,
  },
  type: {
    type: String,
    enum: ['live', 'on-demand', 'personal-training', 'group-class', 'nutrition-plan', 'wellness-program'],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true,
  },
  duration: {
    type: Number, // in minutes for classes, weeks for programs
    required: true,
  },
  maxParticipants: {
    type: Number,
    default: 1, // 1 for personal training, higher for group classes
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  images: [{
    type: String,
  }],
  videos: [{
    type: String,
  }],
  thumbnail: {
    type: String,
  },
  exercises: [{
    name: String,
    sets: Number,
    reps: Number,
    duration: Number, // in seconds
    description: String,
    videoUrl: String,
  }],
  schedule: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    },
    startTime: String,
    endTime: String,
  }],
  price: {
    type: Number,
    default: 0, // 0 for included in membership
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  tags: [{
    type: String,
  }],
  equipment: [{
    type: String,
  }],
  benefits: [{
    type: String,
  }],
  prerequisites: [{
    type: String,
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes for better search
programSchema.index({ category: 1, type: 1, difficulty: 1 });
programSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Program', programSchema);