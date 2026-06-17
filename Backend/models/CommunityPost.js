const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['post', 'question', 'achievement', 'workout', 'nutrition'],
    default: 'post',
  },
  media: [{
    type: {
      type: String,
      enum: ['image', 'video'],
    },
    url: String,
    publicId: String,
  }],
  tags: [{
    type: String,
  }],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    content: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    likes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
  }],
  isPinned: {
    type: Boolean,
    default: false,
  },
  isApproved: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes
communityPostSchema.index({ createdAt: -1 });
communityPostSchema.index({ author: 1, createdAt: -1 });
communityPostSchema.index({ tags: 1 });

module.exports = mongoose.model('CommunityPost', communityPostSchema);