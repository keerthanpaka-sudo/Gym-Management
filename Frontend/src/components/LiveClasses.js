import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaVideo, FaUsers, FaClock, FaPlay, FaEye, FaUserPlus, FaUserMinus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../config/apiConfig';
import './LiveClasses.css';

const createClassCover = (title, accentStart, accentEnd, label) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${accentStart}" />
          <stop offset="100%" stop-color="${accentEnd}" />
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#bg)" rx="32" />
      <circle cx="680" cy="100" r="82" fill="rgba(255,255,255,0.12)" />
      <circle cx="120" cy="360" r="120" fill="rgba(255,255,255,0.08)" />
      <text x="52" y="88" fill="#ffffff" font-family="Arial, sans-serif" font-size="28" font-weight="700">${label}</text>
      <text x="52" y="210" fill="#ffffff" font-family="Arial, sans-serif" font-size="50" font-weight="700">${title}</text>
      <text x="52" y="274" fill="rgba(255,255,255,0.88)" font-family="Arial, sans-serif" font-size="24">Live Classes</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const DEFAULT_CLASS_COVERS = {
  hiit: createClassCover('Morning HIIT', '#ff7a18', '#af002d', 'Cardio Blast'),
  strength: createClassCover('Strength Basics', '#1f4d7a', '#45c4b0', 'Gym Starter'),
  yoga: createClassCover('Yoga Flow', '#7b4397', '#dc2430', 'Mind and Body'),
  gymFullBody: createClassCover('Full Body Starter', '#134e5e', '#71b280', 'Gym Basics'),
  gymUpperBody: createClassCover('Upper Body', '#2c3e50', '#4ca1af', 'Gym Basics'),
  yogaMorning: createClassCover('Morning Stretch', '#11998e', '#38ef7d', 'Yoga Basics'),
  yogaBalance: createClassCover('Flexibility and Balance', '#834d9b', '#d04ed6', 'Yoga Basics'),
  fallback: createClassCover('Fitness Class', '#16222a', '#3a6073', 'Wellness Studio')
};

const DEFAULT_CLASSES = [
  {
    _id: 'sample1',
    title: 'Morning HIIT Session',
    description: 'High-intensity interval training to boost your metabolism',
    instructor: { name: 'Coach Mike' },
    scheduledDate: new Date(Date.now() + 3600000).toISOString(),
    duration: 45,
    maxParticipants: 20,
    participants: [],
    currentParticipants: 0,
    status: 'scheduled',
    streamUrl: 'https://zoom.us/sample1',
    thumbnail: DEFAULT_CLASS_COVERS.hiit,
    program: { name: 'HIIT Program', category: 'cardio', type: 'live' }
  },
  {
    _id: 'sample2',
    title: 'Strength Training Basics',
    description: 'Learn proper form and build muscle with compound movements',
    instructor: { name: 'Trainer Sarah' },
    scheduledDate: new Date(Date.now() + 7200000).toISOString(),
    duration: 60,
    maxParticipants: 15,
    participants: [],
    currentParticipants: 0,
    status: 'scheduled',
    streamUrl: 'https://zoom.us/sample2',
    thumbnail: DEFAULT_CLASS_COVERS.strength,
    program: { name: 'Strength Basics', category: 'strength', type: 'live' }
  },
  {
    _id: 'sample3',
    title: 'Yoga Flow',
    description: 'Relax and improve flexibility with guided yoga session',
    instructor: { name: 'Yoga Master Anna' },
    scheduledDate: new Date(Date.now() + 10800000).toISOString(),
    duration: 50,
    maxParticipants: 25,
    participants: [],
    currentParticipants: 0,
    status: 'scheduled',
    streamUrl: 'https://zoom.us/sample3',
    thumbnail: DEFAULT_CLASS_COVERS.yoga,
    program: { name: 'Yoga Flow', category: 'yoga', type: 'live' }
  }
];

