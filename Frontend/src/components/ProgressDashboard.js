import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaChartLine, FaWeight, FaRuler, FaCalendarAlt, FaTrophy } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../config/apiConfig';
import './ProgressDashboard.css';

const chartWidth = 320;
const chartHeight = 180;
const chartPadding = 24;

const formatShortDate = (value) => new Date(value).toLocaleDateString('en-GB', {
  day: '2-digit',
  month: 'short',
});

const getNumericValue = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const buildLinePath = (values) => {
  if (values.length === 0) {
    return '';
  }

  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue || 1;
  const usableWidth = chartWidth - chartPadding * 2;
  const usableHeight = chartHeight - chartPadding * 2;

  return values.map((value, index) => {
    const x = chartPadding + (values.length === 1 ? usableWidth / 2 : (usableWidth / (values.length - 1)) * index);
    const y = chartHeight - chartPadding - (((value - minValue) / range) * usableHeight);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
};

const buildChartData = (entries, accessor) => {
  const points = entries
    .map((entry) => ({
      label: formatShortDate(entry.date),
      value: getNumericValue(accessor(entry)),
    }))
    .filter((point) => point.value !== null);

  return {
    points,
    values: points.map((point) => point.value),
  };
};

const ProgressLineChart = ({ title, unit, color, points, values }) => {
  if (points.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-card-header">
          <h4>{title}</h4>
          <span>No data yet</span>
        </div>
        <div className="chart-empty">Add progress entries to see this chart.</div>
      </div>
    );
  }

  const linePath = buildLinePath(values);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue || 1;
  const usableWidth = chartWidth - chartPadding * 2;
  const usableHeight = chartHeight - chartPadding * 2;

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h4>{title}</h4>
        <span>{points[points.length - 1].value}{unit}</span>
      </div>
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="line-chart" role="img" aria-label={title}>
        <line x1={chartPadding} y1={chartHeight - chartPadding} x2={chartWidth - chartPadding} y2={chartHeight - chartPadding} className="chart-axis" />
        <line x1={chartPadding} y1={chartPadding} x2={chartPadding} y2={chartHeight - chartPadding} className="chart-axis" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point, index) => {
          const x = chartPadding + (points.length === 1 ? usableWidth / 2 : (usableWidth / (points.length - 1)) * index);
          const y = chartHeight - chartPadding - (((point.value - minValue) / range) * usableHeight);

          return (
            <g key={`${title}-${point.label}-${index}`}>
              <circle cx={x} cy={y} r="5" fill={color} />
              <text x={x} y={chartHeight - 6} textAnchor="middle" className="chart-label">{point.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const ProgressBarChart = ({ title, color, points }) => {
  if (points.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-card-header">
          <h4>{title}</h4>
          <span>No data yet</span>
        </div>
        <div className="chart-empty">Add workout entries to see this chart.</div>
      </div>
    );
  }

  const maxValue = Math.max(...points.map((point) => point.value), 1);
  const usableWidth = chartWidth - chartPadding * 2;
  const usableHeight = chartHeight - chartPadding * 2;
  const barWidth = usableWidth / points.length - 10;

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h4>{title}</h4>
        <span>{points.reduce((sum, point) => sum + point.value, 0)} min total</span>
      </div>
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="bar-chart" role="img" aria-label={title}>
        <line x1={chartPadding} y1={chartHeight - chartPadding} x2={chartWidth - chartPadding} y2={chartHeight - chartPadding} className="chart-axis" />
        {points.map((point, index) => {
          const x = chartPadding + (usableWidth / points.length) * index + 5;
          const barHeight = (point.value / maxValue) * usableHeight;
          const y = chartHeight - chartPadding - barHeight;

          return (
            <g key={`${title}-${point.label}-${index}`}>
              <rect x={x} y={y} width={Math.max(barWidth, 16)} height={barHeight} rx="8" fill={color} opacity="0.9" />
              <text x={x + Math.max(barWidth, 16) / 2} y={y - 6} textAnchor="middle" className="chart-value">{point.value}</text>
              <text x={x + Math.max(barWidth, 16) / 2} y={chartHeight - 6} textAnchor="middle" className="chart-label">{point.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const ProgressDashboard = () => {
  const [progressEntries, setProgressEntries] = useState([]);
  const [stats, setStats] = useState(null);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    measurements: {
      weight: '',
      bodyFat: '',
      muscleMass: '',
      chest: '',
      waist: '',
      hips: '',
      biceps: '',
      thighs: '',
    },
    workouts: [],
    nutrition: {
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
    },
    notes: '',
  });

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user._id || user.id;
      if (!userId) {
        throw new Error('User ID not found');
      }

      const [entriesResponse, statsResponse] = await Promise.all([
        axios.get(API_ENDPOINTS.PROGRESS, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(API_ENDPOINTS.PROGRESS_STATS(userId), {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setProgressEntries(entriesResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Progress fetch error:', error.response?.data || error.message);
      toast.error('Failed to fetch progress data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user._id || user.id;
      if (!userId) {
        throw new Error('User ID not found');
      }
      const payload = {
        date: formData.date,
        weight: formData.measurements.weight || undefined,
        bodyFat: formData.measurements.bodyFat || undefined,
        muscleMass: formData.measurements.muscleMass || undefined,
        measurements: {
          chest: formData.measurements.chest || undefined,
          waist: formData.measurements.waist || undefined,
          hips: formData.measurements.hips || undefined,
          biceps: formData.measurements.biceps || undefined,
          thighs: formData.measurements.thighs || undefined,
        },
        workout: formData.workouts[0] ? {
          exercises: [],
          totalDuration: Number(formData.workouts[0].duration) || 0,
          caloriesBurned: 0,
        } : undefined,
        nutrition: {
          totalCalories: formData.nutrition.calories || undefined,
          mealsLogged: [{
            protein: Number(formData.nutrition.protein) || 0,
            carbs: Number(formData.nutrition.carbs) || 0,
            fat: Number(formData.nutrition.fat) || 0,
            calories: Number(formData.nutrition.calories) || 0,
          }],
        },
        notes: formData.notes,
        user: userId,
      };

      const response = await axios.post(API_ENDPOINTS.CREATE_PROGRESS, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProgressEntries([response.data, ...progressEntries]);
      setShowAddEntry(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        measurements: {
          weight: '',
          bodyFat: '',
          muscleMass: '',
          chest: '',
          waist: '',
          hips: '',
          biceps: '',
          thighs: '',
        },
        workouts: [],
        nutrition: {
          calories: '',
          protein: '',
          carbs: '',
          fat: '',
        },
        notes: '',
      });
      toast.success('Progress entry added successfully');
      fetchProgressData(); // Refresh stats
    } catch (error) {
      console.error('Progress create error:', error.response?.data || error.message);
      toast.error('Failed to add progress entry');
    }
  };

  const addWorkout = () => {
    setFormData({
      ...formData,
      workouts: [...formData.workouts, {
        name: '',
        duration: '',
        exercises: [],
      }]
    });
  };

  const updateWorkout = (index, field, value) => {
    const updatedWorkouts = [...formData.workouts];
    updatedWorkouts[index][field] = value;
    setFormData({ ...formData, workouts: updatedWorkouts });
  };

  const updateMeasurement = (field, value) => {
    setFormData({
      ...formData,
      measurements: {
        ...formData.measurements,
        [field]: value,
      }
    });
  };

  const updateNutrition = (field, value) => {
    setFormData({
      ...formData,
      nutrition: {
        ...formData.nutrition,
        [field]: value,
      }
    });
  };

  if (loading) {
    return <div className="loading">Loading progress data...</div>;
  }

  const sortedEntries = [...progressEntries].sort((first, second) => new Date(first.date) - new Date(second.date));
  const weightChart = buildChartData(sortedEntries, (entry) => entry.weight);
  const bodyFatChart = buildChartData(sortedEntries, (entry) => entry.bodyFat);
  const muscleMassChart = buildChartData(sortedEntries, (entry) => entry.muscleMass);
  const workoutDurationChart = buildChartData(sortedEntries, (entry) => entry.workout?.totalDuration || 0);

  return (
    <div className="progress-dashboard">
      <div className="dashboard-header">
        <h2><FaChartLine /> Progress Tracking</h2>
        <button
          className="btn-primary"
          onClick={() => setShowAddEntry(true)}
        >
          <FaPlus /> Add Entry
        </button>
      </div>

      {stats && (
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon">
              <FaWeight />
            </div>
            <div className="stat-content">
              <h3>{stats.weight.current || 'N/A'} kg</h3>
              <p>Current Weight</p>
              {stats.weight.change !== 0 && (
                <span className={`stat-change ${stats.weight.change > 0 ? 'positive' : 'negative'}`}>
                  {stats.weight.change > 0 ? '+' : ''}{stats.weight.change} kg
                </span>
              )}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FaTrophy />
            </div>
            <div className="stat-content">
              <h3>{stats.workoutsCompleted}</h3>
              <p>Workouts Completed</p>
              <span className="stat-detail">{stats.consistency.toFixed(1)}% consistency</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FaRuler />
            </div>
            <div className="stat-content">
              <h3>{stats.bodyFat.current || 'N/A'}%</h3>
              <p>Body Fat</p>
              {stats.bodyFat.change !== 0 && (
                <span className={`stat-change ${stats.bodyFat.change > 0 ? 'negative' : 'positive'}`}>
                  {stats.bodyFat.change > 0 ? '+' : ''}{stats.bodyFat.change}%
                </span>
              )}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FaCalendarAlt />
            </div>
            <div className="stat-content">
              <h3>{stats.totalEntries}</h3>
              <p>Total Entries</p>
              <span className="stat-detail">Last 30 days</span>
            </div>
          </div>
        </div>
      )}

      <div className="charts-section">
        <div className="charts-header">
          <h3>Progress Graphs</h3>
          <p>Track how your measurements are changing over time.</p>
        </div>
        <div className="charts-grid">
          <ProgressLineChart
            title="Weight Trend"
            unit=" kg"
            color="#1f8ef1"
            points={weightChart.points}
            values={weightChart.values}
          />
          <ProgressLineChart
            title="Body Fat Trend"
            unit="%"
            color="#f39c12"
            points={bodyFatChart.points}
            values={bodyFatChart.values}
          />
          <ProgressLineChart
            title="Muscle Mass Trend"
            unit=" kg"
            color="#27ae60"
            points={muscleMassChart.points}
            values={muscleMassChart.values}
          />
          <ProgressBarChart
            title="Workout Duration"
            color="#8e44ad"
            points={workoutDurationChart.points}
          />
        </div>
      </div>

      {showAddEntry && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h3>Add Progress Entry</h3>
              <button
                className="close-btn"
                onClick={() => setShowAddEntry(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddEntry} className="progress-form">
              <div className="form-section">
                <h4>Date</h4>
                <div className="form-group">
                  <label>Entry Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-section">
                <h4>Body Measurements</h4>
                <div className="measurements-grid">
                  <div className="form-group">
                    <label>Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.measurements.weight}
                      onChange={(e) => updateMeasurement('weight', e.target.value)}
                      placeholder="70.5"
                    />
                  </div>
                  <div className="form-group">
                    <label>Body Fat (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.measurements.bodyFat}
                      onChange={(e) => updateMeasurement('bodyFat', e.target.value)}
                      placeholder="15.2"
                    />
                  </div>
                  <div className="form-group">
                    <label>Muscle Mass (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.measurements.muscleMass}
                      onChange={(e) => updateMeasurement('muscleMass', e.target.value)}
                      placeholder="30.0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Chest (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.measurements.chest}
                      onChange={(e) => updateMeasurement('chest', e.target.value)}
                      placeholder="95.0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Waist (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.measurements.waist}
                      onChange={(e) => updateMeasurement('waist', e.target.value)}
                      placeholder="80.0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Hips (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.measurements.hips}
                      onChange={(e) => updateMeasurement('hips', e.target.value)}
                      placeholder="90.0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Biceps (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.measurements.biceps}
                      onChange={(e) => updateMeasurement('biceps', e.target.value)}
                      placeholder="32.0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Thighs (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.measurements.thighs}
                      onChange={(e) => updateMeasurement('thighs', e.target.value)}
                      placeholder="55.0"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Today's Nutrition</h4>
                <div className="nutrition-grid">
                  <div className="form-group">
                    <label>Calories</label>
                    <input
                      type="number"
                      value={formData.nutrition.calories}
                      onChange={(e) => updateNutrition('calories', e.target.value)}
                      placeholder="2000"
                    />
                  </div>
                  <div className="form-group">
                    <label>Protein (g)</label>
                    <input
                      type="number"
                      value={formData.nutrition.protein}
                      onChange={(e) => updateNutrition('protein', e.target.value)}
                      placeholder="150"
                    />
                  </div>
                  <div className="form-group">
                    <label>Carbs (g)</label>
                    <input
                      type="number"
                      value={formData.nutrition.carbs}
                      onChange={(e) => updateNutrition('carbs', e.target.value)}
                      placeholder="200"
                    />
                  </div>
                  <div className="form-group">
                    <label>Fat (g)</label>
                    <input
                      type="number"
                      value={formData.nutrition.fat}
                      onChange={(e) => updateNutrition('fat', e.target.value)}
                      placeholder="67"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="workouts-header">
                  <h4>Today's Workouts</h4>
                  <button type="button" className="btn-secondary" onClick={addWorkout}>
                    <FaPlus /> Add Workout
                  </button>
                </div>

                {formData.workouts.map((workout, index) => (
                  <div key={index} className="workout-item">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Workout Name</label>
                        <input
                          type="text"
                          value={workout.name}
                          onChange={(e) => updateWorkout(index, 'name', e.target.value)}
                          placeholder="Upper Body Strength"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Duration (minutes)</label>
                        <input
                          type="number"
                          value={workout.duration}
                          onChange={(e) => updateWorkout(index, 'duration', e.target.value)}
                          placeholder="60"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-section">
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="How did you feel today? Any observations..."
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddEntry(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="entries-section">
        <h3>Recent Entries</h3>
        {progressEntries.length === 0 ? (
          <div className="empty-state">
            <FaChartLine size={48} />
            <h3>No progress entries yet</h3>
            <p>Start tracking your fitness journey by adding your first progress entry.</p>
          </div>
        ) : (
          <div className="entries-list">
            {progressEntries.map(entry => (
              <div key={entry._id} className="entry-card">
                <div className="entry-header">
                  <h4>{new Date(entry.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</h4>
                  <span className="entry-date">
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                </div>

                <div className="entry-content">
                  {entry.weight && (
                    <div className="entry-metric">
                      <FaWeight />
                      <span>{entry.weight} kg</span>
                    </div>
                  )}

                  {entry.workout && (
                    <div className="entry-workouts">
                      <strong>Workout Duration:</strong> {entry.workout.totalDuration || 0} min
                    </div>
                  )}

                  {entry.nutrition?.totalCalories && (
                    <div className="entry-nutrition">
                      <strong>Nutrition:</strong> {entry.nutrition.totalCalories} cal
                    </div>
                  )}

                  {entry.notes && (
                    <div className="entry-notes">
                      <strong>Notes:</strong> {entry.notes}
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

export default ProgressDashboard;
