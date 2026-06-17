import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import {
  FaArrowRight,
  FaCalendarAlt,
  FaChartLine,
  FaClipboardCheck,
  FaClock,
  FaDumbbell,
  FaLeaf,
  FaSignOutAlt,
  FaUserCheck,
  FaUsers,
  FaVideo
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/apiConfig';
import './TrainerDashboard.css';

const getSafeArray = (value) => (Array.isArray(value) ? value : []);

const getDisplayName = (entity, fallback) => {
  if (!entity) {
    return fallback;
  }

  if (typeof entity === 'string') {
    return entity;
  }

  return entity.name || entity.fullName || entity.email || fallback;
};

const formatLongDate = (value) =>
  new Date(value).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

const formatShortDate = (value) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

const TrainerDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      await Promise.all([fetchBookings(), fetchAssignedMembers()]);
      setLoading(false);
    };

    loadDashboard();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(API_ENDPOINTS.BOOKINGS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(getSafeArray(res.data));
    } catch (err) {
      setBookings([]);
      toast.error('Failed to fetch trainer bookings');
    }
  };

  const fetchAssignedMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(API_ENDPOINTS.AUTH_ASSIGNED_MEMBERS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssignedMembers(getSafeArray(res.data));
    } catch (err) {
      setAssignedMembers([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const overview = useMemo(() => {
    const now = new Date();
    const todayKey = now.toDateString();

    const sortedBookings = [...bookings].sort((first, second) => new Date(first.date) - new Date(second.date));
    const todaySessions = sortedBookings.filter((booking) => new Date(booking.date).toDateString() === todayKey);
    const upcomingSessions = sortedBookings.filter((booking) => new Date(booking.date) >= now);
    const completedSessions = sortedBookings.filter((booking) => booking.status === 'completed');
    const activeMembers = assignedMembers.filter((member) => member.isActive !== false);
    const newestMembers = [...activeMembers].slice(0, 4);
    const nextSession = upcomingSessions[0] || null;

    return {
      totalBookings: sortedBookings.length,
      todaySessions,
      upcomingSessions,
      completedSessions,
      activeMembers,
      newestMembers,
      nextSession
    };
  }, [assignedMembers, bookings]);

  const quickActions = [
    {
      to: '/trainer/bookings',
      icon: <FaCalendarAlt />,
      title: 'Session Schedule',
      description: 'Review upcoming coaching sessions and booking flow.'
    },
    {
      to: '/trainer/members',
      icon: <FaUsers />,
      title: 'Member Roster',
      description: 'Open assigned member profiles and recent client details.'
    },
    {
      to: '/attendance',
      icon: <FaClipboardCheck />,
      title: 'Attendance Desk',
      description: 'Handle check-ins and monitor the live attendance desk.'
    },
    {
      to: '/nutrition',
      icon: <FaLeaf />,
      title: 'Nutrition Plans',
      description: 'Create and review meal planning support for members.'
    },
    {
      to: '/progress',
      icon: <FaChartLine />,
      title: 'Progress Tracking',
      description: 'Track transformation data and measurable milestones.'
    },
    {
      to: '/live-classes',
      icon: <FaVideo />,
      title: 'Live Classes',
      description: 'Manage class delivery and member engagement touchpoints.'
    }
  ];

  return (
    <div className="trainer-dashboard">
      <aside className="trainer-sidebar">
        <div className="trainer-brand">
          <span className="trainer-brand-mark">TP</span>
          <div>
            <h2>Trainer Portal</h2>
            <p>Professional coaching workspace</p>
          </div>
        </div>

        <nav className="trainer-nav">
          <NavLink to="/trainer" end className={({ isActive }) => `trainer-nav-link ${isActive ? 'active' : ''}`}>
            Overview
          </NavLink>
          <NavLink to="/trainer/bookings" className={({ isActive }) => `trainer-nav-link ${isActive ? 'active' : ''}`}>
            Session Schedule
          </NavLink>
          <NavLink to="/trainer/members" className={({ isActive }) => `trainer-nav-link ${isActive ? 'active' : ''}`}>
            Assigned Members
          </NavLink>
          <NavLink to="/attendance" className={({ isActive }) => `trainer-nav-link ${isActive ? 'active' : ''}`}>
            Attendance
          </NavLink>
          <NavLink to="/nutrition" className={({ isActive }) => `trainer-nav-link ${isActive ? 'active' : ''}`}>
            Nutrition
          </NavLink>
          <NavLink to="/progress" className={({ isActive }) => `trainer-nav-link ${isActive ? 'active' : ''}`}>
            Progress
          </NavLink>
          <NavLink to="/live-classes" className={({ isActive }) => `trainer-nav-link ${isActive ? 'active' : ''}`}>
            Live Classes
          </NavLink>
          <NavLink to="/community" className={({ isActive }) => `trainer-nav-link ${isActive ? 'active' : ''}`}>
            Community
          </NavLink>
        </nav>

        <button onClick={handleLogout} className="trainer-logout-btn">
          <FaSignOutAlt /> Logout
        </button>
      </aside>

      <main className="trainer-content">
        <Routes>
          <Route
            index
            element={
              <div className="trainer-overview">
                <section className="trainer-hero">
                  <div className="trainer-hero-copy">
                    <span className="trainer-eyebrow">Coaching Control Center</span>
                    <h1>
                      {user.name
                        ? `${user.name}, lead your members with a sharper daily workflow.`
                        : 'Lead every coaching day with a cleaner trainer workspace.'}
                    </h1>
                    <p>
                      Manage schedules, monitor client load, and stay on top of the most important coaching actions
                      from one professional dashboard.
                    </p>
                  </div>

                  <div className="trainer-highlight-card">
                    <div className="highlight-badge">
                      <FaClock />
                    </div>
                    <div>
                      <h3>Next Priority Session</h3>
                      <p>
                        {overview.nextSession
                          ? `${getDisplayName(overview.nextSession.member, 'Member')} on ${formatLongDate(overview.nextSession.date)} at ${overview.nextSession.timeSlot || 'Scheduled time'}`
                          : 'No upcoming sessions yet. Encourage members to reserve a new slot.'}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="trainer-stats-grid">
                  <div className="trainer-stat-card">
                    <span className="trainer-stat-label">Today&apos;s Sessions</span>
                    <strong>{overview.todaySessions.length}</strong>
                    <p>Appointments currently scheduled for today</p>
                  </div>
                  <div className="trainer-stat-card">
                    <span className="trainer-stat-label">Assigned Members</span>
                    <strong>{overview.activeMembers.length}</strong>
                    <p>Members currently attached to your coaching roster</p>
                  </div>
                  <div className="trainer-stat-card">
                    <span className="trainer-stat-label">Upcoming Sessions</span>
                    <strong>{overview.upcomingSessions.length}</strong>
                    <p>Future bookings that need preparation and follow-up</p>
                  </div>
                  <div className="trainer-stat-card">
                    <span className="trainer-stat-label">Completed Sessions</span>
                    <strong>{overview.completedSessions.length}</strong>
                    <p>Sessions already marked complete in the current account</p>
                  </div>
                </section>

                <section className="trainer-panels">
                  <div className="trainer-panel">
                    <div className="panel-heading">
                      <h3>Coach Actions</h3>
                      <p>Move quickly between the tools you rely on during an active training day.</p>
                    </div>

                    <div className="trainer-quick-grid">
                      {quickActions.map((item) => (
                        <button
                          key={item.to}
                          className="trainer-quick-card"
                          onClick={() => navigate(item.to)}
                        >
                          <span className="trainer-quick-icon">{item.icon}</span>
                          <strong>{item.title}</strong>
                          <span>{item.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="trainer-panel">
                    <div className="panel-heading">
                      <h3>Today&apos;s Flow</h3>
                      <p>Keep the next coaching steps visible without opening multiple screens.</p>
                    </div>

                    <div className="trainer-activity-list">
                      <div className="trainer-activity-item">
                        <strong>Roster readiness</strong>
                        <span>{overview.activeMembers.length} active members assigned to your account</span>
                      </div>
                      <div className="trainer-activity-item">
                        <strong>Session load</strong>
                        <span>
                          {overview.todaySessions.length
                            ? `${overview.todaySessions.length} session(s) scheduled today`
                            : 'No sessions booked for today yet'}
                        </span>
                      </div>
                      <div className="trainer-activity-item">
                        <strong>Next booking</strong>
                        <span>
                          {overview.nextSession
                            ? `${formatShortDate(overview.nextSession.date)} • ${overview.nextSession.timeSlot || 'Time pending'}`
                            : 'Open schedule available'}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            }
          />

          <Route
            path="bookings"
            element={
              <div className="trainer-page-shell">
                <div className="trainer-section-header">
                  <div>
                    <span className="trainer-eyebrow subtle">Session Operations</span>
                    <h2>Manage bookings</h2>
                    <p>Review appointment details, timing, and booking status from one clean queue.</p>
                  </div>
                </div>

                {loading ? (
                  <div className="trainer-empty-state">
                    <h3>Loading bookings...</h3>
                  </div>
                ) : overview.totalBookings === 0 ? (
                  <div className="trainer-empty-state">
                    <h3>No bookings yet</h3>
                    <p>When members reserve sessions, they&apos;ll appear here for you to review.</p>
                  </div>
                ) : (
                  <div className="trainer-card-grid">
                    {bookings.map((booking) => (
                      <article key={booking._id} className="trainer-detail-card">
                        <div className="trainer-detail-topline">
                          <span className="detail-date">{formatLongDate(booking.date)}</span>
                          <span className={`trainer-status status-${String(booking.status || 'pending').toLowerCase()}`}>
                            {booking.status || 'pending'}
                          </span>
                        </div>

                        <h3>{getDisplayName(booking.member, 'Assigned member')}</h3>
                        <p className="trainer-detail-copy">
                          {booking.notes || 'No additional coaching notes were added to this booking.'}
                        </p>

                        <div className="trainer-meta-list">
                          <span><FaClock /> {booking.timeSlot || 'Time not specified'}</span>
                          <span><FaUserCheck /> {getDisplayName(booking.trainer || user, 'Trainer')}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            }
          />

          <Route
            path="members"
            element={
              <div className="trainer-page-shell">
                <div className="trainer-section-header">
                  <div>
                    <span className="trainer-eyebrow subtle">Client Roster</span>
                    <h2>Assigned members</h2>
                    <p>Review the people currently connected to your coaching support and guidance.</p>
                  </div>
                </div>

                {loading ? (
                  <div className="trainer-empty-state">
                    <h3>Loading members...</h3>
                  </div>
                ) : assignedMembers.length === 0 ? (
                  <div className="trainer-empty-state">
                    <h3>No assigned members yet</h3>
                    <p>Your client roster will appear here as soon as members are linked to your account.</p>
                  </div>
                ) : (
                  <div className="trainer-card-grid">
                    {assignedMembers.map((member) => (
                      <article key={member._id} className="trainer-detail-card member-card">
                        <div className="trainer-member-avatar">
                          {(member.name || member.email || 'M').charAt(0).toUpperCase()}
                        </div>

                        <div className="trainer-member-body">
                          <div className="trainer-detail-topline">
                            <span className="detail-date">{member.membershipPlan?.name || 'Coaching member'}</span>
                            <span className={`trainer-member-badge ${member.isActive === false ? 'inactive' : 'active'}`}>
                              {member.isActive === false ? 'Inactive' : 'Active'}
                            </span>
                          </div>

                          <h3>{member.name || 'Member'}</h3>
                          <p className="trainer-detail-copy">{member.email || 'Email unavailable'}</p>

                          <div className="trainer-meta-list">
                            <span><FaDumbbell /> {member.goal || 'General fitness goals'}</span>
                            <span><FaArrowRight /> {member.phone || 'Contact not added'}</span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}

                {overview.newestMembers.length > 0 && (
                  <section className="trainer-roster-strip">
                    <div className="panel-heading">
                      <h3>Roster snapshot</h3>
                      <p>Quick look at members currently at the top of your working list.</p>
                    </div>

                    <div className="trainer-roster-list">
                      {overview.newestMembers.map((member) => (
                        <div key={`snapshot-${member._id}`} className="trainer-roster-item">
                          <span className="roster-mark">{(member.name || 'M').charAt(0).toUpperCase()}</span>
                          <div>
                            <strong>{member.name || 'Member'}</strong>
                            <span>{member.email || 'Email unavailable'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
};

export default TrainerDashboard;
