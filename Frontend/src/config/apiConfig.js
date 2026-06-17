// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: `${API_BASE_URL}/auth/login`,
  AUTH_REGISTER: `${API_BASE_URL}/auth/register`,
  AUTH_USERS: `${API_BASE_URL}/auth/users`,
  DELETE_USER: (id) => `${API_BASE_URL}/auth/users/${id}`,
  ASSIGN_TRAINER: (memberId) => `${API_BASE_URL}/auth/users/${memberId}/assign-trainer`,
  AUTH_ASSIGNED_MEMBERS: `${API_BASE_URL}/auth/assigned-members`,
  AUTH_TRAINERS: `${API_BASE_URL}/auth/trainers`,

  // Programs
  PROGRAMS: `${API_BASE_URL}/programs`,
  GET_PROGRAM: (id) => `${API_BASE_URL}/programs/${id}`,
  CREATE_PROGRAM: `${API_BASE_URL}/programs`,
  UPDATE_PROGRAM: (id) => `${API_BASE_URL}/programs/${id}`,
  DELETE_PROGRAM: (id) => `${API_BASE_URL}/programs/${id}`,

  // Bookings
  BOOKINGS: `${API_BASE_URL}/bookings`,
  GET_BOOKING: (id) => `${API_BASE_URL}/bookings/${id}`,
  CREATE_BOOKING: `${API_BASE_URL}/bookings`,
  UPDATE_BOOKING: (id) => `${API_BASE_URL}/bookings/${id}`,
  DELETE_BOOKING: (id) => `${API_BASE_URL}/bookings/${id}`,
  CANCEL_BOOKING: (id) => `${API_BASE_URL}/bookings/${id}/cancel`,

  // Payments
  PAYMENTS_CREATE_INTENT: `${API_BASE_URL}/payments/create-payment-intent`,
  PAYMENTS_CONFIRM: `${API_BASE_URL}/payments/confirm-payment`,
  PAYMENTS_PLANS: `${API_BASE_URL}/payments/plans`,
  PAYMENTS_HISTORY: `${API_BASE_URL}/payments/history`,

