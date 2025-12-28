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

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
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
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1>Welcome back, {localStorage.getItem('userName') || 'Receptionist'}! 👋</h1>
          <p>Here's what's happening at your clinic today.</p>
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
        {/* Today's Appointments */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Today's Appointments</h2>
            <button 
              className="btn-link"
              onClick={() => navigate('/receptionist/appointments')}
            >
              View All →
            </button>
          </div>
          <div className="appointments-list">
            {recentAppointments.length > 0 ? (
              recentAppointments.map(apt => (
                <div key={apt.id} className="appointment-item">
                  <div className="appointment-time">
                    <Clock size={18} />
                    <span>{apt.time}</span>
                  </div>
                  <div className="appointment-info">
                    <h4>{apt.patientName}</h4>
                    <p>with {apt.doctor}</p>
                  </div>
                  <span className={`status-badge ${apt.status.toLowerCase()}`}>
                    {apt.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="no-data">No appointments today</p>
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
            {upcomingAppointments.length > 0 ? (
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
              <p className="no-data">No upcoming appointments</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
