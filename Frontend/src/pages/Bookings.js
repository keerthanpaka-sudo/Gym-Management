import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../config/apiConfig';
import './Bookings.css';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    trainer: '',
    date: '',
    timeSlot: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
    fetchTrainers();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(API_ENDPOINTS.BOOKINGS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data);
    } catch (err) {
      toast.error('Failed to fetch bookings');
    }
  };

  const fetchTrainers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(API_ENDPOINTS.AUTH_TRAINERS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrainers(res.data);
    } catch (err) {
      toast.error('Failed to load trainers');
      setTrainers([]);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(API_ENDPOINTS.CREATE_BOOKING, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Booking created successfully!');
      setShowForm(false);
      setFormData({ trainer: '', date: '', timeSlot: '', notes: '' });
      fetchBookings();
    } catch (err) {
      toast.error('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(API_ENDPOINTS.DELETE_BOOKING(bookingId), {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Booking cancelled successfully!');
      fetchBookings();
    } catch (err) {
      toast.error('Failed to cancel booking');
    }
  };

  return (
    <div className="bookings-page">
      <header className="page-header">
        <h1>My Bookings</h1>
        <button
          className="add-booking-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'New Booking'}
        </button>
      </header>

      {showForm && (
        <div className="booking-form-container">
          <form className="booking-form" onSubmit={handleSubmit}>
            <h3>Book a Session</h3>

            <div className="form-group">
              <label htmlFor="trainer">Select Trainer</label>
              <select
                id="trainer"
                name="trainer"
                value={formData.trainer}
                onChange={handleInputChange}
                required
              >
                <option value="">Choose a trainer</option>
                {trainers.map(trainer => (
                  <option key={trainer._id} value={trainer._id}>
                    {trainer.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="timeSlot">Time Slot</label>
              <select
                id="timeSlot"
                name="timeSlot"
                value={formData.timeSlot}
                onChange={handleInputChange}
                required
              >
                <option value="">Choose a time</option>
                <option value="09:00-10:00">9:00 AM - 10:00 AM</option>
                <option value="10:00-11:00">10:00 AM - 11:00 AM</option>
                <option value="11:00-12:00">11:00 AM - 12:00 PM</option>
                <option value="14:00-15:00">2:00 PM - 3:00 PM</option>
                <option value="15:00-16:00">3:00 PM - 4:00 PM</option>
                <option value="16:00-17:00">4:00 PM - 5:00 PM</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes (Optional)</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Any special requests or notes..."
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Creating...' : 'Create Booking'}
            </button>
          </form>
        </div>
      )}

      <div className="bookings-list">
        {bookings.length === 0 ? (
          <div className="no-bookings">
            <p>You have no bookings yet.</p>
            <button
              className="add-booking-btn"
              onClick={() => setShowForm(true)}
            >
              Book Your First Session
            </button>
          </div>
        ) : (
          bookings.map(booking => (
            <div key={booking._id} className="booking-card">
              <div className="booking-info">
                <h3>Session with {booking.trainer?.name || 'Trainer'}</h3>
                <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {booking.timeSlot}</p>
                {booking.notes && <p><strong>Notes:</strong> {booking.notes}</p>}
                <span className={`status ${booking.status}`}>
                  {booking.status}
                </span>
              </div>
              {booking.status === 'pending' && (
                <button
                  className="cancel-btn"
                  onClick={() => cancelBooking(booking._id)}
                >
                  Cancel
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Bookings;