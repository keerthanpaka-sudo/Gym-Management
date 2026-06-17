import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaSpinner, FaDumbbell, FaHeart, FaBolt } from 'react-icons/fa';
import { API_ENDPOINTS } from '../config/apiConfig';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(API_ENDPOINTS.AUTH_LOGIN, formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      toast.success('Login successful! Welcome back! 💪');

      // Redirect based on role
      setTimeout(() => {
        switch (res.data.user.role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'member':
            navigate('/member');
            break;
          case 'trainer':
            navigate('/trainer');
            break;
          default:
            navigate('/');
        }
      }, 500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.', {
        position: 'top-center',
      });
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <div className="auth-container">
      {/* Animated background elements */}
      <motion.div
        className="gym-icon floating-icon icon-1"
        variants={floatingVariants}
        animate="animate"
      >
        <FaDumbbell />
      </motion.div>
      <motion.div
        className="gym-icon floating-icon icon-2"
        variants={{
          ...floatingVariants,
          animate: {
            y: [0, 20, 0],
            transition: {
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          },
        }}
      >
        <FaHeart />
      </motion.div>
      <motion.div
        className="gym-icon floating-icon icon-3"
        variants={{
          ...floatingVariants,
          animate: {
            y: [0, -15, 0],
            transition: {
              duration: 3.5,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          },
        }}
      >
        <FaBolt />
      </motion.div>

      <motion.div
        className="auth-form-wrapper"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo/Title */}
        <motion.div className="auth-header" variants={itemVariants}>
          <div className="logo-icon">
            <FaDumbbell />
          </div>
          <h1>FitHub</h1>
          <p>Your Fitness Journey Starts Here</p>
        </motion.div>

        {/* Form Card */}
        <motion.form onSubmit={onSubmit} className="auth-form" variants={itemVariants}>
          <h2>Login to Your Account</h2>

          {/* Email Field */}
          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="email">
              <FaEnvelope /> Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              required
              placeholder="your@email.com"
              className="form-input"
            />
          </motion.div>

          {/* Password Field */}
          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="password">
              <FaLock /> Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              required
              placeholder="••••••••"
              className="form-input"
            />
          </motion.div>

          {/* Remember Me - Optional */}
          <motion.div className="form-options" variants={itemVariants}>
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <Link to="#" className="forgot-password">
              Forgot password?
            </Link>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            className="auth-btn"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            variants={itemVariants}
          >
            {loading ? (
              <>
                <FaSpinner className="spinner" /> Logging in...
              </>
            ) : (
              'Login Now'
            )}
          </motion.button>

          {/* Divider */}
          <motion.div className="divider" variants={itemVariants}>
            <span>New to FitHub?</span>
          </motion.div>

          {/* Sign Up Link */}
          <motion.p className="auth-link" variants={itemVariants}>
            Don't have an account?{' '}
            <Link to="/register" className="signup-link">
              Register here
            </Link>
          </motion.p>

          {/* Features List */}
          <motion.div className="features-list" variants={itemVariants}>
            <div className="feature-item">
              <FaDumbbell /> Personalized Workouts
            </div>
            <div className="feature-item">
              <FaHeart /> Nutrition Tracking
            </div>
            <div className="feature-item">
              <FaBolt /> Real-time Progress
            </div>
          </motion.div>
        </motion.form>
      </motion.div>

      {/* Video Background (optional - add your gym video) */}
      <div className="bg-video-container">
        <div className="bg-overlay"></div>
      </div>
    </div>
  );
};

export default Login;