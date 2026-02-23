import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import './ReceptionistDashboard.css';

const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState({
    totalOnlineAppointments: 0,
    totalOfflineAppointments: 0,
    totalAppointments: 0,
    pendingOnlineRequests: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch statistics for the selected date
      const statsResponse = await fetch(
        `http://localhost:5201/api/Appointments/statistics/${selectedDate}`
      );
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats({
          totalOnlineAppointments: statsData.totalOnlineAppointments || 0,
          totalOfflineAppointments: statsData.totalOfflineAppointments || 0,
          totalAppointments: statsData.totalAppointments || 0,
          pendingOnlineRequests: statsData.pendingOnlineRequests || 0
        });
      } else {
        console.warn('Failed to fetch statistics:', statsResponse.status);
      }

      // Fetch appointments for the selected date
      const appointmentsResponse = await fetch(
        `http://localhost:5201/api/Appointments/ByDate/${selectedDate}`
      );
      
      if (appointmentsResponse.ok) {
        const appointments = await appointmentsResponse.json();
        
        // Split into recent (today) and upcoming
        const today = new Date().toISOString().split('T')[0];
        const recentApts = appointments.filter(apt => {
          const aptDate = new Date(apt.appointmentDate).toISOString().split('T')[0];
          return aptDate === today;
        }).map(apt => ({
          id: apt.appointmentId,
          patientName: apt.patientName,
          doctor: apt.doctor?.name || 'N/A',
          time: apt.appointmentTime,
          status: getStatusLabel(apt.status),
          date: 'Today'
        }));

        const upcomingApts = appointments.filter(apt => {
          const aptDate = new Date(apt.appointmentDate).toISOString().split('T')[0];
          return aptDate !== today;
        }).map(apt => ({
          id: apt.appointmentId,
          patientName: apt.patientName,
          doctor: apt.doctor?.name || 'N/A',
          date: new Date(apt.appointmentDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          time: apt.appointmentTime,
          status: 'Scheduled'
        }));

        setRecentAppointments(recentApts);
        setUpcomingAppointments(upcomingApts);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError({
        message: 'Unable to connect to server',
        details: 'Please check if the API server is running on http://localhost:5201'
      });
      // Set empty/default state on error
      setStats({
        totalOnlineAppointments: 0,
        totalOfflineAppointments: 0,
        totalAppointments: 0,
        pendingOnlineRequests: 0
      });
      setRecentAppointments([]);
      setUpcomingAppointments([]);
      setLoading(false);
    }
  };

  const getStatusLabel = (statusCode) => {
    const statuses = {
      0: 'Upcoming',
      1: 'Completed',
      2: 'Cancelled',
      3: 'In Progress',
      4: 'No Show'
    };
    return statuses[statusCode] || 'Unknown';
  };

  const StatCard = ({ icon: Icon, title, value, color, onClick }) => (
    <div 
      className={`stat-card ${color}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="stat-icon">
        <Icon size={28} />
      </div>
      <div className="stat-content">
        <p className="stat-title">{title}</p>
        <h3 className="stat-value">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="receptionist-dashboard">
      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <div className="error-text">
            <strong>{error.message}</strong>
            <p>{error.details}</p>
          </div>
          <button 
            className="retry-btn"
            onClick={fetchDashboardData}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1>Welcome back, {localStorage.getItem('userName') || 'Receptionist'}! 👋</h1>
          <p>Here's what's happening at your clinic.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard 
          icon={Calendar} 
          title="Total Online Appointments" 
          value={stats.totalOnlineAppointments}
          color="blue"
          onClick={() => navigate('/receptionist/appointments')}
        />
        <StatCard 
          icon={Users} 
          title="Total Offline Appointments" 
          value={stats.totalOfflineAppointments}
          color="green"
          onClick={() => navigate('/receptionist/appointments')}
        />
        <StatCard 
          icon={Clock} 
          title="All Appointments" 
          value={stats.totalAppointments}
          color="orange"
          onClick={() => navigate('/receptionist/appointments', { state: { tab: 'all' } })}
        />
        <StatCard 
          icon={TrendingUp} 
          title="Pending Online Requests" 
          value={stats.pendingOnlineRequests}
          color="purple"
          onClick={() => navigate('/receptionist/appointments', { state: { tab: 'requests' } })}
        />
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Calendar Box */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2></h2>
            <div className="calendar-navigation">
              <button 
                className="nav-btn"
                onClick={() => {
                  const currentDate = new Date(selectedDate);
                  currentDate.setMonth(currentDate.getMonth() - 1);
                  setSelectedDate(currentDate.toISOString().split('T')[0]);
                }}
              >
                ←
              </button>
              <span className="current-month">
                {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button 
                className="nav-btn"
                onClick={() => {
                  const currentDate = new Date(selectedDate);
                  currentDate.setMonth(currentDate.getMonth() + 1);
                  setSelectedDate(currentDate.toISOString().split('T')[0]);
                }}
              >
                →
              </button>
            </div>
          </div>
          <div className="calendar-container">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading calendar...</p>
              </div>
            ) : (
              <CalendarView 
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                recentAppointments={recentAppointments}
                upcomingAppointments={upcomingAppointments}
              />
            )}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Upcoming Appointments</h2>
            <button 
              className="btn-link"
              onClick={() => navigate('/receptionist/appointments')}
            >
              View All →
            </button>
          </div>
          <div className="appointments-list">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading upcoming appointments...</p>
              </div>
            ) : upcomingAppointments.length > 0 ? (
              upcomingAppointments.map(apt => (
                <div key={apt.id} className="appointment-item">
                  <div className="appointment-date">
                    <Calendar size={18} />
                    <span>{apt.date}</span>
                  </div>
                  <div className="appointment-info">
                    <h4>{apt.patientName}</h4>
                    <p>{apt.time} with {apt.doctor}</p>
                  </div>
                  <span className="status-badge scheduled">
                    Scheduled
                  </span>
                </div>
              ))
            ) : (
              <div className="no-data">
                <Users size={32} />
                <p>No upcoming appointments</p>
                {error && (
                  <button className="small-retry-btn" onClick={fetchDashboardData}>
                    Retry
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Calendar View Component
const CalendarView = ({ selectedDate, onDateSelect, recentAppointments, upcomingAppointments }) => {
  const today = new Date();
  const currentMonth = new Date(selectedDate);
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  
  const daysInMonth = lastDayOfMonth.getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfWeek }, (_, i) => null);
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const getDayAppointments = (day) => {
    const dateString = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      .toISOString().split('T')[0];
    // Count appointments for this specific day from both recent and upcoming appointments
    const todayApts = recentAppointments.filter(apt => {
      if (apt.appointmentDate) {
        return new Date(apt.appointmentDate).toISOString().split('T')[0] === dateString;
      }
      return false;
    }).length;
    
    const futureApts = upcomingAppointments.filter(apt => {
      if (apt.appointmentDate) {
        return new Date(apt.appointmentDate).toISOString().split('T')[0] === dateString;
      }
      return false;
    }).length;
    
    return todayApts + futureApts;
  };
  
  const isToday = (day) => {
    return today.getDate() === day && 
           today.getMonth() === currentMonth.getMonth() && 
           today.getFullYear() === currentMonth.getFullYear();
  };
  
  const isSelected = (day) => {
    const dateString = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      .toISOString().split('T')[0];
    return dateString === selectedDate;
  };

  return (
    <div className="calendar-view">
      <div className="calendar-grid">
        {/* Week headers */}
        {weekDays.map(day => (
          <div key={day} className="calendar-header">{day}</div>
        ))}
        
        {/* Empty days for month start */}
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="calendar-day empty"></div>
        ))}
        
        {/* Days of the month */}
        {daysArray.map(day => {
          const appointmentCount = getDayAppointments(day);
          return (
            <div 
              key={day} 
              className={`calendar-day ${isToday(day) ? 'today' : ''} ${isSelected(day) ? 'selected' : ''} ${appointmentCount > 0 ? 'has-appointments' : ''}`}
              onClick={() => {
                const dateString = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                  .toISOString().split('T')[0];
                onDateSelect(dateString);
              }}
            >
              <span className="day-number">{day}</span>
              {appointmentCount > 0 && (
                <div className="appointment-indicator">
                  <span className="appointment-count">{appointmentCount}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
