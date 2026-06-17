import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import {
  FaArrowRight,
  FaChartLine,
  FaClipboardList,
  FaCrown,
  FaDumbbell,
  FaLeaf,
  FaListAlt,
  FaSearch,
  FaShieldAlt,
  FaSignOutAlt,
  FaTrash,
  FaUserCog,
  FaUsers,
  FaVideo
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/apiConfig';
import './AdminDashboard.css';

const asArray = (value) => (Array.isArray(value) ? value : []);

const normalizeUser = (user = {}) => ({
  ...user,
  name: user.name || user.fullName || 'User',
  email: user.email || 'Email unavailable',
  role: String(user.role || 'member').toLowerCase(),
  assignedMembers: Array.isArray(user.assignedMembers) ? user.assignedMembers : []
});

const normalizeProgram = (program = {}) => ({
  ...program,
  title: program.title || program.name || 'Program',
  description: program.description || 'Structured fitness program',
  difficulty: String(program.difficulty || 'beginner').toLowerCase(),
  category: String(program.category || program.type || 'general').toLowerCase(),
  duration: Number(program.duration) || 0
});

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [programDifficultyFilter, setProgramDifficultyFilter] = useState('all');
  const [assigningMemberId, setAssigningMemberId] = useState('');
  const navigate = useNavigate();
  const adminUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchPrograms(), fetchMembershipPlans()]);
      setLoading(false);
    };

    loadDashboard();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(API_ENDPOINTS.AUTH_USERS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(asArray(res.data).map(normalizeUser));
    } catch (err) {
      setUsers([]);
      toast.error('Failed to fetch users');
    }
  };

  const fetchPrograms = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.PROGRAMS);
      setPrograms(asArray(res.data).map(normalizeProgram));
    } catch (err) {
      setPrograms([]);
      toast.error('Failed to fetch programs');
    }
  };

  const fetchMembershipPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(API_ENDPOINTS.MEMBERSHIP_PLANS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembershipPlans(asArray(res.data));
    } catch (err) {
      setMembershipPlans([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(API_ENDPOINTS.DELETE_USER(userId), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter((u) => u._id !== userId));
      toast.success('User deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleAssignTrainer = async (memberId, trainerId) => {
    if (!trainerId) {
      return;
    }

    try {
      setAssigningMemberId(memberId);
      const token = localStorage.getItem('token');
      await axios.put(
        API_ENDPOINTS.ASSIGN_TRAINER(memberId),
        { trainerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchUsers();
      toast.success('Trainer assigned successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign trainer');
    } finally {
      setAssigningMemberId('');
    }
  };

  const overview = useMemo(() => {
    const members = users.filter((user) => user.role === 'member');
    const trainers = users.filter((user) => user.role === 'trainer');
    const admins = users.filter((user) => user.role === 'admin');
    const beginnerPrograms = programs.filter((program) => program.difficulty === 'beginner');
    const advancedPrograms = programs.filter((program) =>
      ['intermediate', 'advanced'].includes(program.difficulty)
    );
    const recentUsers = [...users].slice(0, 5);

    return {
      members,
      trainers,
      admins,
      beginnerPrograms,
      advancedPrograms,
      recentUsers
    };
  }, [programs, users]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesRole = userRoleFilter === 'all' ? true : user.role === userRoleFilter;
      const query = userSearch.trim().toLowerCase();
      const matchesSearch = query
        ? user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
        : true;

      return matchesRole && matchesSearch;
    });
  }, [userRoleFilter, userSearch, users]);

  const filteredPrograms = useMemo(() => {
    return programs.filter((program) =>
      programDifficultyFilter === 'all' ? true : program.difficulty === programDifficultyFilter
    );
  }, [programDifficultyFilter, programs]);

  const trainerOptions = useMemo(
    () => users.filter((user) => user.role === 'trainer'),
    [users]
  );

  const quickActions = [
    {
      to: '/admin/users',
      icon: <FaUserCog />,
      title: 'User Administration',
      description: 'Review platform users, roles, and access coverage.'
    },
    {
      to: '/admin/programs',
      icon: <FaDumbbell />,
      title: 'Program Catalog',
      description: 'Monitor training content and difficulty balance.'
    },
    {
      to: '/membership',
      icon: <FaCrown />,
      title: 'Membership Plans',
      description: 'Inspect plans and member-facing subscriptions.'
    },
    {
      to: '/nutrition',
      icon: <FaLeaf />,
      title: 'Nutrition Workspace',
      description: 'Open nutrition planning and dietary support tools.'
    },
    {
      to: '/live-classes',
      icon: <FaVideo />,
      title: 'Live Classes',
      description: 'Track class experiences, delivery, and participation.'
    },
    {
      to: '/community',
      icon: <FaUsers />,
      title: 'Community Feed',
      description: 'Review community activity and engagement touchpoints.'
    }
  ];

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-mark">AC</span>
          <div>
            <h2>Admin Console</h2>
            <p>Platform operations workspace</p>
          </div>
        </div>

        <nav className="admin-nav">
          <NavLink to="/admin" end className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            Overview
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            Manage Users
          </NavLink>
          <NavLink to="/admin/programs" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            Programs
          </NavLink>
          <NavLink to="/membership" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            Membership
          </NavLink>
          <NavLink to="/nutrition" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            Nutrition
          </NavLink>
          <NavLink to="/progress" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            Progress
          </NavLink>
          <NavLink to="/live-classes" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            Live Classes
          </NavLink>
          <NavLink to="/community" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            Community
          </NavLink>
        </nav>

        <button onClick={handleLogout} className="admin-logout-btn">
          <FaSignOutAlt /> Logout
        </button>
      </aside>

      <main className="admin-content">
        <Routes>
          <Route
            index
            element={
              <div className="admin-overview">
                <section className="admin-hero">
                  <div className="admin-hero-copy">
                    <span className="admin-eyebrow">Operations Overview</span>
                    <h1>
                      {adminUser.name
                        ? `${adminUser.name}, manage the platform from one professional command center.`
                        : 'Manage the platform from one professional command center.'}
                    </h1>
                    <p>
                      Monitor user growth, trainer coverage, membership structure, and program inventory from a
                      polished admin workspace designed for daily operations.
                    </p>
                  </div>

                  <div className="admin-highlight-card">
                    <div className="admin-highlight-icon">
                      <FaShieldAlt />
                    </div>
                    <div>
                      <h3>System readiness</h3>
                      <p>
                        {users.length
                          ? `${overview.admins.length} admin(s), ${overview.trainers.length} trainer(s), and ${overview.members.length} member(s) currently registered.`
                          : 'User and platform records will appear here once the admin APIs return data.'}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="admin-stats-grid">
                  <div className="admin-stat-card">
                    <span className="admin-stat-label">Total Users</span>
                    <strong>{users.length}</strong>
                    <p>All registered accounts across the platform</p>
                  </div>
                  <div className="admin-stat-card">
                    <span className="admin-stat-label">Trainers</span>
                    <strong>{overview.trainers.length}</strong>
                    <p>Coaches currently available for member support</p>
                  </div>
                  <div className="admin-stat-card">
                    <span className="admin-stat-label">Programs</span>
                    <strong>{programs.length}</strong>
                    <p>Training plans currently visible in the catalog</p>
                  </div>
                  <div className="admin-stat-card">
                    <span className="admin-stat-label">Membership Plans</span>
                    <strong>{membershipPlans.length}</strong>
                    <p>Subscription options configured for members</p>
                  </div>
                </section>

                <section className="admin-panels">
                  <div className="admin-panel">
                    <div className="panel-heading">
                      <h3>Admin Shortcuts</h3>
                      <p>Jump directly into the highest-impact management areas.</p>
                    </div>

                    <div className="admin-quick-grid">
                      {quickActions.map((item) => (
                        <button
                          key={item.to}
                          className="admin-quick-card"
                          onClick={() => navigate(item.to)}
                        >
                          <span className="admin-quick-icon">{item.icon}</span>
                          <strong>{item.title}</strong>
                          <span>{item.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="admin-panel">
                    <div className="panel-heading">
                      <h3>Platform Snapshot</h3>
                      <p>Fast signals for what deserves admin attention today.</p>
                    </div>

                    <div className="admin-activity-list">
                      <div className="admin-activity-item">
                        <strong>User mix</strong>
                        <span>{overview.members.length} members and {overview.trainers.length} trainers are active in the current dataset.</span>
                      </div>
                      <div className="admin-activity-item">
                        <strong>Catalog balance</strong>
                        <span>{overview.beginnerPrograms.length} beginner program(s) and {overview.advancedPrograms.length} progressive program(s) are available.</span>
                      </div>
                      <div className="admin-activity-item">
                        <strong>Membership setup</strong>
                        <span>{membershipPlans.length ? `${membershipPlans.length} plan option(s) configured` : 'No membership plans returned yet'}</span>
                      </div>
                    </div>
                  </div>
                </section>

                {overview.recentUsers.length > 0 && (
                  <section className="admin-panel">
                    <div className="panel-heading">
                      <h3>Recent user list</h3>
                      <p>Quick roster preview for recent account visibility.</p>
                    </div>

                    <div className="admin-roster-list">
                      {overview.recentUsers.map((user) => (
                        <div key={user._id || `${user.email}-${user.role}`} className="admin-roster-item">
                          <span className="roster-mark">{user.name.charAt(0).toUpperCase()}</span>
                          <div>
                            <strong>{user.name}</strong>
                            <span>{user.email}</span>
                          </div>
                          <span className={`admin-role-badge ${user.role}`}>{user.role}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            }
          />

          <Route
            path="users"
            element={
              <div className="admin-page-shell">
                <div className="admin-section-header">
                  <div>
                    <span className="admin-eyebrow subtle">Access Management</span>
                    <h2>Manage users</h2>
                    <p>Search, filter, and inspect platform accounts with cleaner role visibility.</p>
                  </div>
                </div>

                <section className="admin-toolbar">
                  <label className="admin-search-box">
                    <FaSearch />
                    <input
                      type="text"
                      placeholder="Search by name or email"
                      value={userSearch}
                      onChange={(event) => setUserSearch(event.target.value)}
                    />
                  </label>

                  <div className="admin-filter-group">
                    {['all', 'admin', 'trainer', 'member'].map((role) => (
                      <button
                        key={role}
                        className={`admin-filter-chip ${userRoleFilter === role ? 'active' : ''}`}
                        onClick={() => setUserRoleFilter(role)}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </section>

                {loading ? (
                  <div className="admin-empty-state">
                    <h3>Loading users...</h3>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="admin-empty-state">
                    <h3>No users match this view</h3>
                    <p>Try a different role filter or search term.</p>
                  </div>
                ) : (
                  <div className="admin-card-grid">
                    {filteredUsers.map((user) => (
                      <article key={user._id || `${user.email}-${user.role}`} className="admin-detail-card">
                        <div className="admin-detail-topline">
                          <span className={`admin-role-badge ${user.role}`}>{user.role}</span>
                          <span className="detail-meta">{user.createdAt ? `Created ${formatDate(user.createdAt)}` : 'Account record available'}</span>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            title="Delete User"
                            style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', marginLeft: 'auto', fontSize: '1rem' }}
                          >
                            <FaTrash />
                          </button>
                        </div>

                        <h3>{user.name}</h3>
                        <p className="admin-detail-copy">{user.email}</p>

                        <div className="admin-meta-list">
                          <span><FaUsers /> {user.membershipPlan?.name || 'Membership not attached'}</span>
                          <span><FaArrowRight /> {user.phone || 'Phone unavailable'}</span>
                          {user.role === 'member' && (
                            <span><FaUserCog /> {user.assignedTrainer?.name || 'Trainer not assigned'}</span>
                          )}
                          {user.role === 'trainer' && (
                            <span><FaUsers /> {user.assignedMembers.length} assigned member(s)</span>
                          )}
                        </div>

                        {user.role === 'member' && trainerOptions.length > 0 && (
                          <label className="admin-trainer-select">
                            <span>Assign trainer</span>
                            <select
                              value={user.assignedTrainer?._id || ''}
                              onChange={(event) => handleAssignTrainer(user._id, event.target.value)}
                              disabled={assigningMemberId === user._id}
                            >
                              <option value="">Select trainer</option>
                              {trainerOptions.map((trainer) => (
                                <option key={trainer._id} value={trainer._id}>
                                  {trainer.name}
                                </option>
                              ))}
                            </select>
                          </label>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </div>
            }
          />

          <Route
            path="programs"
            element={
              <div className="admin-page-shell">
                <div className="admin-section-header">
                  <div>
                    <span className="admin-eyebrow subtle">Content Control</span>
                    <h2>Program management</h2>
                    <p>Review program quality, difficulty mix, and category spread across the catalog.</p>
                  </div>
                </div>

                <section className="admin-toolbar">
                  <div className="admin-filter-group">
                    {['all', 'beginner', 'intermediate', 'advanced'].map((level) => (
                      <button
                        key={level}
                        className={`admin-filter-chip ${programDifficultyFilter === level ? 'active' : ''}`}
                        onClick={() => setProgramDifficultyFilter(level)}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </section>

                {loading ? (
                  <div className="admin-empty-state">
                    <h3>Loading programs...</h3>
                  </div>
                ) : filteredPrograms.length === 0 ? (
                  <div className="admin-empty-state">
                    <h3>No programs in this filter</h3>
                    <p>Choose another difficulty view to inspect more catalog items.</p>
                  </div>
                ) : (
                  <div className="admin-card-grid">
                    {filteredPrograms.map((program) => (
                      <article key={program._id || `${program.title}-${program.category}`} className="admin-detail-card">
                        <div className="admin-detail-topline">
                          <span className={`admin-difficulty-badge ${program.difficulty}`}>{program.difficulty}</span>
                          <span className="detail-meta">{program.duration ? `${program.duration} week(s)` : 'Flexible duration'}</span>
                        </div>

                        <h3>{program.title}</h3>
                        <p className="admin-detail-copy">{program.description}</p>

                        <div className="admin-meta-list">
                          <span><FaListAlt /> {program.category.replace('-', ' ')}</span>
                          <span><FaChartLine /> {program.focus || 'General fitness focus'}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
