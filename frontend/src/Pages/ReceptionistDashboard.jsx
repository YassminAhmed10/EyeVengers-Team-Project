import React, { useState, useEffect } from 'react';
import './ReceptionistDashboard.css';

const ReceptionistDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [statistics, setStatistics] = useState({
    totalOnlineAppointments: 0,
    totalOfflineAppointments: 0,
    totalAppointments: 0,
    pendingOnlineRequests: 0
  });
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`http://localhost:5201/api/Appointments/ByDate/${selectedDate}`);
      const data = await response.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`http://localhost:5201/api/Appointments/statistics/${selectedDate}`);
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchStatistics();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const handleApprove = async (id) => {
    try {
      await fetch(`http://localhost:5201/api/Appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 0 }) // Upcoming
      });
      fetchAppointments();
    } catch (error) {
      console.error('Error approving appointment:', error);
    }
  };

  const handleMarkSurgery = async (id, currentValue) => {
    try {
      await fetch(`http://localhost:5201/api/Appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSurgery: !currentValue })
      });
      fetchAppointments();
    } catch (error) {
      console.error('Error marking surgery:', error);
    }
  };

  const handleCancel = async (id) => {
    try {
      await fetch(`http://localhost:5201/api/Appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 2 }) // Cancelled
      });
      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      0: 'Upcoming',
      1: 'Completed',
      2: 'Cancelled',
      3: 'In Progress',
      4: 'No Show'
    };
    return statusMap[status] || 'Unknown';
  };

  const filteredAppointments = appointments
    .filter(apt => {
      if (filter === 'All') return true;
      return getStatusText(apt.status) === filter;
    })
    .filter(apt => 
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patientId.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="receptionist-dashboard">
      <div className="dashboard-stats">
        <div className="stat-card baby-blue">
          <div className="stat-icon">
            <span className="material-symbols-outlined">computer</span>
          </div>
          <div className="stat-content">
            <h3>Online Appointments</h3>
            <p className="stat-number">{statistics.totalOnlineAppointments}</p>
          </div>
        </div>

        <div className="stat-card light-purple">
          <div className="stat-icon">
            <span className="material-symbols-outlined">location_on</span>
          </div>
          <div className="stat-content">
            <h3>Offline Appointments</h3>
            <p className="stat-number">{statistics.totalOfflineAppointments}</p>
          </div>
        </div>

        <div className="stat-card mint-green">
          <div className="stat-icon">
            <span className="material-symbols-outlined">calendar_month</span>
          </div>
          <div className="stat-content">
            <h3>Total Appointments</h3>
            <p className="stat-number">{statistics.totalAppointments}</p>
          </div>
        </div>

        <div className="stat-card soft-pink">
          <div className="stat-icon">
            <span className="material-symbols-outlined">pending_actions</span>
          </div>
          <div className="stat-content">
            <h3>Pending Requests</h3>
            <p className="stat-number">{statistics.pendingOnlineRequests}</p>
          </div>
        </div>
      </div>

      <div className="appointments-section">
        <div className="section-header">
          <div className="left-controls">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-picker"
            />
            <div className="filters">
              <button 
                className={`filter-btn ${filter === 'All' ? 'active' : ''}`}
                onClick={() => setFilter('All')}
              >
                All
              </button>
              <button 
                className={`filter-btn ${filter === 'Upcoming' ? 'active' : ''}`}
                onClick={() => setFilter('Upcoming')}
              >
                Upcoming
              </button>
              <button 
                className={`filter-btn ${filter === 'Completed' ? 'active' : ''}`}
                onClick={() => setFilter('Completed')}
              >
                Completed
              </button>
            </div>
          </div>

          <div className="search-box">
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              placeholder="Search patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="appointments-grid">
          {filteredAppointments.length === 0 ? (
            <div className="no-appointments">
              <span className="material-symbols-outlined">event_busy</span>
              <p>No appointments found</p>
            </div>
          ) : (
            filteredAppointments.map(appointment => (
            <div key={appointment.appointmentId} className="appointment-card">
              <div className="card-header">
                <div className="patient-info">
                  <h3>{appointment.patientName}</h3>
                  <p className="patient-id">{appointment.patientId}</p>
                </div>
                <span className={`status-badge status-${getStatusText(appointment.status).toLowerCase()}`}>
                  {getStatusText(appointment.status)}
                </span>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <span className="material-symbols-outlined">schedule</span>
                  <span>{appointment.appointmentTime?.substring(0, 5)}</span>
                </div>
                <div className="info-row">
                  <span className="material-symbols-outlined">phone</span>
                  <span>{appointment.phone || 'N/A'}</span>
                </div>
                {appointment.reasonForVisit && (
                  <div className="info-row">
                    <span className="material-symbols-outlined">description</span>
                    <span>{appointment.reasonForVisit}</span>
                  </div>
                )}
              </div>

              <div className="card-actions">
                {appointment.status !== 0 && appointment.status !== 2 && (
                  <button 
                    className="action-btn approve-btn"
                    onClick={() => handleApprove(appointment.appointmentId)}
                    title="Approve"
                  >
                    <span className="material-symbols-outlined">check_circle</span>
                  </button>
                )}
                
                <button 
                  className={`action-btn surgery-btn ${appointment.isSurgery ? 'active' : ''}`}
                  onClick={() => handleMarkSurgery(appointment.appointmentId, appointment.isSurgery)}
                  title={appointment.isSurgery ? 'Remove Surgery' : 'Mark Surgery'}
                >
                  <span className="material-symbols-outlined">medical_services</span>
                </button>

                {appointment.status !== 2 && (
                  <button 
                    className="action-btn cancel-btn"
                    onClick={() => handleCancel(appointment.appointmentId)}
                    title="Cancel"
                  >
                    <span className="material-symbols-outlined">cancel</span>
                  </button>
                )}
              </div>
            </div>
          ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
