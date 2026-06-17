const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  checkInTime: {
    type: Date,
    default: Date.now,
  },
  checkOutTime: {
    type: Date,
  },
  qrCode: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['present', 'absent'],
    default: 'present',
  },
});

module.exports = mongoose.model('Attendance', attendanceSchema);