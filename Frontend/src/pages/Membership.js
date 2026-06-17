import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaPlus, FaShieldAlt, FaStar } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../config/apiConfig';
import './Membership.css';

const SUGGESTED_PLANS = [
  {
    _id: 'plan-monthly',
    name: 'Monthly Membership',
    description: 'Perfect for short-term access with full gym and class privileges.',
    price: 2500,
    duration: 1,
    category: 'starter',
    popular: false,
    features: ['Unlimited gym access', 'Group classes', 'Weekly progress support']
  },
  {
    _id: 'plan-quarterly',
    name: '3-Month Membership',
    description: 'Best value for a stronger routine and steady progress.',
    price: 6500,
    duration: 3,
    category: 'popular',
    popular: true,
    features: ['Unlimited gym access', 'Group classes', 'Monthly trainer check-in', 'Free nutrition guide']
  },
  {
    _id: 'plan-halfyear',
    name: '6-Month Membership',
    description: 'A stronger commitment package with savings and coaching support.',
    price: 12000,
    duration: 6,
    category: 'premium',
    popular: false,
    features: ['Unlimited gym access', 'Group classes', 'Trainer coaching', 'BMI and progress tracking']
  },
  {
    _id: 'plan-yearly',
    name: 'Yearly Membership',
    description: 'Maximum savings for long-term fitness and premium support.',
    price: 22500,
    duration: 12,
    category: 'elite',
    popular: false,
    features: ['Unlimited gym access', 'All classes included', 'Personalized trainer plan', 'Priority support']
  }
];

const normalizePlan = (plan = {}) => ({
  ...plan,
  price: Number(plan.price) || 0,
  duration: Number(plan.duration) || 1,
  category: plan.category || (plan.duration >= 12 ? 'elite' : plan.duration >= 6 ? 'premium' : plan.duration >= 3 ? 'popular' : 'starter'),
  popular: Boolean(plan.popular || plan.duration === 3),
  features: Array.isArray(plan.features)
    ? plan.features
    : typeof plan.features === 'string'
      ? plan.features.split(',').map((item) => item.trim()).filter(Boolean)
      : []
});

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;

