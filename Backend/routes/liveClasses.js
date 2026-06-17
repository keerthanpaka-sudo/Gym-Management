const express = require('express');
const router = express.Router();
const LiveClass = require('../models/LiveClass');
const { auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get all live classes
router.get('/', auth, async (req, res) => {
  try {
    const { status, instructor, upcoming, limit = 20, page = 1 } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (instructor) {
      query.instructor = instructor;
    }

    if (upcoming === 'true') {
      query.scheduledDate = { $gte: new Date() };
      query.status = { $in: ['scheduled', 'live'] };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const classes = await LiveClass.find(query)
      .populate('program', 'name category type')
      .populate('instructor', 'name email profilePicture')
      .sort({ scheduledDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await LiveClass.countDocuments(query);

    res.json({
      classes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching live classes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get live class by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id)
      .populate('program', 'name description category type')
      .populate('instructor', 'name email profilePicture bio')
      .populate('participants.user', 'name email profilePicture');

    if (!liveClass) {
      return res.status(404).json({ message: 'Live class not found' });
    }

    res.json(liveClass);
  } catch (error) {
    console.error('Error fetching live class:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create live class
router.post('/', [
  auth,
  body('program').isMongoId().withMessage('Valid program ID required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('scheduledDate').isISO8601().withMessage('Valid scheduled date required'),
  body('duration').isNumeric().withMessage('Duration must be a number'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check permissions - only trainers and admins can create live classes
    if (req.user.role !== 'admin' && req.user.role !== 'trainer') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const liveClass = new LiveClass({
      ...req.body,
      instructor: req.user.id,
    });

    await liveClass.save();
    await liveClass.populate('program', 'name category type');
    await liveClass.populate('instructor', 'name email profilePicture');

    res.status(201).json(liveClass);
  } catch (error) {
    console.error('Error creating live class:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update live class
router.put('/:id', auth, async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id);

    if (!liveClass) {
      return res.status(404).json({ message: 'Live class not found' });
    }

    // Check permissions - only instructor or admin can update
    if (req.user.role !== 'admin' && liveClass.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedClass = await LiveClass.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    ).populate('program', 'name category type').populate('instructor', 'name email profilePicture');

    res.json(updatedClass);
  } catch (error) {
    console.error('Error updating live class:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete live class
router.delete('/:id', auth, async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id);

    if (!liveClass) {
      return res.status(404).json({ message: 'Live class not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && liveClass.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await LiveClass.findByIdAndDelete(req.params.id);
    res.json({ message: 'Live class deleted successfully' });
  } catch (error) {
    console.error('Error deleting live class:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join live class
router.post('/:id/join', auth, async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id);

    if (!liveClass) {
      return res.status(404).json({ message: 'Live class not found' });
    }

    // Check if class is available for joining
    if (liveClass.status !== 'scheduled' && liveClass.status !== 'live') {
      return res.status(400).json({ message: 'Class is not available for joining' });
    }

    // Check if user is already a participant
    const existingParticipant = liveClass.participants.find(
      p => p.user.toString() === req.user.id
    );

    if (existingParticipant) {
      return res.status(400).json({ message: 'Already joined this class' });
    }

    // Check capacity
    if (liveClass.currentParticipants >= liveClass.maxParticipants) {
      return res.status(400).json({ message: 'Class is full' });
    }

    // Add participant
    liveClass.participants.push({
      user: req.user.id,
      joinedAt: new Date(),
    });
    liveClass.currentParticipants += 1;

    await liveClass.save();
    await liveClass.populate('participants.user', 'name email profilePicture');

    res.json({ message: 'Successfully joined the class', liveClass });
  } catch (error) {
    console.error('Error joining live class:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Leave live class
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id);

    if (!liveClass) {
      return res.status(404).json({ message: 'Live class not found' });
    }

    const participantIndex = liveClass.participants.findIndex(
      p => p.user.toString() === req.user.id && !p.leftAt
    );

    if (participantIndex === -1) {
      return res.status(400).json({ message: 'Not currently in this class' });
    }

    liveClass.participants[participantIndex].leftAt = new Date();
    liveClass.currentParticipants -= 1;

    await liveClass.save();

    res.json({ message: 'Successfully left the class' });
  } catch (error) {
    console.error('Error leaving live class:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start live class
router.post('/:id/start', auth, async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id);

    if (!liveClass) {
      return res.status(404).json({ message: 'Live class not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && liveClass.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (liveClass.status !== 'scheduled') {
      return res.status(400).json({ message: 'Class cannot be started' });
    }

    liveClass.status = 'live';
    await liveClass.save();

    res.json({ message: 'Live class started successfully', liveClass });
  } catch (error) {
    console.error('Error starting live class:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// End live class
router.post('/:id/end', auth, async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id);

    if (!liveClass) {
      return res.status(404).json({ message: 'Live class not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && liveClass.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (liveClass.status !== 'live') {
      return res.status(400).json({ message: 'Class is not live' });
    }

    liveClass.status = 'completed';
    // Mark all active participants as left
    liveClass.participants.forEach(participant => {
      if (!participant.leftAt) {
        participant.leftAt = new Date();
      }
    });
    liveClass.currentParticipants = 0;

    await liveClass.save();

    res.json({ message: 'Live class ended successfully', liveClass });
  } catch (error) {
    console.error('Error ending live class:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;