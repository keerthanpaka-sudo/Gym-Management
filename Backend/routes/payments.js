const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const MembershipPlan = require('../models/MembershipPlan');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { assignTrainerToMember } = require('../utils/trainerAssignment');

const router = express.Router();

const GYM_CENTERS = [
  { id: 'downtown', name: 'FitZone Downtown', fee: 0 },
  { id: 'uptown', name: 'FitZone Uptown', fee: 500 },
  { id: 'parkside', name: 'FitZone Parkside', fee: 300 },
];

// Get membership plans
router.get('/plans', async (req, res) => {
  try {
    const plans = await MembershipPlan.find();
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create payment intent
router.post('/create-payment-intent', auth, async (req, res) => {
  const { planId, centerId } = req.body;

  try {
    const plan = await MembershipPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const center = GYM_CENTERS.find((item) => item.id === centerId) || GYM_CENTERS[0];
    const totalAmount = (plan.price + (center?.fee || 0)) * 100; // amount in paise for INR

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'inr',
      metadata: {
        userId: req.user.id,
        planId: plan._id.toString(),
        centerId: center.id,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: totalAmount,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Confirm payment and update user membership
router.post('/confirm-payment', auth, async (req, res) => {
  const { paymentIntentId, planId, centerId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      const plan = await MembershipPlan.findById(planId);
      if (!plan) {
        return res.status(404).json({ message: 'Plan not found' });
      }

      const user = await User.findById(req.user.id);
      user.membershipPlan = planId;
      user.membershipCenter = GYM_CENTERS.find((item) => item.id === centerId)?.name || '';
      user.membershipStartDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + plan.duration);
      user.membershipEndDate = endDate;
      await user.save();

      const { trainer } = await assignTrainerToMember(user._id);

      res.json({
        message: 'Payment confirmed and membership updated',
        assignedTrainer: trainer
          ? {
              _id: trainer._id,
              name: trainer.name,
              email: trainer.email,
            }
          : null,
      });
    } else {
      res.status(400).json({ message: 'Payment not successful' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Webhook for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    // Handle successful payment
    console.log('Payment succeeded:', paymentIntent.id);
  }

  res.json({ received: true });
});

module.exports = router;
