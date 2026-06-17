const mongoose = require('mongoose');

const membershipPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  originalPrice: {
    type: Number,
  },
  duration: {
    type: Number, // in months
    required: true,
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
    default: 'monthly',
  },
  features: [{
    type: String,
  }],
  inclusions: [{
    name: String,
    type: {
      type: String,
      enum: ['unlimited', 'limited', 'included', 'not_included'],
    },
    limit: Number, // for limited types
  }],
  category: {
    type: String,
    enum: ['basic', 'premium', 'elite', 'family'],
    default: 'basic',
  },
  popular: {
    type: Boolean,
    default: false,
  },
  stripePriceId: {
    type: String,
  },
  razorpayPlanId: {
    type: String,
  },
  maxMembers: {
    type: Number, // for family plans
    default: 1,
  },
  trialDays: {
    type: Number,
    default: 0,
  },
  image: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('MembershipPlan', membershipPlanSchema);