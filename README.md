# Gym Management System

A full-stack MERN application for managing gym operations including user authentication, trainer bookings, payments, attendance tracking, and fitness programs.

## Features

### Backend (Node.js + Express + MongoDB)
- **Authentication**: JWT-based login/register for Admin, Member, and Trainer roles
- **Payments**: Stripe integration for membership plans
- **Bookings**: Trainer slot booking system
- **Attendance**: QR code generation and scanning
- **Media**: Upload images/videos with multer + Cloudinary
- **Programs**: CRUD operations for fitness programs

### Frontend (React)
- **Landing Page**: Hero section with animations
- **Auth Pages**: Login/Register with role-based routing
- **Dashboards**:
  - Admin: Manage trainers, members, and plans
  - Member: View bookings, attendance, and payments
  - Trainer: Manage assigned members and slots
- **Payments Page**: Stripe checkout integration
- **Booking Page**: Slot selection with Google Maps
- **Attendance Page**: QR scanner
- **Programs Page**: Display fitness programs with media

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Stripe for payments
- Cloudinary for media storage
- QRCode for attendance
- Multer for file uploads

### Frontend
- React
- React Router for routing
- Axios for API calls
- Stripe Elements for payments
- React QR Scanner for attendance
- Framer Motion for animations
- React Toastify for notifications

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup

1. Navigate to the Backend directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the Backend directory with the following variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/gym-management
   JWT_SECRET=your_jwt_secret_here
   STRIPE_SECRET_KEY=your_stripe_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the Frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the Frontend directory:
   ```
   REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

4. Start the React development server:
   ```bash
   npm start
   ```

   The app will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Programs
- `GET /api/programs` - Get all programs
- `GET /api/programs/:id` - Get single program
- `POST /api/programs` - Create program (Admin/Trainer)
- `PUT /api/programs/:id` - Update program
- `DELETE /api/programs/:id` - Delete program

### Bookings
- `GET /api/bookings` - Get user's bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking status
- `DELETE /api/bookings/:id` - Cancel booking

### Payments
- `GET /api/payments/plans` - Get membership plans
- `POST /api/payments/create-payment-intent` - Create payment intent
- `POST /api/payments/confirm-payment` - Confirm payment

### Attendance
- `POST /api/attendance/generate-qr` - Generate QR code
- `POST /api/attendance/mark-attendance` - Mark attendance
- `GET /api/attendance` - Get attendance records
- `PUT /api/attendance/checkout/:id` - Check out

### Media
- `POST /api/media/upload` - Upload single file
- `POST /api/media/upload-multiple` - Upload multiple files
- `DELETE /api/media/delete/:public_id` - Delete file

## Project Structure

```
gym-management/
├── Backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Program.js
│   │   ├── Booking.js
│   │   ├── Attendance.js
│   │   └── MembershipPlan.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── programs.js
│   │   ├── bookings.js
│   │   ├── payments.js
│   │   ├── attendance.js
│   │   └── media.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── package.json
│   └── .env
└── Frontend/
    ├── src/
    │   ├── components/
    │   │   └── ProtectedRoute.js
    │   ├── pages/
    │   │   ├── LandingPage.js
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── AdminDashboard.js
    │   │   ├── MemberDashboard.js
    │   │   ├── TrainerDashboard.js
    │   │   ├── Programs.js
    │   │   ├── Bookings.js
    │   │   ├── Payments.js
    │   │   └── Attendance.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── public/
    │   ├── index.html
    │   └── manifest.json
    └── package.json
```

## Usage

1. Register as a user (Member, Trainer, or Admin)
2. Login with your credentials
3. Access role-specific dashboards
4. Book trainer sessions
5. Make payments for membership plans
6. Generate/scan QR codes for attendance
7. View and enroll in fitness programs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.