const Membership = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [myMembership, setMyMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    features: ''
  });
  const [editingId, setEditingId] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchPlans();
    fetchMyMembership();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(API_ENDPOINTS.MEMBERSHIP_PLANS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fetchedPlans = Array.isArray(res.data) ? res.data.map(normalizePlan) : [];
      setPlans(fetchedPlans.length ? fetchedPlans : SUGGESTED_PLANS.map(normalizePlan));
    } catch (err) {
      setPlans(SUGGESTED_PLANS.map(normalizePlan));
    } finally {
      setLoading(false);
    }
  };

  const fetchMyMembership = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(API_ENDPOINTS.MY_MEMBERSHIP, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyMembership(res.data);
    } catch (err) {
      setMyMembership(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        price: Number(formData.price),
        duration: Number(formData.duration),
        features: formData.features
      };

      if (editingId) {
        await axios.put(API_ENDPOINTS.UPDATE_MEMBERSHIP_PLAN(editingId), payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Membership plan updated successfully');
      } else {
        await axios.post(API_ENDPOINTS.CREATE_MEMBERSHIP_PLAN, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Membership plan created successfully');
      }

      setFormData({ name: '', description: '', price: '', duration: '', features: '' });
      setEditingId(null);
      setShowForm(false);
      fetchPlans();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save membership plan');
    }
  };

  const handleCancelMembership = async () => {
    if (!window.confirm('Are you sure you want to cancel your membership?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(API_ENDPOINTS.CANCEL_MEMBERSHIP, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Membership cancelled successfully');
      fetchMyMembership();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel membership');
    }
  };

  const handleEdit = (plan) => {
    setFormData({
      name: plan.name || '',
      description: plan.description || '',
      price: plan.price || '',
      duration: plan.duration || '',
      features: Array.isArray(plan.features) ? plan.features.join(', ') : plan.features || ''
    });
    setEditingId(plan._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(API_ENDPOINTS.DELETE_MEMBERSHIP_PLAN(id), {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Membership plan deleted successfully');
      fetchPlans();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete membership plan');
    }
  };

  const plansToRender = useMemo(() => (plans.length ? plans : SUGGESTED_PLANS.map(normalizePlan)), [plans]);

  if (loading && !showForm) {
    return <div className="membership-page"><div className="loading">Loading membership plans...</div></div>;
  }

  return (
    <div className="membership-page">
      <section className="membership-hero">
        <div className="membership-hero-copy">
          <span className="membership-eyebrow">Membership Plans</span>
          <h1>Compare plans, review status, and manage access in one place</h1>
          <p>
            Choose the membership that fits your training timeline, upgrade through payments, and keep your active status visible from one cleaner page.
          </p>
        </div>

        <div className="membership-hero-card">
          <FaShieldAlt />
          <div>
            <strong>Activation flow</strong>
            <span>Membership status updates after successful payment confirmation.</span>
          </div>
        </div>
      </section>

      {myMembership && (
        <section className="current-membership-card">
          <div>
            <span className="membership-eyebrow">Current Membership</span>
            <h2>{myMembership.planName}</h2>
            <p>
              {myMembership.center ? `${myMembership.center} center selected.` : 'Center selection not set yet.'}
              {myMembership.expiryDate ? ` Expires on ${new Date(myMembership.expiryDate).toLocaleDateString()}.` : ''}
            </p>
          </div>
          {!isAdmin && (
            <button className="cancel-membership-btn" onClick={handleCancelMembership}>
              Cancel Membership
            </button>
          )}
        </section>
      )}

      {isAdmin && (
        <section className="membership-admin-toolbar">
          <button className="membership-primary-btn" onClick={() => setShowForm((current) => !current)}>
            <FaPlus /> {showForm ? 'Close Form' : 'Create Plan'}
          </button>
        </section>
      )}

      {showForm && isAdmin && (
        <section className="membership-form-container">
          <form className="membership-form" onSubmit={handleSubmit}>
            <h3>{editingId ? 'Edit Membership Plan' : 'Create Membership Plan'}</h3>

            <div className="form-group">
              <label htmlFor="name">Plan Name</label>
              <input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows="3" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price</label>
                <input id="price" name="price" type="number" value={formData.price} onChange={handleInputChange} required />
              </div>

              <div className="form-group">
                <label htmlFor="duration">Duration (months)</label>
                <input id="duration" name="duration" type="number" value={formData.duration} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="features">Features (comma-separated)</label>
              <textarea id="features" name="features" value={formData.features} onChange={handleInputChange} rows="3" />
            </div>

            <div className="form-actions">
              <button type="submit" className="membership-primary-btn">
                {editingId ? 'Update Plan' : 'Create Plan'}
              </button>
              <button
                type="button"
                className="membership-secondary-btn"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ name: '', description: '', price: '', duration: '', features: '' });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="membership-grid">
        {plansToRender.map((plan) => (
          <article key={plan._id} className={`membership-plan-card ${plan.popular ? 'popular' : ''}`}>
            <div className="plan-topline">
              <span className={`plan-category category-${plan.category}`}>{plan.category}</span>
              {plan.popular && (
                <span className="plan-badge">
                  <FaStar /> Recommended
                </span>
              )}
            </div>

            <h3>{plan.name}</h3>
            <p className="plan-description">{plan.description}</p>
            <div className="plan-price">
              <span className="currency">Rs.</span>
              <span className="amount">{Number(plan.price).toLocaleString('en-IN')}</span>
              <span className="period">/{plan.duration} month{plan.duration > 1 ? 's' : ''}</span>
            </div>

            <ul className="plan-features">
              {plan.features.map((feature, index) => (
                <li key={index}><FaCheckCircle /> <span>{feature}</span></li>
              ))}
            </ul>

            <div className="plan-actions-row">
              {isAdmin ? (
                <>
                  <button className="membership-secondary-btn" onClick={() => handleEdit(plan)}>Edit</button>
                  <button className="membership-danger-btn" onClick={() => handleDelete(plan._id)}>Delete</button>
                </>
              ) : (
                <button
                  className="membership-primary-btn"
                  onClick={() => navigate('/payments', { state: { selectedPlanName: plan.name } })}
                >
                  {myMembership?.planId === plan._id ? 'Renew / Pay Again' : 'Proceed to Payment'}
                </button>
              )}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};

export default Membership;
