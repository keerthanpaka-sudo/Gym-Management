import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../config/apiConfig';
import './Nutrition.css';

const Nutrition = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    duration: '',
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(API_ENDPOINTS.NUTRITION, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlans(Array.isArray(res.data) ? res.data : res.data.plans || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch nutrition plans. Please check your connection.');
      console.error('Nutrition fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      if (editingId) {
        // Update existing plan
        await axios.put(API_ENDPOINTS.UPDATE_NUTRITION(editingId), formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Nutrition plan updated successfully!');
      } else {
        // Create new plan
        await axios.post(API_ENDPOINTS.CREATE_NUTRITION, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Nutrition plan created successfully!');
      }

      setFormData({
        name: '',
        description: '',
        calories: '',
        protein: '',
        carbs: '',
        fats: '',
        duration: '',
      });
      setEditingId(null);
      setShowForm(false);
      fetchPlans();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save nutrition plan');
    }
  };

  const handleEdit = (plan) => {
    setFormData(plan);
    setEditingId(plan._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(API_ENDPOINTS.DELETE_NUTRITION(id), {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Nutrition plan deleted successfully!');
        fetchPlans();
      } catch (err) {
        toast.error('Failed to delete nutrition plan');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      calories: '',
      protein: '',
      carbs: '',
      fats: '',
      duration: '',
    });
  };

  if (loading && !showForm) {
    return (
      <div className="nutrition-page">
        <div className="loading">Loading nutrition plans...</div>
      </div>
    );
  }

  return (
    <div className="nutrition-page">
      <header className="page-header">
        <h1>Nutrition Plans</h1>
        <button
          className="add-plan-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'New Plan'}
        </button>
      </header>

      {showForm && (
        <div className="nutrition-form-container">
          <form className="nutrition-form" onSubmit={handleSubmit}>
            <h3>{editingId ? 'Edit Nutrition Plan' : 'Create New Nutrition Plan'}</h3>

            <div className="form-group">
              <label htmlFor="name">Plan Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., High Protein Diet"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Plan details and guidelines"
                rows="3"
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="calories">Calories (per day)</label>
                <input
                  type="number"
                  id="calories"
                  name="calories"
                  value={formData.calories}
                  onChange={handleInputChange}
                  placeholder="2000"
                />
              </div>

              <div className="form-group">
                <label htmlFor="protein">Protein (g)</label>
                <input
                  type="number"
                  id="protein"
                  name="protein"
                  value={formData.protein}
                  onChange={handleInputChange}
                  placeholder="150"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="carbs">Carbs (g)</label>
                <input
                  type="number"
                  id="carbs"
                  name="carbs"
                  value={formData.carbs}
                  onChange={handleInputChange}
                  placeholder="250"
                />
              </div>

              <div className="form-group">
                <label htmlFor="fats">Fats (g)</label>
                <input
                  type="number"
                  id="fats"
                  name="fats"
                  value={formData.fats}
                  onChange={handleInputChange}
                  placeholder="65"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="duration">Duration (weeks)</label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="12"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn">
                {editingId ? 'Update Plan' : 'Create Plan'}
              </button>
              <button type="button" className="cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="plans-container">
        {plans.length === 0 ? (
          <div className="no-plans">
            <p>No nutrition plans available. Create one to get started!</p>
          </div>
        ) : (
          <div className="plans-grid">
            {plans.map((plan) => (
              <div key={plan._id} className="plan-card">
                <div className="plan-header">
                  <h3>{plan.name}</h3>
                  <div className="plan-actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(plan)}
                      title="Edit plan"
                    >
                      ✏️
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(plan._id)}
                      title="Delete plan"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {plan.description && (
                  <p className="plan-description">{plan.description}</p>
                )}

                <div className="plan-details">
                  {plan.calories && (
                    <div className="detail-item">
                      <span className="label">Calories:</span>
                      <span className="value">{plan.calories} kcal/day</span>
                    </div>
                  )}
                  {plan.protein && (
                    <div className="detail-item">
                      <span className="label">Protein:</span>
                      <span className="value">{plan.protein}g</span>
                    </div>
                  )}
                  {plan.carbs && (
                    <div className="detail-item">
                      <span className="label">Carbs:</span>
                      <span className="value">{plan.carbs}g</span>
                    </div>
                  )}
                  {plan.fats && (
                    <div className="detail-item">
                      <span className="label">Fats:</span>
                      <span className="value">{plan.fats}g</span>
                    </div>
                  )}
                  {plan.duration && (
                    <div className="detail-item">
                      <span className="label">Duration:</span>
                      <span className="value">{plan.duration} weeks</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Nutrition;
