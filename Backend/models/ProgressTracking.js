const mongoose = require('mongoose');

const progressTrackingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  weight: {
    type: Number, // in kg
  },
  bodyFat: {
    type: Number, // percentage
  },
  muscleMass: {
    type: Number, // in kg
  },
  measurements: {
    chest: Number,
    waist: Number,
    hips: Number,
    biceps: Number,
    thighs: Number,
  },
  workout: {
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Program',
    },
    exercises: [{
      name: String,
      sets: Number,
      reps: Number,
      weight: Number,
      duration: Number,
    }],
    totalDuration: Number, // in minutes
    caloriesBurned: Number,
  },
  nutrition: {
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NutritionPlan',
    },
    mealsLogged: [{
      mealType: String,
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
    }],
    waterIntake: Number, // in liters
    totalCalories: Number,
  },
  goals: {
    type: String,
    enum: ['weight-loss', 'muscle-gain', 'maintenance', 'endurance', 'strength'],
  },
  notes: {
    type: String,
  },
  photos: [{
    type: String, // URLs to progress photos
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for efficient queries
progressTrackingSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('ProgressTracking', progressTrackingSchema);