const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const MembershipPlan = require('../models/MembershipPlan');
const Program = require('../models/Program');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for seeding');

    // Clear existing data (optional - comment out if you want to keep data)
    // await User.deleteMany({});
    // await MembershipPlan.deleteMany({});
    // await Program.deleteMany({});

    // Create Admin User
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.findOneAndUpdate(
      { email: 'admin@test.com' },
      {
        name: 'Admin User',
        email: 'admin@test.com',
        password: adminPassword,
        role: 'admin',
        phone: '9999999999',
        age: 30,
        gender: 'male',
      },
      { upsert: true, new: true }
    );
    console.log('✓ Admin user created:', admin.email);

    // Create Trainer User
    const trainerPassword = await bcrypt.hash('trainer123', 10);
    const trainer = await User.findOneAndUpdate(
      { email: 'trainer@test.com' },
      {
        name: 'John Trainer',
        email: 'trainer@test.com',
        password: trainerPassword,
        role: 'trainer',
        phone: '9876543210',
        age: 28,
        gender: 'male',
        bio: 'Certified Fitness Trainer with 5+ years experience',
        specialization: ['Weight Loss', 'Muscle Gain', 'Strength Training'],
      },
      { upsert: true, new: true }
    );
    console.log('✓ Trainer user created:', trainer.email);

    // Create Member User
    const memberPassword = await bcrypt.hash('member123', 10);
    const member = await User.findOneAndUpdate(
      { email: 'member@test.com' },
      {
        name: 'John Member',
        email: 'member@test.com',
        password: memberPassword,
        role: 'member',
        phone: '9111111111',
        age: 25,
        gender: 'male',
      },
      { upsert: true, new: true }
    );
    console.log('✓ Member user created:', member.email);

    // Create Membership Plans
    const basicPlan = await MembershipPlan.findOneAndUpdate(
      { name: 'Basic' },
      {
        name: 'Basic',
        description: 'Perfect for beginners',
        price: 1999,
        duration: 30,
        maxSessions: 8,
        features: ['Access to gym', 'Basic equipment', 'Open hours access'],
        category: 'basic',
        billingCycle: 'monthly',
        trialDays: 7,
      },
      { upsert: true, new: true }
    );
    console.log('✓ Basic plan created');

    const premiumPlan = await MembershipPlan.findOneAndUpdate(
      { name: 'Premium' },
      {
        name: 'Premium',
        description: 'Unlimited access with trainer support',
        price: 4999,
        duration: 30,
        maxSessions: -1,
        features: [
          'Unlimited gym access',
          'All equipment',
          'Trainer consultation',
          'Nutrition guidance',
          '24/7 access',
        ],
        category: 'premium',
        billingCycle: 'monthly',
        trialDays: 14,
      },
      { upsert: true, new: true }
    );
    console.log('✓ Premium plan created');

    const monthlyMembership = await MembershipPlan.findOneAndUpdate(
      { name: 'Monthly Membership' },
      {
        name: 'Monthly Membership',
        description: 'Perfect for short-term access with full gym and class privileges.',
        price: 2500,
        duration: 1,
        features: [
          'Unlimited gym access',
          'Group classes',
          'Weekly progress support',
        ],
        category: 'basic',
        billingCycle: 'monthly',
        trialDays: 7,
        popular: false,
      },
      { upsert: true, new: true }
    );
    console.log('✓ Monthly Membership created');

    const quarterlyMembership = await MembershipPlan.findOneAndUpdate(
      { name: '3-Month Membership' },
      {
        name: '3-Month Membership',
        description: 'Best value for a stronger fitness routine and steady progress.',
        price: 6500,
        duration: 3,
        features: [
          'Unlimited gym access',
          'Group classes',
          'Monthly trainer check-in',
          'Free nutrition guide',
        ],
        category: 'premium',
        billingCycle: 'quarterly',
        trialDays: 14,
        popular: true,
      },
      { upsert: true, new: true }
    );
    console.log('✓ 3-Month Membership created');

    const annualMembership = await MembershipPlan.findOneAndUpdate(
      { name: 'Annual Membership' },
      {
        name: 'Annual Membership',
        description: 'Maximum savings for long-term fitness and premium support.',
        price: 22500,
        duration: 12,
        features: [
          'Unlimited gym access',
          'All classes included',
          'Personalized trainer plan',
          'Priority support',
        ],
        category: 'elite',
        billingCycle: 'yearly',
        trialDays: 14,
        popular: false,
      },
      { upsert: true, new: true }
    );
    console.log('✓ Annual Membership created');

    // Create Sample Programs
    const program1 = await Program.findOneAndUpdate(
      { title: 'Full Body Strength Ritual' },
      {
        title: 'Full Body Strength Ritual',
        description: 'A cult-inspired strength program with guided video tutorials, progressive workouts, and a powerful community experience.',
        category: 'strength',
        type: 'on-demand',
        difficulty: 'intermediate',
        duration: 8,
        instructor: trainer._id,
        maxParticipants: 20,
        price: 799,
        images: [
          'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?auto=format&fit=crop&w=900&q=80',
        ],
        videos: ['https://www.youtube.com/embed/dJlFmxiL11s?rel=0'],
        exercises: [
          { name: 'Deadlift', sets: 4, reps: 8, duration: 60, description: 'Build raw power and proper deadlift form', videoUrl: 'https://www.youtube.com/embed/ytGaGIn3SjE' },
          { name: 'Barbell Squat', sets: 4, reps: 10, duration: 60, description: 'Develop lower body strength with controlled reps', videoUrl: 'https://www.youtube.com/embed/ultWZbUMPL8' },
          { name: 'Overhead Press', sets: 3, reps: 12, duration: 45, description: 'Build shoulder strength and stability', videoUrl: 'https://www.youtube.com/embed/2yjwXTZQDDI' },
        ],
        tags: ['cult-style', 'strength', 'full body'],
        benefits: ['Build muscle', 'Increase endurance', 'Improve mobility'],
        equipment: ['Barbell', 'Dumbbells', 'Bench'],
        schedule: [
          { day: 'monday', startTime: '18:00', endTime: '18:45' },
          { day: 'wednesday', startTime: '18:00', endTime: '18:45' },
          { day: 'friday', startTime: '18:00', endTime: '18:45' },
        ],
        createdBy: trainer._id,
      },
      { upsert: true, new: true }
    );
    console.log('✓ Program 1 created');

    const program2 = await Program.findOneAndUpdate(
      { title: 'Cult HIIT Burn' },
      {
        title: 'Cult HIIT Burn',
        description: 'High-intensity interval training with intro videos and motivational coaching cues for a powerful calorie burn.',
        category: 'hiit',
        type: 'live',
        difficulty: 'advanced',
        duration: 6,
        instructor: trainer._id,
        maxParticipants: 25,
        price: 699,
        images: [
          'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1517960413843-0aee8e2b5a12?auto=format&fit=crop&w=900&q=80',
        ],
        videos: ['https://www.youtube.com/embed/UItWltVZZmE?rel=0'],
        exercises: [
          { name: 'Jump Squats', sets: 5, reps: 15, duration: 40, description: 'Powerful jumps to spike heart rate and tone legs', videoUrl: 'https://www.youtube.com/embed/9p0KnWOp36c' },
          { name: 'Mountain Climbers', sets: 4, reps: 30, duration: 40, description: 'Core and cardio in one fast-paced movement', videoUrl: 'https://www.youtube.com/embed/nq2QST4AuBM' },
          { name: 'Burpees', sets: 4, reps: 12, duration: 45, description: 'Full-body conditioning exercise that builds strength and agility', videoUrl: 'https://www.youtube.com/embed/Qm2sU8v-maY' },
        ],
        tags: ['hiit', 'conditioning', 'cult-style'],
        benefits: ['Fat loss', 'Conditioning', 'Explosive power'],
        equipment: ['Mat', 'Bodyweight'],
        schedule: [
          { day: 'tuesday', startTime: '19:00', endTime: '19:45' },
          { day: 'thursday', startTime: '19:00', endTime: '19:45' },
          { day: 'saturday', startTime: '10:00', endTime: '10:45' },
        ],
        createdBy: trainer._id,
      },
      { upsert: true, new: true }
    );
    console.log('✓ Program 2 created');

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('');
    console.log('Admin:');
    console.log('  Email: admin@test.com');
    console.log('  Password: admin123');
    console.log('');
    console.log('Trainer:');
    console.log('  Email: trainer@test.com');
    console.log('  Password: trainer123');
    console.log('');
    console.log('Member:');
    console.log('  Email: member@test.com');
    console.log('  Password: member123');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedDatabase();