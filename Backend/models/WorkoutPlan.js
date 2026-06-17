const mongoose = require('mongoose');

const workoutPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  goal: {
    type: String,
    enum: ['weight_loss', 'muscle_gain', 'strength', 'endurance', 'flexibility', 'general_fitness'],
    required: true,
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true,
  },
  duration: {
    type: Number, // in weeks
    required: true,
  },
  frequency: {
    type: Number, // days per week
    required: true,
  },
  workouts: [{
    day: {
      type: Number, // 1-7 (Monday to Sunday)
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    exercises: [{
      name: {
        type: String,
        required: true,
      },
      sets: {
        type: Number,
        required: true,
      },
      reps: {
        type: String, // Can be "8-12" or "to failure"
      },
      weight: String,
      restTime: Number, // in seconds
      notes: String,
      videoUrl: String,
      targetMuscles: [{
        type: String,
      }],
    }],
    duration: Number, // estimated duration in minutes
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
    },
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Trainer who assigned this plan
  },
  progress: {
    currentWeek: {
      type: Number,
      default: 1,
    },
    completedWorkouts: [{
      workoutId: String, // Reference to workout in the plan
      completedAt: Date,
      duration: Number, // actual time taken
      exercises: [{
        name: String,
        sets: Number,
        reps: String,
        weight: String,
        completed: Boolean,
      }],
    }],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes
workoutPlanSchema.index({ user: 1, isActive: 1 });
workoutPlanSchema.index({ assignedBy: 1 });

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);