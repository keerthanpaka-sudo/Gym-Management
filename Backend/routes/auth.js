const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { assignTrainerToMember } = require('../utils/trainerAssignment');

const router = express.Router();

// Register
router.post('/register', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').optional().isIn(['admin', 'member', 'trainer']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: role || 'member',
    });

    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({ token, user: { id: user._id, name, email, role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail(),
  body('password').exists(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({ token, user: { id: user._id, name: user.name, email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('membershipPlan', 'name price duration')
      .populate('assignedTrainer', 'name email')
      .populate('assignedMembers', 'name email membershipPlan membershipStartDate membershipEndDate');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all trainers
router.get('/trainers', auth, async (req, res) => {
  try {
    const trainers = await User.find({ role: 'trainer' }).select('-password');
    res.json(trainers);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('membershipPlan', 'name')
      .populate('assignedTrainer', 'name email')
      .populate('assignedMembers', 'name email');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get assigned members for logged-in trainer
router.get('/assigned-members', auth, async (req, res) => {
  try {
    const trainer = await User.findById(req.user.id)
      .select('role assignedMembers')
      .populate({
        path: 'assignedMembers',
        select: '-password',
        populate: {
          path: 'membershipPlan',
          select: 'name',
        },
      });

    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    if (trainer.role !== 'trainer') {
      return res.status(403).json({ message: 'Only trainers can access assigned members' });
    }

    res.json(trainer.assignedMembers || []);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign a trainer to a member (admin only)
router.put('/users/:memberId/assign-trainer', auth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can assign trainers' });
    }

    const { trainerId } = req.body;
    if (!trainerId) {
      return res.status(400).json({ message: 'trainerId is required' });
    }

    const { member, trainer } = await assignTrainerToMember(req.params.memberId, trainerId);

    const updatedMember = await User.findById(member._id)
      .select('-password')
      .populate('membershipPlan', 'name')
      .populate('assignedTrainer', 'name email');

    res.json({
      message: 'Trainer assigned successfully',
      member: updatedMember,
      trainer: trainer
        ? {
            _id: trainer._id,
            name: trainer.name,
            email: trainer.email,
          }
        : null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// Delete a user (Admin only)
router.delete('/users/:id', auth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (admin.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete users' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
