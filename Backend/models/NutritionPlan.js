const mongoose = require('mongoose');

const mealIngredientSchema = new mongoose.Schema({
  name: String,
  quantity: String,
  calories: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
}, { _id: false });

const mealSchema = new mongoose.Schema({
  day: Number,
  type: {
    type: String,
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
  },
  name: String,
  ingredients: [mealIngredientSchema],
  instructions: String,
  image: String,
  calories: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
  totalCalories: Number,
}, { _id: false });

const nutritionPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  name: {
    type: String,
    trim: true,
  },
  title: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  goal: {
    type: String,
    enum: ['weight_loss', 'muscle_gain', 'maintenance', 'general_health'],
    default: 'maintenance',
  },
  weight: {
    type: Number,
    min: 1,
  },
  dietPreference: {
    type: String,
    enum: ['veg', 'eggetarian', 'non_veg'],
    default: 'veg',
  },
  calories: {
    type: Number,
    min: 0,
  },
  macros: {
    protein: {
      type: Number,
      default: 0,
    },
    carbs: {
      type: Number,
      default: 0,
    },
    fat: {
      type: Number,
      default: 0,
    },
  },
  protein: {
    type: Number,
    default: 0,
  },
  carbs: {
    type: Number,
    default: 0,
  },
  fat: {
    type: Number,
    default: 0,
  },
  fats: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    enum: ['weight-loss', 'muscle-gain', 'maintenance', 'vegan', 'keto', 'mediterranean', 'athletic'],
    default: 'maintenance',
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  duration: {
    type: Number, // in weeks
    default: 1,
  },
  targetCalories: {
    min: Number,
    max: Number,
  },
  meals: [mealSchema],
  supplements: [{
    name: String,
    dosage: String,
    timing: String,
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  nutritionLogs: [{
    date: {
      type: Date,
      default: Date.now,
    },
    mealType: String,
    food: String,
    calories: Number,
    macros: {
      protein: Number,
      carbs: Number,
      fat: Number,
    },
  }],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('NutritionPlan', nutritionPlanSchema);
