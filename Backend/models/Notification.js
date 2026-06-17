const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: [
      'booking_confirmed',
      'booking_cancelled',
      'class_reminder',
      'payment_success',
      'payment_failed',
      'membership_expiring',
      'achievement_unlocked',
      'new_message',
      'live_class_starting',
      'nutrition_plan_update',
      'progress_milestone',
      'system_announcement'
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // Additional data for the notification
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: Date,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  channels: [{
    type: String,
    enum: ['in_app', 'email', 'push'],
    default: ['in_app'],
  }],
  expiresAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', notificationSchema);