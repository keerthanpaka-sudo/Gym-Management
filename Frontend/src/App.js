import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import MemberDashboard from './pages/MemberDashboard';
import TrainerDashboard from './pages/TrainerDashboard';
import Programs from './pages/Programs';
import Bookings from './pages/Bookings';
import Payments from './pages/Payments';
import Membership from './pages/Membership';
import Attendance from './pages/Attendance';
import NutritionDashboard from './components/NutritionDashboardV2';
import ProgressDashboard from './components/ProgressDashboard';
import LiveClasses from './components/LiveClasses';
import Community from './components/Community';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/programs" element={<Programs />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/member/*"
          element={
            <ProtectedRoute allowedRoles={['member']}>
              <MemberDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/*"
          element={
            <ProtectedRoute allowedRoles={['trainer']}>
              <TrainerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute allowedRoles={['member']}>
              <Bookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute allowedRoles={['member']}>
              <Payments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/membership"
          element={
            <ProtectedRoute allowedRoles={['member', 'admin']}>
              <Membership />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute allowedRoles={['member', 'trainer']}>
              <Attendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nutrition"
          element={
            <ProtectedRoute allowedRoles={['member', 'trainer']}>
              <NutritionDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute allowedRoles={['member', 'trainer']}>
              <ProgressDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/live-classes"
          element={
            <ProtectedRoute allowedRoles={['member', 'trainer']}>
              <LiveClasses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community"
          element={
            <ProtectedRoute allowedRoles={['member', 'trainer', 'admin']}>
              <Community />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
