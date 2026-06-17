import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import {
  FaCalendarCheck,
  FaChartLine,
  FaClipboardCheck,
  FaCreditCard,
  FaDumbbell,
  FaFireAlt,
  FaLeaf,
  FaShieldAlt,
  FaSignOutAlt,
  FaUsers,
  FaVideo
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/apiConfig';
import Programs from './Programs';
import NutritionDashboard from '../components/NutritionDashboardV2';
import './MemberDashboard.css';

const MemberDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [payments, setPayments] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchBookings();
    fetchAttendance();
    fetchPayments();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(API_ENDPOINTS.BOOKINGS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setBookings([]);
    }
  };

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(API_ENDPOINTS.ATTENDANCE, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendance(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setAttendance([]);
    }
  };

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(API_ENDPOINTS.PAYMENTS_HISTORY, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setPayments([]);
    }
  };

  const overviewStats = useMemo(() => {
    const now = new Date();
    const upcomingBookings = bookings.filter((booking) => new Date(booking.date) > now);
    const attendanceThisMonth = attendance.filter((record) => {
      const attendanceDate = new Date(record.date);
      return attendanceDate.getMonth() === now.getMonth() && attendanceDate.getFullYear() === now.getFullYear();
    });
    const totalPayments = payments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
    const nextBooking = [...upcomingBookings].sort((a, b) => new Date(a.date) - new Date(b.date))[0];

    return {
      upcomingBookings,
      attendanceThisMonth,
      totalPayments,
      nextBooking
    };
  }, [attendance, bookings, payments]);

  const quickLinks = [
    { to: '/bookings', icon: <FaCalendarCheck />, label: 'Manage Bookings', description: 'Review and reserve upcoming sessions' },
    { to: '/attendance', icon: <FaClipboardCheck />, label: 'Attendance', description: 'Track check-ins and visit history' },
    { to: '/payments', icon: <FaCreditCard />, label: 'Payments', description: 'View plans and payment records' },
    { to: '/membership', icon: <FaShieldAlt />, label: 'Membership', description: 'Check active plan and plan options' },
    { to: '/member/programs', icon: <FaDumbbell />, label: 'Programs', description: 'Explore structured workout plans' },
    { to: '/member/nutrition', icon: <FaLeaf />, label: 'Nutrition', description: 'Check your nutrition guidance' },
    { to: '/progress', icon: <FaChartLine />, label: 'Progress', description: 'Monitor your overall progress' },
    { to: '/live-classes', icon: <FaVideo />, label: 'Live Classes', description: 'Join live and recorded sessions' },
    { to: '/community', icon: <FaUsers />, label: 'Community', description: 'Connect with other members' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="member-dashboard">
      <aside className="member-sidebar">
        <div className="member-brand">
          <span className="member-brand-mark">FH</span>
          <div>
            <h2>FitHub Member</h2>
            <p>Premium Fitness Workspace</p>
          </div>
        </div>

        <nav className="member-nav">
          <NavLink to="/member" end className={({ isActive }) => `member-nav-link ${isActive ? 'active' : ''}`}>
            Overview
          </NavLink>
          <NavLink to="/bookings" className={({ isActive }) => `member-nav-link ${isActive ? 'active' : ''}`}>
            My Bookings
          </NavLink>
          <NavLink to="/attendance" className={({ isActive }) => `member-nav-link ${isActive ? 'active' : ''}`}>
            Attendance
          </NavLink>
          <NavLink to="/payments" className={({ isActive }) => `member-nav-link ${isActive ? 'active' : ''}`}>
            Payments
          </NavLink>
          <NavLink to="/membership" className={({ isActive }) => `member-nav-link ${isActive ? 'active' : ''}`}>
            Membership
          </NavLink>
          <NavLink to="/member/programs" className={({ isActive }) => `member-nav-link ${isActive ? 'active' : ''}`}>
            Programs
          </NavLink>
          <NavLink to="/member/nutrition" className={({ isActive }) => `member-nav-link ${isActive ? 'active' : ''}`}>
            Nutrition
          </NavLink>
          <NavLink to="/progress" className={({ isActive }) => `member-nav-link ${isActive ? 'active' : ''}`}>
            Progress
          </NavLink>
          <NavLink to="/live-classes" className={({ isActive }) => `member-nav-link ${isActive ? 'active' : ''}`}>
            Live Classes
          </NavLink>
          <NavLink to="/community" className={({ isActive }) => `member-nav-link ${isActive ? 'active' : ''}`}>
            Community
          </NavLink>
        </nav>

        <button onClick={handleLogout} className="member-logout-btn">
          <FaSignOutAlt /> Logout
        </button>
      </aside>

      <main className="member-content">
        <Routes>
          <Route
            path="/"
            element={
              <motion.div 
                className="member-overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <section className="member-hero">
                  <div className="member-hero-copy">
                    <span className="member-eyebrow">Welcome Back</span>
                    <h1>{user.name ? `${user.name}, keep your momentum going.` : 'Your fitness journey starts here.'}</h1>
                    <p>
                      Track bookings, attendance, payments, and training progress from one polished member workspace.
                    </p>
                  </div>

                  <div className="member-highlight-card">
                    <div className="highlight-icon">
                      <FaFireAlt />
                    </div>
                    <div>
                      <h3>Next Workout Focus</h3>
                      <p>
                        {overviewStats.nextBooking
                          ? `Upcoming booking on ${new Date(overviewStats.nextBooking.date).toLocaleDateString()}`
                          : 'Plan your next booking to stay consistent this week.'}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="member-stats-grid">
                  <div className="member-stat-card">
                    <span className="stat-label">Upcoming Bookings</span>
                    <strong>{overviewStats.upcomingBookings.length}</strong>
                    <p>Sessions already planned ahead</p>
                  </div>
                  <div className="member-stat-card">
                    <span className="stat-label">Attendance This Month</span>
                    <strong>{overviewStats.attendanceThisMonth.length}</strong>
                    <p>Visits recorded in the current month</p>
                  </div>
                  <div className="member-stat-card">
                    <span className="stat-label">Total Payments</span>
                    <strong>Rs. {overviewStats.totalPayments || 0}</strong>
                    <p>Amount paid across your membership history</p>
                  </div>
                </section>

                <section className="member-panels">
                  <div className="member-panel">
                    <div className="panel-heading">
                      <h3>Quick Access</h3>
                      <p>Jump straight into the most-used member tools.</p>
                    </div>
                    <div className="quick-link-grid">
                      {quickLinks.map((item) => (
                        <button
                          key={item.to}
                          className="quick-link-card"
                          onClick={() => navigate(item.to)}
                        >
                          <span className="quick-link-icon">{item.icon}</span>
                          <strong>{item.label}</strong>
                          <span>{item.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="member-panel">
                    <div className="panel-heading">
                      <h3>Recent Activity</h3>
                      <p>A quick pulse check on your current member account.</p>
                    </div>

                    <div className="activity-list">
                      <div className="activity-item">
                        <strong>Bookings</strong>
                        <span>
                          {overviewStats.nextBooking
                            ? `Next session on ${new Date(overviewStats.nextBooking.date).toLocaleDateString()}`
                            : 'No upcoming bookings yet'}
                        </span>
                      </div>
                      <div className="activity-item">
                        <strong>Attendance</strong>
                        <span>
                          {attendance.length
                            ? `Latest visit on ${new Date(attendance[0].date).toLocaleDateString()}`
                            : 'No attendance records yet'}
                        </span>
                      </div>
                      <div className="activity-item">
                        <strong>Payments</strong>
                        <span>
                          {payments.length
                            ? `${payments.length} payment record(s) available`
                            : 'No payment history available'}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>
              </motion.div>
            }
          />
          <Route path="programs" element={<Programs />} />
          <Route path="nutrition" element={<NutritionDashboard />} />
        </Routes>
      </main>
    </div>
  );
};

export default MemberDashboard;
