const express = require('express');
const Attendance = require('../models/Attendance');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Generate QR code for attendance
router.post('/generate-qr', auth, async (req, res) => {
  try {
    const qrData = JSON.stringify({
      userId: req.user.id,
      timestamp: Date.now(),
    });

    res.json({ qrCode: qrData });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark attendance (scan QR)
router.post('/mark-attendance', auth, async (req, res) => {
  const { qrData } = req.body;

  try {
    const parsedData = JSON.parse(qrData);
    const { userId } = parsedData;

    // Check if attendance already marked today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingAttendance = await Attendance.findOne({
      user: userId,
      checkInTime: { $gte: today, $lt: tomorrow },
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already marked for today' });
    }

    const now = new Date();
    const attendance = new Attendance({
      user: userId,
      date: now,
      checkInTime: now,
      qrCode: qrData,
      status: 'present',
    });

    await attendance.save();
    res.json({ message: 'Attendance marked successfully', attendance });
  } catch (err) {
    console.error('Attendance error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's attendance records
router.get('/', auth, async (req, res) => {
  try {
    const attendance = await Attendance.find({ user: req.user.id }).sort({ date: -1 });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Check out (optional)
router.put('/checkout/:id', auth, async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    if (attendance.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    attendance.checkOutTime = new Date();
    await attendance.save();

    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;