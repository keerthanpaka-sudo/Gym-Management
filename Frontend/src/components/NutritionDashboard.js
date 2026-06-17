import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaUtensils, FaFire, FaWeight } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../config/apiConfig';
import './NutritionDashboard.css';

const NutritionDashboard = () => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    goal: 'weight_loss',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    meals: [],
  });

  useEffect(() => {
    fetchNutritionPlans();
  }, []);

  const fetchNutritionPlans = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(API_ENDPOINTS.NUTRITION, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlans(response.data || []);
    } catch (error) {
      console.error('Nutrition fetch error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to fetch nutrition plans');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const payload = {
        ...formData,
        ...(user._id ? { user: user._id } : {}),
      };

      const response = await axios.post(API_ENDPOINTS.CREATE_NUTRITION, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPlans([response.data, ...plans]);
      setShowCreateForm(false);
      setFormData({
        name: '',
        goal: 'weight_loss',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        meals: [],
      });
      toast.success('Nutrition plan created successfully');
    } catch (error) {
      console.error('Nutrition create error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to create nutrition plan');
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this nutrition plan?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(API_ENDPOINTS.DELETE_NUTRITION(planId), {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPlans(plans.filter(plan => plan._id !== planId));
      toast.success('Nutrition plan deleted successfully');
    } catch (error) {
      toast.error('Failed to delete nutrition plan');
    }
  };

  const addMeal = () => {
    setFormData({
      ...formData,
      meals: [...formData.meals, {
        type: 'breakfast',
        name: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        ingredients: [],
      }]
    });
  };

  const updateMeal = (index, field, value) => {
    const updatedMeals = [...formData.meals];
    updatedMeals[index][field] = value;
    setFormData({ ...formData, meals: updatedMeals });
  };

  if (loading) {
    return <div className="loading">Loading nutrition plans...</div>;
  }

  return (
    <div className="nutrition-dashboard">
      <div className="dashboard-header">
        <h2><FaUtensils /> Nutrition Plans</h2>
        <button
          className="btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          <FaPlus /> Create Plan
        </button>
      </div>

      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create Nutrition Plan</h3>
              <button
                className="close-btn"
                onClick={() => setShowCreateForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="nutrition-form">
              <div className="form-group">
                <label>Plan Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Goal</label>
                  <select
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  >
                    <option value="weight_loss">Weight Loss</option>
                    <option value="muscle_gain">Muscle Gain</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="general_health">General Health</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Daily Calories</label>
                  <input
                    type="number"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="macros-section">
                <h4>Daily Macros</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Protein (g)</label>
                    <input
                      type="number"
                      value={formData.protein}
                      onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Carbs (g)</label>
                    <input
                      type="number"
                      value={formData.carbs}
                      onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Fat (g)</label>
                    <input
                      type="number"
                      value={formData.fat}
                      onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="meals-section">
                <div className="meals-header">
                  <h4>Meals</h4>
                  <button type="button" className="btn-secondary" onClick={addMeal}>
                    <FaPlus /> Add Meal
                  </button>
                </div>

                {formData.meals.map((meal, index) => (
                  <div key={index} className="meal-item">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Meal Type</label>
                        <select
                          value={meal.type}
                          onChange={(e) => updateMeal(index, 'type', e.target.value)}
                        >
                          <option value="breakfast">Breakfast</option>
                          <option value="lunch">Lunch</option>
                          <option value="dinner">Dinner</option>
                          <option value="snack">Snack</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Meal Name</label>
                        <input
                          type="text"
                          value={meal.name}
                          onChange={(e) => updateMeal(index, 'name', e.target.value)}
                          placeholder="e.g., Grilled Chicken Salad"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Calories</label>
                        <input
                          type="number"
                          value={meal.calories}
                          onChange={(e) => updateMeal(index, 'calories', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Protein (g)</label>
                        <input
                          type="number"
                          value={meal.protein}
                          onChange={(e) => updateMeal(index, 'protein', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Carbs (g)</label>
                        <input
                          type="number"
                          value={meal.carbs}
                          onChange={(e) => updateMeal(index, 'carbs', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Fat (g)</label>
                        <input
                          type="number"
                          value={meal.fat}
                          onChange={(e) => updateMeal(index, 'fat', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="plans-grid">
        {plans.length === 0 ? (
          <div className="empty-state">
            <FaUtensils size={48} />
            <h3>No nutrition plans yet</h3>
            <p>Create your first nutrition plan to start tracking your meals and macros.</p>
          </div>
        ) : (
          plans.map(plan => (
            <div key={plan._id} className="plan-card">
              <div className="plan-header">
                <h3>{plan.name}</h3>
                <div className="plan-actions">
                  <button
                    className="btn-icon"
                    onClick={() => setSelectedPlan(plan)}
                    title="View Details"
                  >
                    <FaCalendarAlt />
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => handleDeletePlan(plan._id)}
                    title="Delete Plan"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="plan-meta">
                <span className={`goal-badge goal-${plan.goal}`}>
                  {plan.goal.replace('_', ' ').toUpperCase()}
                </span>
                <span className="calories">
                  <FaFire /> {plan.calories} cal/day
                </span>
              </div>

              {plan.macros && (
                <div className="macros-display">
                  <div className="macro-item">
                    <span className="macro-label">Protein</span>
                    <span className="macro-value">{plan.macros.protein || 0}g</span>
                  </div>
                  <div className="macro-item">
                    <span className="macro-label">Carbs</span>
                    <span className="macro-value">{plan.macros.carbs || 0}g</span>
                  </div>
                  <div className="macro-item">
                    <span className="macro-label">Fat</span>
                    <span className="macro-value">{plan.macros.fat || 0}g</span>
                  </div>
                </div>
              )}

              <div className="meals-preview">
                <h4>Meals ({plan.meals?.length || 0})</h4>
                {plan.meals?.slice(0, 3).map((meal, index) => (
                  <div key={index} className="meal-preview">
                    <span className="meal-type">{meal.type}</span>
                    <span className="meal-name">{meal.name}</span>
                    <span className="meal-calories">{meal.calories} cal</span>
                  </div>
                ))}
                {plan.meals?.length > 3 && (
                  <div className="more-meals">+{plan.meals.length - 3} more meals</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedPlan && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h3>{selectedPlan.name}</h3>
              <button
                className="close-btn"
                onClick={() => setSelectedPlan(null)}
              >
                ×
              </button>
            </div>

            <div className="plan-details">
              <div className="plan-overview">
                <div className="overview-item">
                  <FaFire />
                  <span>{selectedPlan.calories} calories/day</span>
                </div>
                <div className="overview-item">
                  <span className={`goal-badge goal-${selectedPlan.goal}`}>
                    {selectedPlan.goal.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              {selectedPlan.macros && (
                <div className="detailed-macros">
                  <h4>Daily Macros</h4>
                  <div className="macros-grid">
                    <div className="macro-detail">
                      <div className="macro-number">{selectedPlan.macros.protein || 0}g</div>
                      <div className="macro-label">Protein</div>
                    </div>
                    <div className="macro-detail">
                      <div className="macro-number">{selectedPlan.macros.carbs || 0}g</div>
                      <div className="macro-label">Carbs</div>
                    </div>
                    <div className="macro-detail">
                      <div className="macro-number">{selectedPlan.macros.fat || 0}g</div>
                      <div className="macro-label">Fat</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="meals-list">
                <h4>Meals</h4>
                {selectedPlan.meals?.map((meal, index) => (
                  <div key={index} className="meal-detail">
                    <div className="meal-header">
                      <h5>{meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}</h5>
                      <span className="meal-calories">{meal.calories} cal</span>
                    </div>
                    <p className="meal-name">{meal.name}</p>
                    <div className="meal-macros">
                      <span>P: {meal.protein}g</span>
                      <span>C: {meal.carbs}g</span>
                      <span>F: {meal.fat}g</span>
                    </div>
                    {meal.ingredients && meal.ingredients.length > 0 && (
                      <div className="meal-ingredients">
                        <strong>Ingredients:</strong> {meal.ingredients.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionDashboard;