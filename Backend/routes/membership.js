const express = require('express');
const { auth } = require('../middleware/auth');
const MembershipPlan = require('../models/MembershipPlan');
const User = require('../models/User');
const {
  assignTrainerToMember,
  unassignTrainerFromMember,
} = require('../utils/trainerAssignment');

const router = express.Router();

// Get all membership plans
router.get('/plans', async (req, res) => {
  try {
    const plans = await MembershipPlan.find();
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get single membership plan
router.get('/plans/:id', async (req, res) => {
  try {
    const plan = await MembershipPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create membership plan (admin only)
router.post('/plans', auth, async (req, res) => {
  try {
    const { name, description, price, duration, features } = req.body;
    
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create plans' });
    }

    const plan = new MembershipPlan({
      name,
      description,
      price,
      duration,
      features: typeof features === 'string' ? features.split(',') : features,
    });

    await plan.save();
    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update membership plan (admin only)
router.put('/plans/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update plans' });
    }

    const plan = await MembershipPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete membership plan (admin only)
router.delete('/plans/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete plans' });
    }

    const plan = await MembershipPlan.findByIdAndDelete(req.params.id);
    
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    
    res.json({ message: 'Plan deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get current user's membership
router.get('/my', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('membershipPlan')
      .populate('assignedTrainer', 'name email');
    if (!user?.membershipPlan) {
      return res.status(404).json({ message: 'No active membership' });
    }

    const isExpired = user.membershipEndDate ? new Date(user.membershipEndDate) < new Date() : false;

    res.json({
      planId: user.membershipPlan._id,
      planName: user.membershipPlan.name,
      price: user.membershipPlan.price,
      duration: user.membershipPlan.duration,
      features: user.membershipPlan.features || [],
      startDate: user.membershipStartDate,
      expiryDate: user.membershipEndDate,
      center: user.membershipCenter || '',
      assignedTrainer: user.assignedTrainer || null,
      status: isExpired ? 'expired' : 'active',
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Join membership
router.post('/join', auth, async (req, res) => {
  try {
    const { planId } = req.body;
    
    const plan = await MembershipPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const user = await User.findById(req.user.id);
    user.membershipPlan = planId;
    user.membershipStartDate = new Date();
    
    // Calculate end date
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.duration);
    user.membershipEndDate = endDate;

    await user.save();
    const { trainer } = await assignTrainerToMember(user._id);
    
    res.json({ message: 'Membership joined successfully', user, assignedTrainer: trainer || null });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Cancel membership
router.post('/cancel', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.membershipPlan = null;
    user.membershipStartDate = null;
    user.membershipEndDate = null;
    user.membershipCenter = '';
    
    await user.save();
    await unassignTrainerFromMember(user._id);
    
    res.json({ message: 'Membership cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
