import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from '../context/LanguageContext';
import { appointmentsAPI } from '../services/apiConfig';
import './AppointmentsTable.css';

const AppointmentsTable = ({ selectedDate }) => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState("All");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState('');
  const [notification, setNotification] = useState("");
  const navigate = useNavigate();

  // Helper function to get time status
  const getTimeStatus = (appointmentDate, appointmentTime) => {
    const now = new Date();
    const [hours, minutes] = appointmentTime.split(':');
    const aptDateTime = new Date(appointmentDate);
    aptDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const diffMinutes = (aptDateTime - now) / (1000 * 60);
    
    if (diffMinutes >= -15 && diffMinutes <= 15) {
      return t('dashboard.now');
    } else if (diffMinutes > 15) {
      return t('dashboard.upcoming');
    } else {
      return t('dashboard.late');
    }
  };

  // Fetch appointments from API
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await appointmentsAPI.getAll();
        console.log('Fetched appointments from API:', data);
        console.log('Number of appointments:', data.length);
        
        // If no appointments, try to fetch directly to debug
        if (data.length === 0) {
          console.log('No appointments found, testing direct API call...');
          const testResponse = await fetch('http://localhost:5201/api/Appointments');
          const testData = await testResponse.json();
          console.log('Direct API call result:', testData);
        }
        
        const statusMap = {
          0: t('dashboard.upcoming'),
          1: t('dashboard.completed'),
          2: t('dashboard.cancelled'),
          3: t('dashboard.inProgress'),
          4: t('dashboard.noShow')
        };
        
        const transformedData = data.filter(apt => apt && apt.patientName).map(apt => {
          console.log('Processing appointment:', apt);
          
          // Handle TimeSpan format from backend (e.g., "09:30:00" or "09:30:00.0000000")
          let formattedTime = '';
          if (apt.appointmentTime) {
            const timeStr = apt.appointmentTime.toString();
            const timeParts = timeStr.split(':');
            if (timeParts.length >= 2) {
              const hours = parseInt(timeParts[0]);
              const minutes = timeParts[1];
              const ampm = hours >= 12 ? 'PM' : 'AM';
              const displayHours = hours % 12 || 12;
              formattedTime = `${displayHours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
            }
          }
          
          return {
            ...apt,
            time: formattedTime,
            status: statusMap[apt.status] || 'Upcoming',
            timeStatus: getTimeStatus(apt.appointmentDate, apt.appointmentTime)
          };
        });
        
        console.log('Transformed appointments:', transformedData);
        setAppointments(transformedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setAppointments([]);
        setLoading(false);
      }
    };
    
    // Initial fetch
    fetchAppointments();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAppointments, 30000);
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
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
  
  // Only filter by selectedDate if a specific date is selected
  if (selectedDate) {
    // Handle both string and Date object
    const dateStr = typeof selectedDate === 'string' 
      ? selectedDate 
      : selectedDate.toLocaleDateString('en-CA');
    
    filteredAppointments = filteredAppointments.filter(a => {
      const apptDate = new Date(a.appointmentDate).toISOString().split('T')[0];
      return apptDate === dateStr;
    });
  }

  const handleViewMedicalRecord = (patientName, appointment) => {
    // Prefer the real patientId from the appointment if available, otherwise fall back to a generated dynamic id
    const dynamicId = `P-${appointment.patientId || patientName.replace(/\s+/g, '').substring(0, 5).toUpperCase()}`;
    const patientIdToSend = appointment.patientId && appointment.patientId.trim() !== '' ? appointment.patientId : dynamicId;

    navigate(`/doctor/view-medical-record/${encodeURIComponent(patientName)}`, {
      state: { patientId: patientIdToSend }
    });
  };

  const handleSearchChange = (e) => {
    setLocalSearch(e.target.value);
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm(t('dashboard.cancelConfirm'))) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5201/api/Appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 2 }) // 2 = Cancelled
      });
      
      if (response.ok) {
        setNotification(t('dashboard.appointmentCancelled'));
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
        const transformedData = data.filter(apt => apt && apt.patientName).map(apt => ({
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
        <h3 className="appointments-title">{t('dashboard.todaysAppointments')}</h3>

        <div className="filter-buttons">
          {['All', 'Completed', 'Cancelled', 'Upcoming'].map((status) => (
            <button
              key={status}
              className={`filter-button ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {t(`dashboard.${status.toLowerCase()}`)}
            </button>
          ))}
          <button
            className="filter-button refresh-btn"
            onClick={() => window.location.reload()}
            title={t('dashboard.refresh')}
          >
            🔄 {t('dashboard.refresh')}
          </button>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="appointments-search-section">
        <div className="appointments-search-wrapper">
          <span className="material-symbols-outlined search-icon">search</span>
          <input
            type="text"
            placeholder={t('dashboard.searchPlaceholder')}
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
            <span>
              {typeof selectedDate === 'string' 
                ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              }
            </span>
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
              <th>{t('dashboard.time')}</th>
              <th>{t('dashboard.patient')} {t('common.name')}</th>
              <th>{t('dashboard.patient')} ID</th>
              <th>{t('dashboard.status')}</th>
              <th style={{ textAlign: 'right' }}>{t('common.action')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                  {t('common.loading')}
                </td>
              </tr>
            ) : filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                  {t('dashboard.noAppointments')}
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
                    <td style={{ fontFamily: 'monospace' }}>{appointment.patientId || dynamicId}</td>
                    <td>
                      <span className={`status-badge status-${appointment.status.toLowerCase()}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => navigate(`/doctor/appointment-details/${appointment.appointmentId}`)}
                        className="view-button details-button"
                        title="View Appointment Details"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleViewMedicalRecord(appointment.patientName, appointment)}
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
