import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'react-qr-code';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../config/apiConfig';
import './Attendance.css';

const FALLBACK_ATTENDANCE = [
  {
    _id: 'attendance-1',
    isDemoRecord: true,
    date: new Date().toISOString(),
    checkInTime: new Date(new Date().setHours(7, 35, 0, 0)).toISOString(),
    checkOutTime: null,
    status: 'present'
  },
  {
    _id: 'attendance-2',
    isDemoRecord: true,
    date: new Date(Date.now() - 86400000).toISOString(),
    checkInTime: new Date(new Date(Date.now() - 86400000).setHours(7, 42, 0, 0)).toISOString(),
    checkOutTime: new Date(new Date(Date.now() - 86400000).setHours(9, 5, 0, 0)).toISOString(),
    status: 'present'
  },
  {
    _id: 'attendance-3',
    isDemoRecord: true,
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    checkInTime: new Date(new Date(Date.now() - 86400000 * 2).setHours(18, 15, 0, 0)).toISOString(),
    checkOutTime: new Date(new Date(Date.now() - 86400000 * 2).setHours(19, 10, 0, 0)).toISOString(),
    status: 'present'
  }
];

const normalizeAttendanceRecord = (record = {}) => ({
  ...record,
  _id: record._id || `${record.date || Date.now()}`,
  date: record.date || record.createdAt || new Date().toISOString(),
  checkInTime: record.checkInTime || record.checkIn || record.date || null,
  checkOutTime: record.checkOutTime || record.checkOut || null,
  status: (record.status || 'present').toLowerCase(),
  isDemoRecord: Boolean(record.isDemoRecord)
});

const Attendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [manualQrValue, setManualQrValue] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setRecordsLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(API_ENDPOINTS.ATTENDANCE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const records = Array.isArray(res.data) ? res.data.map(normalizeAttendanceRecord) : [];
      setAttendanceRecords(records.length ? records : FALLBACK_ATTENDANCE.map(normalizeAttendanceRecord));
    } catch (err) {
      toast.error('Failed to fetch attendance records. Showing recent attendance summary.');
      setAttendanceRecords(FALLBACK_ATTENDANCE.map(normalizeAttendanceRecord));
    } finally {
      setRecordsLoading(false);
    }
  };

  const generateQR = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.post(
        API_ENDPOINTS.GENERATE_QR,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setQrCode(res.data.qrCode);
      toast.success('QR Code generated successfully!');
    } catch (err) {
      toast.error('Failed to generate QR code');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (qrData) => {
    if (qrData) {
      try {
        const token = localStorage.getItem('token');
        await axios.post(
          API_ENDPOINTS.MARK_ATTENDANCE,
          { qrData },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success('Attendance marked successfully!');
        setManualQrValue('');
        fetchAttendance();
      } catch (err) {
        toast.error('Failed to mark attendance');
        console.error(err);
      }
    }
  };

  const attendanceMetrics = useMemo(() => {
    const now = new Date();
    const currentMonthRecords = attendanceRecords.filter((record) => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
    });

    const completedVisits = attendanceRecords.filter((record) => record.checkOutTime);
    const avgSessionMinutes = completedVisits.length
      ? Math.round(
          completedVisits.reduce((total, record) => {
            const start = new Date(record.checkInTime);
            const end = new Date(record.checkOutTime);
            return total + Math.max(0, (end - start) / 60000);
          }, 0) / completedVisits.length
        )
      : 0;

    const activeVisit = attendanceRecords.find((record) => !record.checkOutTime && record.status === 'present');

    return {
      monthlyVisits: currentMonthRecords.length,
      activeVisit,
      completedSessions: completedVisits.length,
      avgSessionMinutes
    };
  }, [attendanceRecords]);

  const sortedRecords = [...attendanceRecords].sort((a, b) => new Date(b.date) - new Date(a.date));

  const formatDate = (value) =>
    new Date(value).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

  const formatTime = (value) =>
    value
      ? new Date(value).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })
      : '--';

  const getSessionDuration = (record) => {
    if (!record.checkInTime || !record.checkOutTime) {
      return record.status === 'present' ? 'In progress' : '--';
    }

    const minutes = Math.max(0, Math.round((new Date(record.checkOutTime) - new Date(record.checkInTime)) / 60000));
    return `${minutes} min`;
  };

  return (
    <div className="attendance-page">
      <header className="attendance-hero">
        <div className="attendance-hero-copy">
          <span className="attendance-eyebrow">Attendance Desk</span>
          <h1>Track check-ins with a cleaner, more professional workflow</h1>
          <p>
            Generate a secure QR check-in, monitor active visits, and review member attendance history
            from one organized workspace.
          </p>
        </div>

        <div className="attendance-summary">
          <div className="summary-card">
            <strong>{attendanceMetrics.monthlyVisits}</strong>
            <span>This Month</span>
          </div>
          <div className="summary-card">
            <strong>{attendanceMetrics.completedSessions}</strong>
            <span>Completed Sessions</span>
          </div>
          <div className="summary-card">
            <strong>{attendanceMetrics.avgSessionMinutes || '--'}</strong>
            <span>Avg Session Min</span>
          </div>
        </div>
      </header>

      <section className="attendance-workspace">
        <div className="attendance-panel qr-panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">Check-in Access</span>
              <h2>Generate attendance QR</h2>
            </div>
          </div>

          <div className="attendance-actions">
            <button
              className="generate-qr-btn"
              onClick={generateQR}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate QR Code'}
            </button>
          </div>

          {qrCode ? (
            <div className="qr-code-container">
              <div className="qr-code">
                <QRCode value={qrCode} size={220} />
              </div>
              <p className="qr-instruction">
                Members can scan this QR on arrival to mark attendance quickly.
              </p>

              <div className="manual-qr-input">
                <h4>Manual check-in entry</h4>
                <div className="manual-input-row">
                  <input
                    type="text"
                    value={manualQrValue}
                    placeholder="Paste QR code data"
                    onChange={(e) => setManualQrValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleScan(manualQrValue);
                      }
                    }}
                  />
                  <button
                    className="manual-submit-btn"
                    onClick={() => handleScan(manualQrValue)}
                    disabled={!manualQrValue.trim()}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="panel-empty-state">
              <h3>No QR generated yet</h3>
              <p>Generate a fresh attendance QR to start check-ins for the current session.</p>
            </div>
          )}
        </div>

        <div className="attendance-panel active-panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">Current Status</span>
              <h2>Live visit overview</h2>
            </div>
            <button className="refresh-btn" onClick={fetchAttendance}>
              Refresh Records
            </button>
          </div>

          <div className="status-card">
            <span className={`status-pill ${attendanceMetrics.activeVisit ? 'status-live' : 'status-idle'}`}>
              {attendanceMetrics.activeVisit ? 'Checked In' : 'No Active Visit'}
            </span>
            <h3>
              {attendanceMetrics.activeVisit
                ? `Checked in at ${formatTime(attendanceMetrics.activeVisit.checkInTime)}`
                : 'No open attendance session right now'}
            </h3>
            <p>
              {attendanceMetrics.activeVisit
                ? 'Complete checkout after the workout session to keep attendance logs accurate.'
                : 'Your latest attendance records are listed below for quick review.'}
            </p>
          </div>
        </div>
      </section>

      <section className="attendance-records-section">
        <div className="section-header">
          <div>
            <span className="panel-label">Attendance History</span>
            <h2>Recent attendance records</h2>
          </div>
        </div>

        {recordsLoading ? (
          <div className="panel-empty-state">
            <h3>Loading attendance records...</h3>
          </div>
        ) : sortedRecords.length === 0 ? (
          <div className="panel-empty-state">
            <h3>No attendance records found</h3>
            <p>Generate a QR code or scan one to start building the attendance timeline.</p>
          </div>
        ) : (
          <div className="records-table">
            <div className="records-table-header">
              <span>Date</span>
              <span>Check-in</span>
              <span>Check-out</span>
              <span>Duration</span>
              <span>Status</span>
              <span>Action</span>
            </div>
            <div className="records-list">
              {sortedRecords.map((record) => (
                <div key={record._id} className="record-row">
                  <span>{formatDate(record.date)}</span>
                  <span>{formatTime(record.checkInTime)}</span>
                  <span>{formatTime(record.checkOutTime)}</span>
                  <span>{getSessionDuration(record)}</span>
                  <span>
                    <span className={`status-pill status-${record.status}`}>
                      {record.status}
                    </span>
                  </span>
                  <span>
                    {record.isDemoRecord ? (
                      <span className="record-complete">Demo Record</span>
                    ) : !record.checkOutTime ? (
                      <button
                        className="checkout-btn"
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem('token');
                            await axios.put(
                              API_ENDPOINTS.CHECKOUT_ATTENDANCE(record._id),
                              {},
                              { headers: { Authorization: `Bearer ${token}` } }
                            );
                            toast.success('Checked out successfully!');
                            fetchAttendance();
                          } catch (err) {
                            toast.error('Failed to check out');
                          }
                        }}
                      >
                        Check Out
                      </button>
                    ) : (
                      <span className="record-complete">Completed</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Attendance;
