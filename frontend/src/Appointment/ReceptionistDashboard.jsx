import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Clock, AlertCircle, TrendingUp, ChevronLeft, ChevronRight, CheckCircle, XCircle, Play, EyeOff, CircleDot } from 'lucide-react';
import './ReceptionistDashboard.css';

const API_BASE = 'http://localhost:5201/api/Appointments';

// Helper: format "YYYY-MM-DD" without timezone shift
const toLocalDateStr = (year, month, day) => {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
};

const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  const today = new Date();
  const todayStr = toLocalDateStr(today.getFullYear(), today.getMonth(), today.getDate());
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [stats, setStats] = useState({
    totalOnlineAppointments: 0,
    totalOfflineAppointments: 0,
    totalAppointments: 0,
    pendingOnlineRequests: 0
  });
  const [allAppointments, setAllAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(new Date());

  // Tick every 30 seconds so time-based UI stays fresh
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const statsResponse = await fetch(`${API_BASE}/statistics/${selectedDate}`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats({
          totalOnlineAppointments: statsData.totalOnlineAppointments || 0,
          totalOfflineAppointments: statsData.totalOfflineAppointments || 0,
          totalAppointments: statsData.totalAppointments || 0,
          pendingOnlineRequests: statsData.pendingOnlineRequests || 0
        });
      }

      const appointmentsResponse = await fetch(`${API_BASE}/ByDate/${selectedDate}`);
      if (appointmentsResponse.ok) {
        const appointments = await appointmentsResponse.json();
        setAllAppointments(appointments.map(mapAppointment));
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError({
        message: 'Unable to connect to server',
        details: 'Please check if the API server is running on http://localhost:5201'
      });
      setStats({ totalOnlineAppointments: 0, totalOfflineAppointments: 0, totalAppointments: 0, pendingOnlineRequests: 0 });
      setAllAppointments([]);
      setLoading(false);
    }
  };

  const mapAppointment = (apt) => {
    // Extract local date string without timezone conversion
    let aptDateStr = '';
    if (apt.appointmentDate) {
      const raw = apt.appointmentDate.split('T')[0];
      aptDateStr = raw;
    }
    return {
      id: apt.appointmentId,
      patientName: apt.patientName,
      doctor: apt.doctor?.name || 'N/A',
      reasonForVisit: apt.reasonForVisit || '',
      time: apt.appointmentTime,
      statusCode: apt.status,
      durationMinutes: apt.durationMinutes || 30,
      updatedAt: apt.updatedAt,
      appointmentDate: aptDateStr,
      dateLabel: aptDateStr ? (() => {
        const d = parseLocalDate(aptDateStr);
        return d ? d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '';
      })() : ''
    };
  };

  // Parse "HH:mm:ss" timespan into minutes since midnight
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  };

  const getNowMinutes = () => now.getHours() * 60 + now.getMinutes();

  // Check if 30 min passed since the appointment was marked InProgress
  const is30MinPassed = (apt) => {
    if (apt.updatedAt) {
      const started = new Date(apt.updatedAt);
      return (now - started) >= 30 * 60 * 1000;
    }
    const aptMin = parseTimeToMinutes(apt.time);
    const nowMin = getNowMinutes();
    return nowMin >= aptMin + 30;
  };

  const updateAppointmentStatus = async (id, statusCode) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusCode })
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Error updating appointment status:', err);
    }
  };

  const getStatusClass = (code) => {
    const m = { 0: 'upcoming', 1: 'completed', 2: 'cancelled', 3: 'in-progress', 4: 'no-show' };
    return m[code] || '';
  };

  const StatCard = ({ icon: Icon, title, value, color, onClick }) => (
    <div className={`stat-card ${color}`} onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="stat-icon"><Icon size={28} /></div>
      <div className="stat-content">
        <p className="stat-title">{title}</p>
        <h3 className="stat-value">{value}</h3>
      </div>
    </div>
  );

  const statusOptions = [
    { value: 0, label: 'Upcoming' },
    { value: 3, label: 'In Progress' },
    { value: 1, label: 'Completed' },
    { value: 2, label: 'Cancelled' },
    { value: 4, label: 'No Show' }
  ];

  // Render a status dropdown for any appointment
  const renderStatusDropdown = (apt) => {
    const isForced = apt.statusCode === 3 && is30MinPassed(apt);
    const isFinished = apt.statusCode === 1 || apt.statusCode === 2 || apt.statusCode === 4;

    return (
      <div className={`status-dropdown-wrapper ${isForced ? 'forced' : ''}`}>
        <select
          className={`status-dropdown status-${getStatusClass(apt.statusCode)}`}
          value={apt.statusCode}
          disabled={isFinished}
          onChange={(e) => {
            const newStatus = parseInt(e.target.value, 10);
            if (newStatus !== apt.statusCode) {
              updateAppointmentStatus(apt.id, newStatus);
            }
          }}
        >
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    );
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    const h = parseInt(parts[0], 10);
    const m = parts[1];
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  // Derive selected date label
  const selectedDateObj = parseLocalDate(selectedDate);
  const selectedDateLabel = selectedDateObj
    ? selectedDateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : selectedDate;
  const isSelectedToday = selectedDate === todayStr;

  return (
    <div className="receptionist-dashboard">
      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <div className="error-text">
            <strong>{error.message}</strong>
            <p>{error.details}</p>
          </div>
          <button className="retry-btn" onClick={fetchDashboardData}>Try Again</button>
        </div>
      )}

      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1>Welcome back, {localStorage.getItem('userName') || 'Receptionist'}!</h1>
          <p>Here's what's happening at your clinic.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard icon={Calendar} title="Total Online Appointments" value={stats.totalOnlineAppointments} color="blue" onClick={() => navigate('/receptionist/appointments')} />
        <StatCard icon={Users} title="Total Offline Appointments" value={stats.totalOfflineAppointments} color="green" onClick={() => navigate('/receptionist/appointments')} />
        <StatCard icon={Clock} title="All Appointments" value={stats.totalAppointments} color="orange" onClick={() => navigate('/receptionist/appointments', { state: { tab: 'all' } })} />
        <StatCard icon={TrendingUp} title="Pending Online Requests" value={stats.pendingOnlineRequests} color="purple" onClick={() => navigate('/receptionist/appointments', { state: { tab: 'requests' } })} />
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Calendar Box */}
        <div className="dashboard-card calendar-card">
          <div className="calendar-section">
            <div className="calendar-nav-header">
              <button className="cal-nav-btn" onClick={() => {
                const d = parseLocalDate(selectedDate);
                d.setMonth(d.getMonth() - 1);
                setSelectedDate(toLocalDateStr(d.getFullYear(), d.getMonth(), d.getDate()));
              }}><ChevronLeft size={18} /></button>
              <span className="cal-month-title">{selectedDateObj ? selectedDateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''}</span>
              <button className="cal-nav-btn" onClick={() => {
                const d = parseLocalDate(selectedDate);
                d.setMonth(d.getMonth() + 1);
                setSelectedDate(toLocalDateStr(d.getFullYear(), d.getMonth(), d.getDate()));
              }}><ChevronRight size={18} /></button>
            </div>
            <div className="calendar-container">
              {loading ? (
                <div className="loading-state"><div className="spinner"></div><p>Loading calendar...</p></div>
              ) : (
                <CalendarView
                  selectedDate={selectedDate}
                  todayStr={todayStr}
                  onDateSelect={setSelectedDate}
                  appointments={allAppointments}
                />
              )}
            </div>
          </div>
        </div>

        {/* Appointments for selected date */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>{isSelectedToday ? "Today's Appointments" : `Appointments — ${selectedDateLabel}`}</h2>
            <button className="btn-link" onClick={() => navigate('/receptionist/appointments')}>View All →</button>
          </div>
          <div className="appointments-list">
            {loading ? (
              <div className="loading-state"><div className="spinner"></div><p>Loading appointments...</p></div>
            ) : allAppointments.length > 0 ? (
              allAppointments.map(apt => {
                const statusIcon = (() => {
                  switch (apt.statusCode) {
                    case 0: return <CircleDot size={22} className="status-icon status-icon-upcoming" />;
                    case 1: return <CheckCircle size={22} className="status-icon status-icon-completed" />;
                    case 2: return <XCircle size={22} className="status-icon status-icon-cancelled" />;
                    case 3: return <Play size={22} className="status-icon status-icon-inprogress" />;
                    case 4: return <EyeOff size={22} className="status-icon status-icon-noshow" />;
                    default: return <CircleDot size={22} className="status-icon status-icon-upcoming" />;
                  }
                })();
                return (
                <div key={apt.id} className="appointment-item">
                  <div className="appointment-status-icon">{statusIcon}</div>
                  <div className="appointment-date"><Clock size={18} /><span>{formatTime(apt.time)}</span></div>
                  <div className="appointment-info">
                    <h4>{apt.patientName}</h4>
                    <p>{apt.reasonForVisit || 'No reason specified'}</p>
                  </div>
                  {renderStatusDropdown(apt)}
                </div>
                );
              })
            ) : (
              <div className="no-data">
                <Calendar size={32} />
                <p>No appointments for this date</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Calendar View Component
const CalendarView = ({ selectedDate, todayStr, onDateSelect, appointments }) => {
  const selDate = parseLocalDate(selectedDate);
  const todayDate = parseLocalDate(todayStr);
  const year = selDate.getFullYear();
  const month = selDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfWeek }, () => null);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDayAppointments = (day) => {
    const dateStr = toLocalDateStr(year, month, day);
    return appointments.filter(apt => apt.appointmentDate === dateStr).length;
  };

  const isToday = (day) => {
    return todayDate.getDate() === day &&
           todayDate.getMonth() === month &&
           todayDate.getFullYear() === year;
  };

  const isSelected = (day) => {
    return toLocalDateStr(year, month, day) === selectedDate;
  };

  // Build weeks array for grid rows
  const allCells = [...emptyDays, ...daysArray];
  const weeks = [];
  for (let i = 0; i < allCells.length; i += 7) {
    weeks.push(allCells.slice(i, i + 7));
  }
  // Pad last week to 7
  const lastWeek = weeks[weeks.length - 1];
  while (lastWeek.length < 7) lastWeek.push(null);

  return (
    <div className="cal-grid-wrapper">
      <div className="cal-days-header">
        {weekDays.map(day => (
          <div key={day} className="cal-day-header">{day}</div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="cal-week-row">
          {week.map((cell, ci) => {
            if (cell === null) {
              return <div key={`e-${ci}`} className="cal-day-cell empty"></div>;
            }
            const day = cell;
            const appointmentCount = getDayAppointments(day);
            const todayClass = isToday(day) ? 'today' : '';
            const selectedClass = isSelected(day) ? 'selected' : '';
            return (
              <div
                key={day}
                className={`cal-day-cell ${todayClass} ${selectedClass}`}
                onClick={() => onDateSelect(toLocalDateStr(year, month, day))}
              >
                <span className="cal-day-number">{day}</span>
                {isSelected(day) && <span className="cal-selected-check"></span>}
                {appointmentCount > 0 && !isSelected(day) && (
                  <span className="cal-apt-dot"></span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default ReceptionistDashboard;
