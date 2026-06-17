import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaCalendarAlt, FaFire, FaPlus, FaTrash, FaUtensils } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../config/apiConfig';
import './NutritionDashboard.css';

const defaultFormData = () => ({
  weight: '',
  goal: 'general_health',
  dietPreference: 'veg',
});

const mealTypeOrder = ['breakfast', 'lunch', 'dinner', 'snack'];

const goalCalorieMultiplier = {
  weight_loss: 28,
  muscle_gain: 35,
  maintenance: 31,
  general_health: 30,
};

const estimateCaloriesFromWeight = (weight, goal) => {
  const multiplier = goalCalorieMultiplier[goal] || goalCalorieMultiplier.general_health;
  return Math.round(weight * multiplier);
};

const formatGoal = (goal = 'maintenance') => goal.replace(/_/g, ' ').toUpperCase();
const formatDietPreference = (dietPreference = 'veg') => (
  dietPreference === 'non_veg' ? 'Non-Veg' : dietPreference === 'eggetarian' ? 'Eggetarian' : 'Veg'
);

const formatMealType = (type = 'meal') => type.charAt(0).toUpperCase() + type.slice(1);

const formatIngredients = (ingredients = []) => {
  const seenIngredients = new Set();

  return ingredients
    .map((ingredient) => {
      if (typeof ingredient === 'string') {
        return ingredient.trim();
      }

      if (!ingredient?.name) {
        return '';
      }

      return ingredient.quantity ? `${ingredient.name} (${ingredient.quantity})` : ingredient.name;
    })
    .filter(Boolean)
    .filter((ingredientLabel) => {
      const key = ingredientLabel.toLowerCase();
      if (seenIngredients.has(key)) {
        return false;
      }
      seenIngredients.add(key);
      return true;
    })
    .join(', ');
};

const dedupeIngredients = (ingredients = []) => {
  const seenIngredients = new Set();

  return ingredients.filter((ingredient) => {
    const name = typeof ingredient === 'string' ? ingredient : ingredient?.name;
    const quantity = typeof ingredient === 'string' ? '' : ingredient?.quantity || '';
    const key = `${String(name || '').trim().toLowerCase()}|${String(quantity).trim().toLowerCase()}`;

    if (!name || seenIngredients.has(key)) {
      return false;
    }

    seenIngredients.add(key);
    return true;
  });
};

const normalizeMeal = (meal = {}, index = 0) => {
  const mealType = meal.type || meal.mealType || 'breakfast';
  return {
    day: Number(meal.day) || Math.floor(index / mealTypeOrder.length) + 1,
    type: mealType,
    mealType,
    name: meal.name || `${formatMealType(mealType)} Meal`,
    calories: Number(meal.calories ?? meal.totalCalories) || 0,
    protein: Number(meal.protein) || 0,
    carbs: Number(meal.carbs) || 0,
    fat: Number(meal.fat) || 0,
    ingredients: Array.isArray(meal.ingredients) ? dedupeIngredients(meal.ingredients) : [],
  };
};

const normalizePlan = (plan = {}) => {
  const macros = {
    protein: Number(plan.macros?.protein ?? plan.protein) || 0,
    carbs: Number(plan.macros?.carbs ?? plan.carbs) || 0,
    fat: Number(plan.macros?.fat ?? plan.fat ?? plan.fats) || 0,
  };

  return {
    ...plan,
    name: plan.name || plan.title || 'Nutrition Plan',
    goal: plan.goal || 'maintenance',
    weight: Number(plan.weight) || 0,
    dietPreference: ['veg', 'eggetarian', 'non_veg'].includes(plan.dietPreference) ? plan.dietPreference : 'veg',
    calories: Number(plan.calories || plan.targetCalories?.max) || 0,
    duration: Number(plan.duration) || 1,
    macros,
    meals: Array.isArray(plan.meals) ? plan.meals.map(normalizeMeal) : [],
  };
};

const groupMealsByDay = (meals = []) => {
  const groupedMeals = meals.reduce((days, meal) => {
    const day = meal.day || 1;
    if (!days[day]) {
      days[day] = [];
    }
    days[day].push(meal);
    return days;
  }, {});

  return Object.entries(groupedMeals)
    .map(([day, dayMeals]) => ({
      day: Number(day),
      meals: dayMeals.sort(
        (first, second) => mealTypeOrder.indexOf(first.mealType) - mealTypeOrder.indexOf(second.mealType)
      ),
    }))
    .sort((first, second) => first.day - second.day);
};

