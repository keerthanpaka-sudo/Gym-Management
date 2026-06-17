const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/programs', require('./routes/programs'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/media', require('./routes/media'));
app.use('/api/nutrition', require('./routes/nutrition'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/live-classes', require('./routes/liveClasses'));
app.use('/api/community', require('./routes/community'));
app.use('/api/workout-plans', require('./routes/workoutPlans'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/membership', require('./routes/membership'));
app.use('/api/membership-plans', require('./routes/membership'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));