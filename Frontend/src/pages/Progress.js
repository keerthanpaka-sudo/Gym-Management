import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../config/apiConfig';
import './Progress.css';

const Progress = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    bodyFat: '',
    measurements: {
      chest: '',
      waist: '',
      arms: '',
      legs: '',
    },
    notes: '',
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchProgress();
    fetchStats();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(API_ENDPOINTS.PROGRESS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data) ? res.data : res.data.entries || [];
      setEntries(data.length > 0 ? data : [
        {
          _id: 'sample1',
          date: new Date().toISOString().split('T')[0],
          weight: 70,
          bodyFat: 15,
          measurements: { chest: 100, waist: 80, arms: 30, legs: 50 },
          notes: 'Sample progress entry - start tracking your fitness journey!'
        }
      ]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch progress entries. Please check your connection.');
      console.error('Progress fetch error:', err.message);
      // Set fallback data on error
      setEntries([
        {
          _id: 'fallback1',
          date: new Date().toISOString().split('T')[0],
          weight: 70,
          bodyFat: 15,
          measurements: { chest: 100, waist: 80, arms: 30, legs: 50 },
          notes: 'Fallback data - connect to backend to see real progress'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user._id) {
        const res = await axios.get(API_ENDPOINTS.PROGRESS_STATS(user._id), {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch progress stats:', err.message);
      // Don't show error toast for stats, as this is optional
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('measurements.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        measurements: {
          ...formData.measurements,
          [field]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      if (editingId) {
        // Update existing entry
        await axios.put(API_ENDPOINTS.UPDATE_PROGRESS(editingId), formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Progress entry updated successfully!');
      } else {
        // Create new entry
        await axios.post(API_ENDPOINTS.CREATE_PROGRESS, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Progress entry created successfully!');
      }

      setFormData({
        date: new Date().toISOString().split('T')[0],
        weight: '',
        bodyFat: '',
        measurements: {
          chest: '',
          waist: '',
          arms: '',
          legs: '',
        },
        notes: '',
      });
      setEditingId(null);
      setShowForm(false);
      fetchProgress();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save progress entry');
    }
  };

  const handleEdit = (entry) => {
    setFormData(entry);
    setEditingId(entry._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(API_ENDPOINTS.DELETE_PROGRESS(id), {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Progress entry deleted successfully!');
        fetchProgress();
        fetchStats();
      } catch (err) {
        toast.error('Failed to delete progress entry');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      weight: '',
      bodyFat: '',
      measurements: {
        chest: '',
        waist: '',
        arms: '',
        legs: '',
      },
      notes: '',
    });
  };

  if (loading && !showForm) {
    return (
      <div className="progress-page">
        <div className="loading">Loading progress data...</div>
      </div>
    );
  }

  return (
    <div className="progress-page">
      <header className="page-header">
        <h1>Progress Tracking</h1>
        <button
          className="add-entry-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'New Entry'}
        </button>
      </header>

      {stats && (
        <div className="stats-container">
          <div className="stat-card">
            <h4>Total Entries</h4>
            <p className="stat-value">{stats.totalEntries || 0}</p>
          </div>
          {stats.latestWeight && (
            <div className="stat-card">
              <h4>Current Weight</h4>
              <p className="stat-value">{stats.latestWeight}kg</p>
            </div>
          )}
          {stats.weightChange !== undefined && (
            <div className="stat-card">
              <h4>Weight Change</h4>
              <p className={`stat-value ${stats.weightChange > 0 ? 'positive' : 'negative'}`}>
                {stats.weightChange > 0 ? '+' : ''}{stats.weightChange}kg
              </p>
            </div>
          )}
          {stats.latestBodyFat && (
            <div className="stat-card">
              <h4>Body Fat %</h4>
              <p className="stat-value">{stats.latestBodyFat}%</p>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="progress-form-container">
          <form className="progress-form" onSubmit={handleSubmit}>
            <h3>{editingId ? 'Edit Progress Entry' : 'Add New Progress Entry'}</h3>

            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="weight">Weight (kg)</label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  step="0.1"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="75.5"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bodyFat">Body Fat (%)</label>
                <input
                  type="number"
                  id="bodyFat"
                  name="bodyFat"
                  step="0.1"
                  value={formData.bodyFat}
                  onChange={handleInputChange}
                  placeholder="18.5"
                />
              </div>
            </div>

            <h4>Measurements (cm)</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="chest">Chest</label>
                <input
                  type="number"
                  id="chest"
                  name="measurements.chest"
                  step="0.1"
                  value={formData.measurements.chest}
                  onChange={handleInputChange}
                  placeholder="100"
                />
              </div>

              <div className="form-group">
                <label htmlFor="waist">Waist</label>
                <input
                  type="number"
                  id="waist"
                  name="measurements.waist"
                  step="0.1"
                  value={formData.measurements.waist}
                  onChange={handleInputChange}
                  placeholder="85"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="arms">Arms</label>
                <input
                  type="number"
                  id="arms"
                  name="measurements.arms"
                  step="0.1"
                  value={formData.measurements.arms}
                  onChange={handleInputChange}
                  placeholder="35"
                />
              </div>

              <div className="form-group">
                <label htmlFor="legs">Legs</label>
                <input
                  type="number"
                  id="legs"
                  name="measurements.legs"
                  step="0.1"
                  value={formData.measurements.legs}
                  onChange={handleInputChange}
                  placeholder="55"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="How you felt, diet, workouts, etc."
                rows="3"
              ></textarea>
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn">
                {editingId ? 'Update Entry' : 'Save Entry'}
              </button>
              <button type="button" className="cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="entries-container">
        {entries.length === 0 ? (
          <div className="no-entries">
            <p>No progress entries yet. Start tracking your progress!</p>
          </div>
        ) : (
          <div className="entries-list">
            {entries.map((entry) => (
              <div key={entry._id} className="entry-card">
                <div className="entry-header">
                  <h3>{new Date(entry.date).toLocaleDateString()}</h3>
                  <div className="entry-actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(entry)}
                      title="Edit entry"
                    >
                      ✏️
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(entry._id)}
                      title="Delete entry"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="entry-details">
                  {entry.weight && (
                    <div className="detail-item">
                      <span className="label">Weight:</span>
                      <span className="value">{entry.weight}kg</span>
                    </div>
                  )}
                  {entry.bodyFat && (
                    <div className="detail-item">
                      <span className="label">Body Fat:</span>
                      <span className="value">{entry.bodyFat}%</span>
                    </div>
                  )}
                  {entry.measurements && (
                    <>
                      {entry.measurements.chest && (
                        <div className="detail-item">
                          <span className="label">Chest:</span>
                          <span className="value">{entry.measurements.chest}cm</span>
                        </div>
                      )}
                      {entry.measurements.waist && (
                        <div className="detail-item">
                          <span className="label">Waist:</span>
                          <span className="value">{entry.measurements.waist}cm</span>
                        </div>
                      )}
                      {entry.measurements.arms && (
                        <div className="detail-item">
                          <span className="label">Arms:</span>
                          <span className="value">{entry.measurements.arms}cm</span>
                        </div>
                      )}
                      {entry.measurements.legs && (
                        <div className="detail-item">
                          <span className="label">Legs:</span>
                          <span className="value">{entry.measurements.legs}cm</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {entry.notes && <p className="entry-notes">{entry.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Progress;
