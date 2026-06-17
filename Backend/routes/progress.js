const express = require('express');
const router = express.Router();
const ProgressTracking = require('../models/ProgressTracking');
const { auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get progress tracking for a user
router.get('/', auth, async (req, res) => {
  try {
    const { userId } = req.query;
    const user = userId || req.user.id;

    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'trainer' && req.user.id !== user) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const progress = await ProgressTracking.find({ user })
      .populate('user', 'name email')
      .sort({ date: -1 });

    res.json(progress);
  } catch (error) {
    console.error('Error fetching progress tracking:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get progress statistics for a user
router.get('/stats/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'trainer' && req.user.id !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { period = '30' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period, 10));

    const progressEntries = await ProgressTracking.find({
      user: userId,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    const firstEntry = progressEntries[0];
    const lastEntry = progressEntries[progressEntries.length - 1];
    const workoutEntries = progressEntries.filter((entry) => entry.workout);
    const workoutCount = workoutEntries.length;
    const totalDuration = workoutEntries.reduce((sum, entry) => sum + (entry.workout?.totalDuration || 0), 0);
    const daysWithWorkouts = new Set(
      workoutEntries.map((entry) => new Date(entry.date).toDateString())
    ).size;

    const stats = {
      totalEntries: progressEntries.length,
      weight: {
        initial: firstEntry?.weight ?? null,
        current: lastEntry?.weight ?? null,
        change: 0,
      },
      bodyFat: {
        initial: firstEntry?.bodyFat ?? null,
        current: lastEntry?.bodyFat ?? null,
        change: 0,
      },
      muscleMass: {
        initial: firstEntry?.muscleMass ?? null,
        current: lastEntry?.muscleMass ?? null,
        change: 0,
      },
      workoutsCompleted: workoutCount,
      averageWorkoutDuration: workoutCount > 0 ? totalDuration / workoutCount : 0,
      consistency: (daysWithWorkouts / parseInt(period, 10)) * 100,
    };

    if (stats.weight.initial !== null && stats.weight.current !== null) {
      stats.weight.change = stats.weight.current - stats.weight.initial;
    }
    if (stats.bodyFat.initial !== null && stats.bodyFat.current !== null) {
      stats.bodyFat.change = stats.bodyFat.current - stats.bodyFat.initial;
    }
    if (stats.muscleMass.initial !== null && stats.muscleMass.current !== null) {
      stats.muscleMass.change = stats.muscleMass.current - stats.muscleMass.initial;
    }

    res.json(stats);
  } catch (error) {
    console.error('Error fetching progress stats:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Get progress tracking by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const progress = await ProgressTracking.findById(req.params.id)
      .populate('user', 'name email');

    if (!progress) {
      return res.status(404).json({ message: 'Progress tracking not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'trainer' && req.user.id !== progress.user.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(progress);
  } catch (error) {
    console.error('Error fetching progress tracking:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Create progress tracking entry
router.post('/', [
  auth,
  body('date').isISO8601().withMessage('Valid date required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { user, ...progressData } = req.body;
    const targetUser = user || req.user.id;

    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'trainer' && req.user.id !== targetUser) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const progress = new ProgressTracking({
      ...progressData,
      user: targetUser,
    });

    await progress.save();
    await progress.populate('user', 'name email');

    res.status(201).json(progress);
  } catch (error) {
    console.error('Error creating progress tracking:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Update progress tracking
router.put('/:id', auth, async (req, res) => {
  try {
    const progress = await ProgressTracking.findById(req.params.id);

    if (!progress) {
      return res.status(404).json({ message: 'Progress tracking not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'trainer' && req.user.id !== progress.user.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedProgress = await ProgressTracking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('user', 'name email');

    res.json(updatedProgress);
  } catch (error) {
    console.error('Error updating progress tracking:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Delete progress tracking
router.delete('/:id', auth, async (req, res) => {
  try {
    const progress = await ProgressTracking.findById(req.params.id);

    if (!progress) {
      return res.status(404).json({ message: 'Progress tracking not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'trainer' && req.user.id !== progress.user.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await ProgressTracking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Progress tracking deleted successfully' });
  } catch (error) {
    console.error('Error deleting progress tracking:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

module.exports = router;
