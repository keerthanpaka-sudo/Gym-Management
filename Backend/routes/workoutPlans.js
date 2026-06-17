const express = require('express');
const router = express.Router();
const WorkoutPlan = require('../models/WorkoutPlan');
const { auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get workout plans for a user
router.get('/', auth, async (req, res) => {
  try {
    const { userId, isActive = true } = req.query;
    const user = userId || req.user.id;

    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'trainer' && req.user.id !== user) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const plans = await WorkoutPlan.find({ user, isActive: isActive === 'true' })
      .populate('user', 'name email')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(plans);
  } catch (error) {
    console.error('Error fetching workout plans:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get workout plan by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id)
      .populate('user', 'name email')
      .populate('assignedBy', 'name email');

    if (!plan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'trainer' && req.user.id !== plan.user.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(plan);
  } catch (error) {
    console.error('Error fetching workout plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create workout plan
router.post('/', [
  auth,
  body('name').notEmpty().withMessage('Plan name is required'),
  body('goal').isIn(['weight_loss', 'muscle_gain', 'strength', 'endurance', 'flexibility', 'general_fitness']).withMessage('Invalid goal'),
  body('level').isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid level'),
  body('duration').isNumeric().withMessage('Duration must be a number'),
  body('frequency').isNumeric().withMessage('Frequency must be a number'),
  body('workouts').isArray().withMessage('Workouts must be an array'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { user, assignedBy, ...planData } = req.body;
    const targetUser = user || req.user.id;

    // Check permissions - only trainers and admins can create plans for others
    if (req.user.role !== 'admin' && req.user.role !== 'trainer' && req.user.id !== targetUser) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const plan = new WorkoutPlan({
      ...planData,
      user: targetUser,
      assignedBy: assignedBy || req.user.id,
    });

    await plan.save();
    await plan.populate('user', 'name email');
    await plan.populate('assignedBy', 'name email');

    res.status(201).json(plan);
  } catch (error) {
    console.error('Error creating workout plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update workout plan
router.put('/:id', auth, async (req, res) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'trainer' && req.user.id !== plan.user.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedPlan = await WorkoutPlan.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    ).populate('user', 'name email').populate('assignedBy', 'name email');

    res.json(updatedPlan);
  } catch (error) {
    console.error('Error updating workout plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete workout plan
router.delete('/:id', auth, async (req, res) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'trainer' && req.user.id !== plan.user.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await WorkoutPlan.findByIdAndDelete(req.params.id);
    res.json({ message: 'Workout plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting workout plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Log workout completion
router.post('/:id/log-workout', auth, async (req, res) => {
  try {
    const { workoutId, exercises, duration } = req.body;

    const plan = await WorkoutPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }

    // Check permissions
    if (req.user.id !== plan.user.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const completedWorkout = {
      workoutId,
      completedAt: new Date(),
      duration: duration || 0,
      exercises: exercises || [],
    };

    plan.progress.completedWorkouts.push(completedWorkout);
    await plan.save();

    res.status(201).json(completedWorkout);
  } catch (error) {
    console.error('Error logging workout:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get workout plan progress
router.get('/:id/progress', auth, async (req, res) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'trainer' && req.user.id !== plan.user.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const progress = {
      currentWeek: plan.progress.currentWeek,
      totalWeeks: plan.duration,
      completedWorkouts: plan.progress.completedWorkouts.length,
      totalWorkouts: plan.workouts.length * plan.duration,
      completionRate: (plan.progress.completedWorkouts.length / (plan.workouts.length * plan.duration)) * 100,
      recentWorkouts: plan.progress.completedWorkouts.slice(-5), // Last 5 workouts
    };

    res.json(progress);
  } catch (error) {
    console.error('Error fetching workout progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update current week
router.post('/:id/next-week', auth, async (req, res) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }

    // Check permissions
    if (req.user.id !== plan.user.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (plan.progress.currentWeek >= plan.duration) {
      return res.status(400).json({ message: 'Plan is already completed' });
    }

    plan.progress.currentWeek += 1;
    await plan.save();

    res.json({
      message: 'Moved to next week',
      currentWeek: plan.progress.currentWeek,
    });
  } catch (error) {
    console.error('Error updating week:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;