const SUPPLEMENTAL_COMPLETED_CLASSES = [
  {
    _id: 'recorded-gym-basics-1',
    title: 'Gym Basics: Full Body Starter',
    description: 'A beginner-friendly gym workout covering warm-up, machine basics, and simple full-body movements.',
    instructor: { name: 'Coach Daniel' },
    scheduledDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    duration: 28,
    maxParticipants: 999,
    participants: [],
    currentParticipants: 142,
    status: 'completed',
    recordingUrl: 'https://www.youtube.com/watch?v=UIPvIYsjfpo',
    thumbnail: DEFAULT_CLASS_COVERS.gymFullBody,
    program: { name: 'Gym Basics', category: 'strength', type: 'recorded' },
    tags: ['beginner', 'gym', 'full body']
  },
  {
    _id: 'recorded-gym-basics-2',
    title: 'Gym Basics: Upper Body Foundations',
    description: 'Learn simple upper-body exercises with safe form cues for chest, shoulders, back, and arms.',
    instructor: { name: 'Trainer Sarah' },
    scheduledDate: new Date(Date.now() - 86400000 * 4).toISOString(),
    duration: 24,
    maxParticipants: 999,
    participants: [],
    currentParticipants: 118,
    status: 'completed',
    recordingUrl: 'https://www.youtube.com/watch?v=ixkQaZXVQjs',
    thumbnail: DEFAULT_CLASS_COVERS.gymUpperBody,
    program: { name: 'Gym Basics', category: 'strength', type: 'recorded' },
    tags: ['beginner', 'gym', 'upper body']
  },
  {
    _id: 'recorded-yoga-basics-1',
    title: 'Yoga Basics: Morning Stretch Flow',
    description: 'A gentle yoga flow focused on breathing, mobility, and simple stretches for beginners.',
    instructor: { name: 'Yoga Master Anna' },
    scheduledDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    duration: 22,
    maxParticipants: 999,
    participants: [],
    currentParticipants: 167,
    status: 'completed',
    recordingUrl: 'https://www.youtube.com/watch?v=v7AYKMP6rOE',
    thumbnail: DEFAULT_CLASS_COVERS.yogaMorning,
    program: { name: 'Yoga Basics', category: 'yoga', type: 'recorded' },
    tags: ['beginner', 'yoga', 'mobility']
  },
  {
    _id: 'recorded-yoga-basics-2',
    title: 'Yoga Basics: Flexibility and Balance',
    description: 'A beginner session to improve posture, flexibility, and balance with easy follow-along poses.',
    instructor: { name: 'Instructor Meera' },
    scheduledDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    duration: 26,
    maxParticipants: 999,
    participants: [],
    currentParticipants: 153,
    status: 'completed',
    recordingUrl: 'https://www.youtube.com/watch?v=4pKly2JojMw',
    thumbnail: DEFAULT_CLASS_COVERS.yogaBalance,
    program: { name: 'Yoga Basics', category: 'yoga', type: 'recorded' },
    tags: ['beginner', 'yoga', 'balance']
  }
];

const getFallbackCover = (liveClass = {}) => {
  const category = String(liveClass.program?.category || '').toLowerCase();
  const title = String(liveClass.title || '').toLowerCase();

  if (category.includes('yoga') || title.includes('yoga')) {
    return DEFAULT_CLASS_COVERS.yoga;
  }

  if (category.includes('strength') || title.includes('strength') || title.includes('gym')) {
    return DEFAULT_CLASS_COVERS.strength;
  }

  if (category.includes('cardio') || title.includes('hiit')) {
    return DEFAULT_CLASS_COVERS.hiit;
  }

  return DEFAULT_CLASS_COVERS.fallback;
};

const normalizeLiveClass = (liveClass = {}) => ({
  ...liveClass,
  scheduledDate: liveClass.scheduledDate || liveClass.scheduledTime || new Date().toISOString(),
  instructor: typeof liveClass.instructor === 'string'
    ? { name: liveClass.instructor }
    : liveClass.instructor || { name: 'Trainer' },
  program: liveClass.program || { name: 'General Fitness', category: 'fitness', type: 'live' },
  participants: Array.isArray(liveClass.participants) ? liveClass.participants : [],
  currentParticipants: Number(liveClass.currentParticipants) || 0,
  maxParticipants: Number(liveClass.maxParticipants) || 0,
  status: liveClass.status || (liveClass.isActive ? 'live' : 'scheduled'),
  streamUrl: liveClass.streamUrl || liveClass.meetingLink || '',
  recordingUrl: liveClass.recordingUrl || '',
  thumbnail: liveClass.thumbnail || liveClass.image || liveClass.coverImage || getFallbackCover(liveClass),
});

