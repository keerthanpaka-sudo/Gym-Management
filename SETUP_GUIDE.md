# MERN Gym Management System - Setup Guide

## ✅ Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas connection)
- npm or yarn

## 🚀 Setup Instructions

### 1. **Backend Setup**

```bash
# Navigate to backend directory
cd Backend

# Install dependencies
npm install

# Create .env file in Backend directory
# Add the following:
MONGODB_URI=mongodb://localhost:27017/gym-management
JWT_SECRET=your_jwt_secret_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
PORT=5000
```

### 2. **Seed Database with Test Users**

```bash
# From Backend directory
npm run seed
# or
node seed.js
```

**Test Credentials Generated:**
- **Admin**: admin@test.com / admin123
- **Trainer**: trainer@test.com / trainer123
- **Member**: member@test.com / member123

### 3. **Start Backend Server**

```bash
# From Backend directory
npm start
# Server will run on http://localhost:5000
```

### 4. **Frontend Setup**

```bash
# Navigate to frontend directory
cd Frontend

# Install dependencies
npm install

# Create .env file in Frontend directory
# Add the following:
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key_here
REACT_APP_ENV=development
```

### 5. **Start Frontend Server**

```bash
# From Frontend directory
npm start
# App will open at http://localhost:3000
```

## 📋 Testing the Application

### Login Flow
1. Go to `http://localhost:3000`
2. Click on "Login"
3. Use any of the test credentials above
4. You'll be redirected to your respective dashboard

### Access Different Dashboards

**Admin Dashboard:** `http://localhost:3000/admin`
- User Management
- Program Management
- Nutrition Plans
- Progress Tracking
- Live Classes
- Community

**Trainer Dashboard:** `http://localhost:3000/trainer`
- Overview
- Manage Bookings
- My Members
- Nutrition Plans
- Member Progress
- Live Classes
- Community

**Member Dashboard:** `http://localhost:3000/member`
- Overview
- Bookings
- Attendance
- Payments
- Nutrition
- Progress
- Live Classes
- Community

## 🔧 Troubleshooting

### Error: "Failed to fetch data"
**Solution:** Make sure:
1. Backend server is running on port 5000
2. MongoDB is running
3. Check `.env` file has correct URLs
4. Check browser console for specific error messages

### Error: "Cannot find module 'react-scripts'"
**Solution:**
```bash
cd Frontend
npm install react-scripts
npm start
```

### Port Already in Use
**Solution:**
```bash
# Kill process on port 5000 (Backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000 (Frontend)
lsof -ti:3000 | xargs kill -9
```

### MongoDB Connection Error
**Solution:**
```bash
# Start MongoDB
mongod

# Or use MongoDB Atlas connection string
# Update MONGODB_URI in Backend/.env
```

## 🔑 API Endpoints

All API endpoints are configured in: `Frontend/src/config/apiConfig.js`

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/users` - Get all users (admin only)

### Programs
- `GET /api/programs` - Get all programs
- `POST /api/programs` - Create program (trainer/admin)
- `PUT /api/programs/:id` - Update program
- `DELETE /api/programs/:id` - Delete program

### Nutrition
- `GET /api/nutrition` - Get nutrition plans
- `POST /api/nutrition` - Create nutrition plan
- `PUT /api/nutrition/:id` - Update nutrition plan
- `DELETE /api/nutrition/:id` - Delete nutrition plan
- `POST /api/nutrition/:id/log` - Log nutrition intake

### Progress
- `GET /api/progress` - Get progress entries
- `POST /api/progress` - Create progress entry
- `PUT /api/progress/:id` - Update progress entry
- `GET /api/progress/stats/:userId` - Get progress statistics

### Live Classes
- `GET /api/live-classes` - Get live classes
- `POST /api/live-classes` - Create live class
- `POST /api/live-classes/:id/join` - Join live class
- `POST /api/live-classes/:id/leave` - Leave live class
- `POST /api/live-classes/:id/start` - Start live class
- `POST /api/live-classes/:id/end` - End live class

### Community
- `GET /api/community` - Get community posts
- `POST /api/community` - Create post
- `POST /api/community/:id/like` - Like post
- `POST /api/community/:id/comments` - Add comment
- `POST /api/community/:id/comments/:commentId/like` - Like comment

### Workout Plans
- `GET /api/workout-plans` - Get workout plans
- `POST /api/workout-plans` - Create workout plan
- `POST /api/workout-plans/:id/log-workout` - Log workout
- `GET /api/workout-plans/:id/progress` - Get workout progress

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## 📦 Features

✅ User Authentication (JWT)
✅ Role-based Access Control (Admin, Trainer, Member)
✅ Program Management
✅ Booking System
✅ Payment Processing (Stripe)
✅ QR Code Attendance
✅ Media Upload (Cloudinary)
✅ Nutrition Planning
✅ Progress Tracking
✅ Live Classes
✅ Community Features
✅ Workout Plans
✅ Notification System

## 🎨 Frontend Technologies
- React
- React Router
- Axios
- Framer Motion
- React Icons
- React Toastify
- Stripe React

## 🔌 Backend Technologies
- Node.js
- Express
- MongoDB
- Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- Multer (file upload)
- Cloudinary
- Stripe

## 📝 Notes

1. **First Time Setup:** Run `npm run seed` to populate test data
2. **CORS:** Already configured in Backend (accepts localhost:3000)
3. **Environment Variables:** Make sure all `.env` files are properly configured
4. **Hot Reload:** Both frontend and backend support hot module reloading
5. **API Base URL:** Configure in `Frontend/.env` if backend is on different URL

## 🆘 Getting Help

If you encounter issues:
1. Check the terminal output for specific error messages
2. Verify all prerequisites are installed
3. Check `.env` files are correctly configured
4. Make sure both backend and frontend are running
5. Clear browser cache/cookies if having login issues

## 🚀 Deployment

For production deployment:
1. Setup MongoDB Atlas
2. Configure environment variables
3. Build frontend: `npm run build`
4. Deploy backend to hosting service (Render, Heroku, etc.)
5. Deploy frontend to hosting service (Vercel, Netlify, etc.)

---

Happy coding! 🎉