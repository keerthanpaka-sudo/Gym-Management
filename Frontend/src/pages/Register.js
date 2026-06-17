import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaSpinner, FaDumbbell, FaHeart, FaBolt } from 'react-icons/fa';
import { API_ENDPOINTS } from '../config/apiConfig';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { name, email, password, role } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(API_ENDPOINTS.AUTH_REGISTER, formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      toast.success('Registration successful! Welcome to FitHub! 💪');

      setTimeout(() => {
        // Redirect based on role
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
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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
          <p>Join Your Fitness Community</p>
        </motion.div>

        {/* Form Card */}
        <motion.form onSubmit={onSubmit} className="auth-form" variants={itemVariants}>
          <h2>Create Your Account</h2>

          {/* Full Name Field */}
          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="name">
              <FaUser /> Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={onChange}
              required
              placeholder="John Doe"
              className="form-input"
            />
          </motion.div>

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

          {/* Role Selection */}
          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="role">
              <FaUser /> Role
            </label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={onChange}
              className="form-input"
            >
              <option value="member">Member</option>
              <option value="trainer">Trainer</option>
              <option value="admin">Admin</option>
            </select>
          </motion.div>

          {/* Terms Checkbox */}
          <motion.div className="form-options" variants={itemVariants}>
            <label className="checkbox-label">
              <input type="checkbox" required />
              <span>I agree to the Terms and Conditions</span>
            </label>
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
                <FaSpinner className="spinner" /> Creating Account...
              </>
            ) : (
              'Register Now'
            )}
          </motion.button>

          {/* Divider */}
          <motion.div className="divider" variants={itemVariants}>
            <span>Already have an account?</span>
          </motion.div>

          {/* Sign In Link */}
          <motion.p className="auth-link" variants={itemVariants}>
            Have an account?{' '}
            <Link to="/login" className="signup-link">
              Login here
            </Link>
          </motion.p>

          {/* Features List */}
          <motion.div className="features-list" variants={itemVariants}>
            <div className="feature-item">
              <FaDumbbell /> Custom Plans
            </div>
            <div className="feature-item">
              <FaHeart /> Community
            </div>
            <div className="feature-item">
              <FaBolt /> Expert Support
            </div>
          </motion.div>
        </motion.form>
      </motion.div>

      {/* Video Background (optional) */}
      <div className="bg-video-container">
        <div className="bg-overlay"></div>
      </div>
    </div>
  );
};

export default Register;