const NutritionDashboardV2 = () => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    fetchNutritionPlans();
  }, []);

  const fetchNutritionPlans = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(API_ENDPOINTS.NUTRITION, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlans((response.data || []).map(normalizePlan));
    } catch (error) {
      console.error('Nutrition fetch error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to fetch nutrition plans');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const closeCreateForm = () => {
    setShowCreateForm(false);
    setFormData(defaultFormData());
  };

  const handleCreatePlan = async (event) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const weight = Number(formData.weight);
      const estimatedCalories = estimateCaloriesFromWeight(weight, formData.goal);
      const planName = `${weight}kg ${formatGoal(formData.goal)} ${formatDietPreference(formData.dietPreference)} Nutrition Plan`;
      const payload = {
        name: planName,
        title: planName,
        goal: formData.goal,
        calories: estimatedCalories,
        meals: [],
        weight,
        dietPreference: formData.dietPreference,
      };

      const response = await axios.post(API_ENDPOINTS.CREATE_NUTRITION, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const normalizedPlan = normalizePlan(response.data);
      setPlans((currentPlans) => [normalizedPlan, ...currentPlans]);
      setSelectedPlan(normalizedPlan);
      closeCreateForm();
      toast.success('Nutrition plan created automatically from member details');
    } catch (error) {
      console.error('Nutrition create error:', error.response?.data || error.message);
      const validationMessage = error.response?.data?.errors
        ?.map((entry) => entry.msg)
        ?.join(', ');
      toast.error(validationMessage || error.response?.data?.message || 'Failed to create nutrition plan');
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this nutrition plan?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(API_ENDPOINTS.DELETE_NUTRITION(planId), {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPlans((currentPlans) => currentPlans.filter((plan) => plan._id !== planId));
      if (selectedPlan?._id === planId) {
        setSelectedPlan(null);
      }
      toast.success('Nutrition plan deleted successfully');
    } catch (error) {
      toast.error('Failed to delete nutrition plan');
    }
  };

  if (loading) {
    return <div className="loading">Loading nutrition plans...</div>;
  }

  return (
    <div className="nutrition-dashboard">
      <div className="dashboard-header">
        <h2><FaUtensils /> Nutrition Plans</h2>
        <button className="nutrition-btn-primary" onClick={() => setShowCreateForm(true)}>
          <FaPlus /> Create Plan
        </button>
      </div>

      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create Nutrition Plan</h3>
              <button className="close-btn" onClick={closeCreateForm}>
                x
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="nutrition-form">
              <div className="form-group">
                <label>Member Weight (kg)</label>
                <input
                  type="number"
                  min="20"
                  value={formData.weight}
                  onChange={(event) => setFormData({ ...formData, weight: event.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Food Preference</label>
                <select
                  value={formData.dietPreference}
                  onChange={(event) => setFormData({ ...formData, dietPreference: event.target.value })}
                >
                  <option value="veg">Veg</option>
                  <option value="eggetarian">Eggetarian</option>
                  <option value="non_veg">Non-Veg</option>
                </select>
              </div>

              <div className="form-group">
                <label>Goal</label>
                <select
                  value={formData.goal}
                  onChange={(event) => setFormData({ ...formData, goal: event.target.value })}
                >
                  <option value="weight_loss">Weight Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="general_health">General Health</option>
                </select>
              </div>

              <div className="macros-section">
                <h4>Auto Generation</h4>
                <p className="section-note">
                  The app will calculate calories and macros from the member weight and selected goal, then generate a full Day 1 to Day 7 nutrition plan based on the selected food preference.
                </p>
              </div>

              <div className="form-actions">
                <button type="button" className="nutrition-btn-secondary" onClick={closeCreateForm}>
                  Cancel
                </button>
                <button type="submit" className="nutrition-btn-primary">
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
          plans.map((plan) => {
            const mealsByDay = groupMealsByDay(plan.meals);
            return (
              <div key={plan._id} className="plan-card">
                <div className="plan-header">
                  <h3>{plan.name}</h3>
                  <div className="plan-actions">
                    <button className="btn-icon" onClick={() => setSelectedPlan(plan)} title="View Details">
                      <FaCalendarAlt />
                    </button>
                    <button className="btn-icon" onClick={() => handleDeletePlan(plan._id)} title="Delete Plan">
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div className="plan-meta">
                  <span className={`goal-badge goal-${plan.goal}`}>
                    {formatGoal(plan.goal)}
                  </span>
                  <span className="calories">
                    <FaFire /> {plan.calories} cal/day
                  </span>
                </div>

                <div className="plan-profile">
                  <span>{plan.weight ? `${plan.weight} kg` : 'Weight not set'}</span>
                  <span>{formatDietPreference(plan.dietPreference)}</span>
                </div>

                <div className="macros-display">
                  <div className="macro-item">
                    <span className="macro-label">Protein</span>
                    <span className="macro-value">{plan.macros.protein}g</span>
                  </div>
                  <div className="macro-item">
                    <span className="macro-label">Carbs</span>
                    <span className="macro-value">{plan.macros.carbs}g</span>
                  </div>
                  <div className="macro-item">
                    <span className="macro-label">Fat</span>
                    <span className="macro-value">{plan.macros.fat}g</span>
                  </div>
                </div>

                <div className="meals-preview">
                  <h4>Meal Plan</h4>
                  {mealsByDay.length === 0 ? (
                    <div className="more-meals">Meals are still unavailable for this plan.</div>
                  ) : (
                    <>
                      {mealsByDay.slice(0, 2).map((dayPlan) => (
                        <div key={dayPlan.day} className="day-preview">
                          <div className="day-preview-title">Day {dayPlan.day}</div>
                          {dayPlan.meals.slice(0, 2).map((meal, index) => (
                            <div key={`${dayPlan.day}-${index}`} className="meal-preview">
                              <span className="meal-type">{meal.mealType}</span>
                              <span className="meal-name">{meal.name}</span>
                              <span className="meal-calories">{meal.calories} cal</span>
                            </div>
                          ))}
                        </div>
                      ))}
                      {mealsByDay.length > 2 && (
                        <div className="more-meals">+{mealsByDay.length - 2} more days</div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedPlan && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h3>{selectedPlan.name}</h3>
              <button className="close-btn" onClick={() => setSelectedPlan(null)}>
                x
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
                    {formatGoal(selectedPlan.goal)}
                  </span>
                </div>
                <div className="overview-item">
                  <span>{selectedPlan.weight ? `${selectedPlan.weight} kg` : 'Weight not set'}</span>
                </div>
                <div className="overview-item">
                  <span>{formatDietPreference(selectedPlan.dietPreference)}</span>
                </div>
              </div>

              <div className="detailed-macros">
                <h4>Daily Macros</h4>
                <div className="macros-grid">
                  <div className="macro-detail">
                    <div className="macro-number">{selectedPlan.macros.protein}g</div>
                    <div className="macro-label">Protein</div>
                  </div>
                  <div className="macro-detail">
                    <div className="macro-number">{selectedPlan.macros.carbs}g</div>
                    <div className="macro-label">Carbs</div>
                  </div>
                  <div className="macro-detail">
                    <div className="macro-number">{selectedPlan.macros.fat}g</div>
                    <div className="macro-label">Fat</div>
                  </div>
                </div>
              </div>

              <div className="meals-list">
                <h4>Day-wise Meal Plan</h4>
                {groupMealsByDay(selectedPlan.meals).length === 0 ? (
                  <div className="more-meals">No meals were generated for this plan.</div>
                ) : (
                  groupMealsByDay(selectedPlan.meals).map((dayPlan) => (
                    <div key={dayPlan.day} className="day-section">
                      <div className="day-section-header">Day {dayPlan.day} Meal Plan</div>
                      {dayPlan.meals.map((meal, index) => (
                        <div key={`${dayPlan.day}-${index}`} className="meal-detail">
                          <div className="meal-header">
                            <h5>{formatMealType(meal.mealType)}</h5>
                            <span className="meal-calories">{meal.calories} cal</span>
                          </div>
                          <p className="meal-name">{meal.name}</p>
                          <div className="meal-macros">
                            <span>P: {meal.protein}g</span>
                            <span>C: {meal.carbs}g</span>
                            <span>F: {meal.fat}g</span>
                          </div>
                          {meal.ingredients.length > 0 && (
                            <div className="meal-ingredients">
                              <strong>Ingredients:</strong> {formatIngredients(meal.ingredients)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionDashboardV2;