// Membership
  MEMBERSHIP_PLANS: `${API_BASE_URL}/membership/plans`,
  GET_MEMBERSHIP_PLAN: (id) => `${API_BASE_URL}/membership/plans/${id}`,
  CREATE_MEMBERSHIP_PLAN: `${API_BASE_URL}/membership/plans`,
  UPDATE_MEMBERSHIP_PLAN: (id) => `${API_BASE_URL}/membership/plans/${id}`,
  DELETE_MEMBERSHIP_PLAN: (id) => `${API_BASE_URL}/membership/plans/${id}`,
  JOIN_MEMBERSHIP: `${API_BASE_URL}/membership/join`,
  CANCEL_MEMBERSHIP: `${API_BASE_URL}/membership/cancel`,
  MY_MEMBERSHIP: `${API_BASE_URL}/membership/my`,

  // Attendance
  ATTENDANCE: `${API_BASE_URL}/attendance`,
  GET_ATTENDANCE: (id) => `${API_BASE_URL}/attendance/${id}`,
  MARK_ATTENDANCE: `${API_BASE_URL}/attendance/mark-attendance`,
  GENERATE_QR: `${API_BASE_URL}/attendance/generate-qr`,
  CHECKOUT_ATTENDANCE: (id) => `${API_BASE_URL}/attendance/checkout/${id}`,

  // Nutrition
  NUTRITION: `${API_BASE_URL}/nutrition`,
  GET_NUTRITION: (id) => `${API_BASE_URL}/nutrition/${id}`,
  CREATE_NUTRITION: `${API_BASE_URL}/nutrition`,
  UPDATE_NUTRITION: (id) => `${API_BASE_URL}/nutrition/${id}`,
  DELETE_NUTRITION: (id) => `${API_BASE_URL}/nutrition/${id}`,
  LOG_NUTRITION: (id) => `${API_BASE_URL}/nutrition/${id}/log`,

  // Progress
  PROGRESS: `${API_BASE_URL}/progress`,
  GET_PROGRESS: (id) => `${API_BASE_URL}/progress/${id}`,
  CREATE_PROGRESS: `${API_BASE_URL}/progress`,
  UPDATE_PROGRESS: (id) => `${API_BASE_URL}/progress/${id}`,
  DELETE_PROGRESS: (id) => `${API_BASE_URL}/progress/${id}`,
  PROGRESS_STATS: (userId) => `${API_BASE_URL}/progress/stats/${userId}`,

  // Live Classes
  LIVE_CLASSES: `${API_BASE_URL}/live-classes`,
  GET_LIVE_CLASS: (id) => `${API_BASE_URL}/live-classes/${id}`,
  CREATE_LIVE_CLASS: `${API_BASE_URL}/live-classes`,
  UPDATE_LIVE_CLASS: (id) => `${API_BASE_URL}/live-classes/${id}`,
  DELETE_LIVE_CLASS: (id) => `${API_BASE_URL}/live-classes/${id}`,
  JOIN_LIVE_CLASS: (id) => `${API_BASE_URL}/live-classes/${id}/join`,
  LEAVE_LIVE_CLASS: (id) => `${API_BASE_URL}/live-classes/${id}/leave`,
  START_LIVE_CLASS: (id) => `${API_BASE_URL}/live-classes/${id}/start`,
  END_LIVE_CLASS: (id) => `${API_BASE_URL}/live-classes/${id}/end`,

  // Community
  COMMUNITY: `${API_BASE_URL}/community`,
  GET_COMMUNITY_POST: (id) => `${API_BASE_URL}/community/${id}`,
  CREATE_COMMUNITY_POST: `${API_BASE_URL}/community`,
  UPDATE_COMMUNITY_POST: (id) => `${API_BASE_URL}/community/${id}`,
  DELETE_COMMUNITY_POST: (id) => `${API_BASE_URL}/community/${id}`,
  LIKE_COMMUNITY_POST: (id) => `${API_BASE_URL}/community/${id}/like`,
  ADD_COMMENT: (id) => `${API_BASE_URL}/community/${id}/comments`,
  LIKE_COMMENT: (postId, commentId) => `${API_BASE_URL}/community/${postId}/comments/${commentId}/like`,
  DELETE_COMMENT: (postId, commentId) => `${API_BASE_URL}/community/${postId}/comments/${commentId}`,
  PIN_POST: (id) => `${API_BASE_URL}/community/${id}/pin`,

  // Workout Plans
  WORKOUT_PLANS: `${API_BASE_URL}/workout-plans`,
  GET_WORKOUT_PLAN: (id) => `${API_BASE_URL}/workout-plans/${id}`,
  CREATE_WORKOUT_PLAN: `${API_BASE_URL}/workout-plans`,
  UPDATE_WORKOUT_PLAN: (id) => `${API_BASE_URL}/workout-plans/${id}`,
  DELETE_WORKOUT_PLAN: (id) => `${API_BASE_URL}/workout-plans/${id}`,
  LOG_WORKOUT: (id) => `${API_BASE_URL}/workout-plans/${id}/log-workout`,
  WORKOUT_PROGRESS: (id) => `${API_BASE_URL}/workout-plans/${id}/progress`,
  NEXT_WEEK: (id) => `${API_BASE_URL}/workout-plans/${id}/next-week`,

  // Notifications
  NOTIFICATIONS: `${API_BASE_URL}/notifications`,
  GET_NOTIFICATION: (id) => `${API_BASE_URL}/notifications/${id}`,
  CREATE_NOTIFICATION: `${API_BASE_URL}/notifications`,
  MARK_READ: (id) => `${API_BASE_URL}/notifications/${id}/read`,
  MARK_ALL_READ: `${API_BASE_URL}/notifications/read-all`,
  DELETE_NOTIFICATION: (id) => `${API_BASE_URL}/notifications/${id}`,
  BULK_NOTIFICATIONS: `${API_BASE_URL}/notifications/bulk`,
  NOTIFICATION_STATS: `${API_BASE_URL}/notifications/admin/stats`,
};

export default API_ENDPOINTS;