const getEmbeddedVideoUrl = (url = '') => {
  if (!url) {
    return '';
  }

  if (url.includes('youtube.com/embed/')) {
    return url;
  }

  const youtubeMatch = url.match(/[?&]v=([^&]+)/);
  if (youtubeMatch?.[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0`;
  }

  const shortYoutubeMatch = url.match(/youtu\.be\/([^?]+)/);
  if (shortYoutubeMatch?.[1]) {
    return `https://www.youtube.com/embed/${shortYoutubeMatch[1]}?rel=0`;
  }

  return url;
};

const mergeUniqueClasses = (...classGroups) => {
  const classMap = new Map();

  classGroups.flat().forEach((liveClass) => {
    if (liveClass?._id) {
      classMap.set(liveClass._id, liveClass);
    }
  });

  return Array.from(classMap.values());
};

const LiveClasses = () => {
  const [classes, setClasses] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedClass, setSelectedClass] = useState(null);
  const [joinedClasses, setJoinedClasses] = useState(new Set());

  const fetchLiveClasses = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user._id || user.id;
      const [allClassesRes, upcomingRes] = await Promise.all([
        axios.get(API_ENDPOINTS.LIVE_CLASSES, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_ENDPOINTS.LIVE_CLASSES}?upcoming=true`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const allClasses = mergeUniqueClasses(
        (allClassesRes.data.classes || allClassesRes.data || DEFAULT_CLASSES).map(normalizeLiveClass),
        SUPPLEMENTAL_COMPLETED_CLASSES.map(normalizeLiveClass)
      );
      const upcomingClassesData = (upcomingRes.data.classes || upcomingRes.data || DEFAULT_CLASSES).map(normalizeLiveClass);

      setClasses(allClasses);
      setUpcomingClasses(upcomingClassesData);

      // Check which classes the user has joined
      const joined = new Set();
      allClasses.forEach(cls => {
        const participant = cls.participants.find((participantEntry) => {
          const participantUserId = participantEntry.user?._id || participantEntry.user?.id || participantEntry.user;
          return participantUserId === userId;
        });
        if (participant && !participant.leftAt) {
          joined.add(cls._id);
        }
      });
      setJoinedClasses(joined);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch live classes');
      console.error('Fetch error:', error);
      // Set fallback data
      const fallbackClasses = mergeUniqueClasses(
        DEFAULT_CLASSES.map(normalizeLiveClass),
        SUPPLEMENTAL_COMPLETED_CLASSES.map(normalizeLiveClass)
      );
      setClasses(fallbackClasses);
      setUpcomingClasses(fallbackClasses.filter(cls => new Date(cls.scheduledDate) > new Date()));
      setJoinedClasses(new Set());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveClasses();
  }, [fetchLiveClasses]);

  async function handleJoinClass(classId) {
  try {
    const token = localStorage.getItem('token');
    await axios.post(API_ENDPOINTS.JOIN_LIVE_CLASS(classId), {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setJoinedClasses(prev => new Set([...prev, classId]));
    toast.success('Successfully joined the class');
    fetchLiveClasses(); // Refresh to get updated participant count
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to join class');
  }
}

  const handleLeaveClass = async (classId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(API_ENDPOINTS.LEAVE_LIVE_CLASS(classId), {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setJoinedClasses(prev => {
        const newSet = new Set(prev);
        newSet.delete(classId);
        return newSet;
      });
      toast.success('Successfully left the class');
      fetchLiveClasses(); // Refresh to get updated participant count
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to leave class');
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const getClassStatus = (classData) => {
    const now = new Date();
    const classDate = new Date(classData.scheduledDate);

    if (classData.status === 'completed') return { status: 'completed', color: '#95a5a6' };
    if (classData.status === 'live') return { status: 'live', color: '#e74c3c' };
    if (classDate > now) return { status: 'upcoming', color: '#27ae60' };
    return { status: 'scheduled', color: '#f39c12' };
  };

  const getDisplayedClasses = () => {
    switch (activeTab) {
      case 'upcoming':
        return upcomingClasses;
      case 'live':
        return classes.filter(cls => cls.status === 'live');
      case 'completed':
        return classes.filter(cls => cls.status === 'completed');
      default:
        return classes;
    }
  };

  if (loading) {
    return <div className="loading">Loading live classes...</div>;
  }

  return (
    <div className="live-classes">
      <div className="dashboard-header">
        <h2><FaVideo /> Live Classes</h2>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming ({upcomingClasses.length})
        </button>
        <button
          className={`tab ${activeTab === 'live' ? 'active' : ''}`}
          onClick={() => setActiveTab('live')}
        >
          Live Now ({classes.filter(cls => cls.status === 'live').length})
        </button>
        <button
          className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Classes
        </button>
      </div>

      <div className="classes-grid">
        {getDisplayedClasses().length === 0 ? (
          <div className="empty-state">
            <FaVideo size={48} />
            <h3>No {activeTab} classes</h3>
            <p>
              {activeTab === 'upcoming' && 'Check back later for upcoming live classes.'}
              {activeTab === 'live' && 'No classes are currently live.'}
              {activeTab === 'completed' && 'No completed classes yet.'}
              {activeTab === 'all' && 'No live classes available.'}
            </p>
          </div>
        ) : (
          getDisplayedClasses().map(classData => {
            const { date, time } = formatDateTime(classData.scheduledDate);
            const { status, color } = getClassStatus(classData);
            const isJoined = joinedClasses.has(classData._id);

            return (
              <div key={classData._id} className="class-card">
                <div className="class-cover">
                  <img
                    src={classData.thumbnail}
                    alt={classData.title}
                    className="class-cover-image"
                  />
                </div>

                <div className="class-header">
                  <div className="class-info">
                    <h3>{classData.title}</h3>
                    <p className="instructor">by {classData.instructor.name}</p>
                  </div>
                  <div className="class-status" style={{ backgroundColor: color }}>
                    {status.toUpperCase()}
                  </div>
                </div>

                <div className="class-details">
                  <div className="class-meta">
                    <div className="meta-item">
                      <FaClock />
                      <span>{time}</span>
                    </div>
                    <div className="meta-item">
                      <FaUsers />
                      <span>{classData.currentParticipants}/{classData.maxParticipants}</span>
                    </div>
                    <div className="meta-item">
                      <span>{classData.duration} min</span>
                    </div>
                  </div>

                  <p className="class-description">
                    {classData.description || 'Join this live fitness class for an amazing workout experience!'}
                  </p>

                  <div className="class-program">
                    <strong>Program:</strong> {classData.program?.name || 'General Fitness'}
                    <span className="program-category">{classData.program?.category || 'fitness'}</span>
                  </div>
                </div>

                <div className="class-actions">
                  {status === 'live' && (
                    <button
                      className="btn-live"
                      onClick={() => classData.streamUrl && window.open(classData.streamUrl, '_blank', 'noopener,noreferrer')}
                    >
                      <FaPlay /> Join Live
                    </button>
                  )}

                  {status === 'upcoming' && !isJoined && classData.currentParticipants < classData.maxParticipants && (
                    <button
                      className="btn-join"
                      onClick={() => handleJoinClass(classData._id)}
                    >
                      <FaUserPlus /> Join Class
                    </button>
                  )}

                  {status === 'upcoming' && isJoined && (
                    <button
                      className="btn-leave"
                      onClick={() => handleLeaveClass(classData._id)}
                    >
                      <FaUserMinus /> Leave Class
                    </button>
                  )}

                  {status === 'completed' && classData.recordingUrl && (
                    <button
                      className="btn-recording"
                      onClick={() => setSelectedClass(classData)}
                    >
                      <FaEye /> View Recording
                    </button>
                  )}

                  <button
                    className="btn-details"
                    onClick={() => setSelectedClass(classData)}
                  >
                    View Details
                  </button>
                </div>

                <div className="class-date">
                  {date}
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedClass && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{selectedClass.title}</h3>
              <button
                className="close-btn"
                onClick={() => setSelectedClass(null)}
              >
                ×
              </button>
            </div>

            <div className="class-detail-content">
              <div className="class-modal-cover">
                <img
                  src={selectedClass.thumbnail}
                  alt={selectedClass.title}
                  className="class-modal-cover-image"
                />
              </div>

              <div className="class-detail-header">
                <div className="instructor-info">
                  <img
                    src={selectedClass.instructor.profilePicture || selectedClass.instructor.profileImage || '/default-avatar.png'}
                    alt={selectedClass.instructor.name}
                    className="instructor-avatar"
                  />
                  <div>
                    <h4>{selectedClass.instructor.name}</h4>
                    <p>{selectedClass.instructor.bio || 'Certified Fitness Instructor'}</p>
                  </div>
                </div>

                <div className="class-timing">
                  <div className="timing-item">
                    <FaClock />
                    <span>{formatDateTime(selectedClass.scheduledDate).time}</span>
                  </div>
                  <div className="timing-item">
                    <span>{selectedClass.duration} minutes</span>
                  </div>
                </div>
              </div>

              <div className="class-detail-body">
                <div className="detail-section">
                  <h4>Description</h4>
                  <p>{selectedClass.description || 'No description available.'}</p>
                </div>

                <div className="detail-section">
                  <h4>Program Details</h4>
                  <div className="program-info">
                    <p><strong>Program:</strong> {selectedClass.program?.name || 'General Fitness'}</p>
                    <p><strong>Category:</strong> {selectedClass.program?.category || 'fitness'}</p>
                    <p><strong>Type:</strong> {selectedClass.program?.type || 'live'}</p>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Class Information</h4>
                  <div className="class-info-grid">
                    <div className="info-item">
                      <span className="label">Participants:</span>
                      <span className="value">{selectedClass.currentParticipants}/{selectedClass.maxParticipants}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Price:</span>
                      <span className="value">{selectedClass.isFree ? 'Free' : `$${selectedClass.price}`}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Status:</span>
                      <span className="value status" style={{ backgroundColor: getClassStatus(selectedClass).color }}>
                        {getClassStatus(selectedClass).status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedClass.status === 'completed' && selectedClass.recordingUrl && (
                  <div className="detail-section">
                    <h4>Workout Video</h4>
                    <div className="recording-player">
                      <iframe
                        src={getEmbeddedVideoUrl(selectedClass.recordingUrl)}
                        title={`${selectedClass.title} recording`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                {selectedClass.tags && selectedClass.tags.length > 0 && (
                  <div className="detail-section">
                    <h4>Tags</h4>
                    <div className="tags">
                      {selectedClass.tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="class-detail-actions">
                {selectedClass.status === 'live' && (
                  <button
                    className="btn-live large"
                    onClick={() => selectedClass.streamUrl && window.open(selectedClass.streamUrl, '_blank', 'noopener,noreferrer')}
                  >
                    <FaPlay /> Join Live Class
                  </button>
                )}

                {selectedClass.status === 'upcoming' && !joinedClasses.has(selectedClass._id) && (
                  <button
                    className="btn-join large"
                    onClick={() => {
                      handleJoinClass(selectedClass._id);
                      setSelectedClass(null);
                    }}
                  >
                    <FaUserPlus /> Join This Class
                  </button>
                )}

                {selectedClass.status === 'completed' && selectedClass.recordingUrl && (
                  <button
                    className="btn-recording large"
                    onClick={() => {
                      const player = document.querySelector('.recording-player');
                      if (player) {
                        player.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                  >
                    <FaEye /> Play In Page
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveClasses;
