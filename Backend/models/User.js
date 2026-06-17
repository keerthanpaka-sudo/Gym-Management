const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'member', 'trainer'],
    default: 'member',
  },
  profileImage: {
    type: String,
  },
  membershipPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MembershipPlan',
  },
  membershipStartDate: {
    type: Date,
  },
  membershipEndDate: {
    type: Date,
  },
  membershipCenter: {
    type: String,
  },
  assignedTrainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  assignedMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema);
