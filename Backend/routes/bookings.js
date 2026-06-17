const express = require('express');
const Booking = require('../models/Booking');
const { auth, roleAuth } = require('../middleware/auth');

const router = express.Router();

// Get user's bookings
router.get('/', auth, async (req, res) => {
  try {
    let bookings;
    if (req.user.role === 'member') {
      bookings = await Booking.find({ member: req.user.id })
        .populate('trainer', 'name')
        .sort({ date: -1 });
    } else if (req.user.role === 'trainer') {
      bookings = await Booking.find({ trainer: req.user.id })
        .populate('member', 'name')
        .sort({ date: -1 });
    } else {
      // Admin can see all
      bookings = await Booking.find()
        .populate('member', 'name')
        .populate('trainer', 'name')
        .sort({ date: -1 });
    }
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create booking
router.post('/', auth, roleAuth(['member']), async (req, res) => {
  const { trainer, date, timeSlot, notes } = req.body;

  try {
    const booking = new Booking({
      member: req.user.id,
      trainer,
      date,
      timeSlot,
      notes,
    });

    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking status (Trainer/Admin)
router.put('/:id', auth, roleAuth(['trainer', 'admin']), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (req.user.role === 'trainer' && booking.trainer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedBooking);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete booking
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.member.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;