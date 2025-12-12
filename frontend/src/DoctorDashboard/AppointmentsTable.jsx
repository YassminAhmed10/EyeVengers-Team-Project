import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './AppointmentsTable.css';

const AppointmentsTable = ({ selectedDate }) => {
  const [filter, setFilter] = useState("All");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState('');
  const [notification, setNotification] = useState("");
  const navigate = useNavigate();

  // Fetch appointments from API
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch('http://localhost:5201/api/Appointments');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const statusMap = {
          0: 'Upcoming',
          1: 'Completed',
          2: 'Cancelled',
          3: 'In Progress',
          4: 'No Show'
        };
        const transformedData = data.filter(apt => apt && apt.patientName && apt.patientId).map(apt => ({
          ...apt,
          time: apt.appointmentTime ? new Date(`2000-01-01T${apt.appointmentTime}`).toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', hour12: true
          }) : '',
          status: statusMap[apt.status] || 'Upcoming'
        }));
        setAppointments(transformedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setAppointments([]);
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  // Update appointment status
  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5201/api/Appointments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setNotification(`Appointment status updated to ${newStatus}`);
        // Refresh appointments
        const response = await fetch('http://localhost:5201/api/Appointments');
        const data = await response.json();
        setAppointments(data);
      } else {
        setNotification('Error updating status');
      }
    } catch (err) {
      setNotification('Could not connect to server');
    }
  };

  // Filter appointments by status and search
  const statusFilter = filter === 'All' ? null : filter;
  let filteredAppointments = appointments;
  if (statusFilter) {
    filteredAppointments = filteredAppointments.filter(a => a.status.toLowerCase() === statusFilter.toLowerCase());
  }
  if (localSearch) {
    filteredAppointments = filteredAppointments.filter(a =>
      a.patientName.toLowerCase().includes(localSearch.toLowerCase()) ||
      (a.patientId && a.patientId.toLowerCase().includes(localSearch.toLowerCase()))
    );
  }
  
  // Filter by selectedDate or today's date if no date is selected
  const filterDate = selectedDate || new Date();
  const dateStr = filterDate.toLocaleDateString('en-CA');
  filteredAppointments = filteredAppointments.filter(a => {
    const apptDate = new Date(a.appointmentDate).toLocaleDateString('en-CA');
    return apptDate === dateStr;
  });

  const handleViewMedicalRecord = (patientName, patientId) => {
    navigate(`/doctor/view-medical-record/${encodeURIComponent(patientName)}`, {
      state: { patientId } 
    });
  };

  const handleSearchChange = (e) => {
    setLocalSearch(e.target.value);
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5201/api/Appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 2 }) // 2 = Cancelled
      });
      
      if (response.ok) {
        setNotification('Appointment cancelled successfully');
        // Refresh appointments
        const fetchResponse = await fetch('http://localhost:5201/api/Appointments');
        const data = await fetchResponse.json();
        const statusMap = {
          0: 'Upcoming',
          1: 'Completed',
          2: 'Cancelled',
          3: 'In Progress',
          4: 'No Show'
        };
        const transformedData = data.filter(apt => apt && apt.patientName && apt.patientId).map(apt => ({
          ...apt,
          time: apt.appointmentTime ? new Date(`2000-01-01T${apt.appointmentTime}`).toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', hour12: true
          }) : '',
          status: statusMap[apt.status] || 'Upcoming'
        }));
        setAppointments(transformedData);
        setTimeout(() => setNotification(''), 3000);
      } else {
        setNotification('Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      setNotification('Error connecting to server');
    }
  };

  const handleBookingNow = (appointment) => {
    const currentTime = new Date();
    const appointmentTime = new Date(`2000-01-01T${appointment.appointmentTime}`);
    const appointmentHour = appointmentTime.getHours();
    const appointmentMinute = appointmentTime.getMinutes();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    
    // Check if appointment time is within 30 minutes of current time
    const timeDiff = (appointmentHour * 60 + appointmentMinute) - (currentHour * 60 + currentMinute);
    
    if (timeDiff >= -30 && timeDiff <= 30) {
      setNotification(`🔔 Patient ${appointment.patientName} has arrived for their ${appointment.time} appointment!`);
      setTimeout(() => setNotification(''), 5000);
    } else if (timeDiff > 30) {
      setNotification(`⏰ This appointment is scheduled for ${appointment.time}. It's too early for check-in.`);
      setTimeout(() => setNotification(''), 5000);
    } else {
      setNotification(`⚠️ This appointment was scheduled for ${appointment.time}. Patient is late.`);
      setTimeout(() => setNotification(''), 5000);
    }
  };

  return (
    <div className="appointments-container">
      <div className="appointments-header">
        <h3 className="appointments-title">Today's Appointments</h3>

        <div className="filter-buttons">
          {['All', 'Completed', 'Cancelled', 'Upcoming'].map((status) => (
            <button
              key={status}
              className={`filter-button ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="appointments-search-section">
        <div className="appointments-search-wrapper">
          <span className="material-symbols-outlined search-icon">search</span>
          <input
            type="text"
            placeholder="Search by patient name or ID..."
            value={localSearch}
            onChange={handleSearchChange}
            className="appointments-search-input"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => setLocalSearch('')}
              className="clear-search-btn"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>
        {selectedDate && (
          <div className="selected-date-badge">
            <span className="material-symbols-outlined">calendar_today</span>
            <span>{selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <button 
              onClick={() => window.location.reload()} 
              className="clear-date-btn"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Patient Name</th>
              <th>Patient ID</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                  Loading appointments...
                </td>
              </tr>
            ) : filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                  No appointments found
                </td>
              </tr>
            ) : (
              filteredAppointments.map((appointment, index) => {
                // Generate patient ID dynamically based on patient name/id
                const dynamicId = `P-${appointment.patientId || appointment.patientName.replace(/\s+/g, '').substring(0, 5).toUpperCase()}`;
                return (
                  <tr key={index}>
                    <td>{appointment.time}</td>
                    <td style={{ fontWeight: 500 }}>{appointment.patientName}</td>
                    <td style={{ fontFamily: 'monospace' }}>{dynamicId}</td>
                    <td>
                      <span className={`status-badge status-${appointment.status.toLowerCase()}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleViewMedicalRecord(appointment.patientName, dynamicId)}
                        className="view-button"
                      >
                        EMR
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    {notification && (
      <div style={{margin: '1rem', color: 'red'}}>{notification}</div>
    )}
    </div>
  );
};

export default AppointmentsTable;