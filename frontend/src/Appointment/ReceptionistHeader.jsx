import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Sun, Moon, Menu, LogOut, Settings } from 'lucide-react';
import { FaCalendarCheck, FaExclamationTriangle, FaInfoCircle, FaUserPlus } from 'react-icons/fa';
import '../DoctorDashboard/Header.css';

const ReceptionistHeader = ({ toggleDarkMode, darkMode, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [dateTime, setDateTime] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [receptionist, setReceptionist] = useState({
    name: 'Receptionist',
    email: 'receptionist@clinic.com'
  });

  useEffect(() => {
    const interval = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const name = localStorage.getItem('userName') || 'Receptionist';
    const email = localStorage.getItem('userEmail') || 'receptionist@clinic.com';
    setReceptionist({ name, email });
  }, []);

  const formatDate = () => {
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return dateTime.toLocaleDateString('en-US', options);
  };

  const formatTime = () => {
    return dateTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/receptionist' || path === '/receptionist/') return 'Dashboard';
    if (path.includes('/receptionist/appointments')) return 'Appointments';
    if (path.includes('/receptionist/patients')) return 'Patients Management';
    if (path.includes('/receptionist/settings')) return 'Settings';
    return 'Dashboard';
  };

  const getIcon = (type) => {
    switch (type) {
      case "patient":
        return <FaUserPlus size={18} />;
      case "appointment":
        return <FaCalendarCheck size={18} />;
      case "warning":
        return <FaExclamationTriangle size={18} />;
      case "info":
        return <FaInfoCircle size={18} />;
      default:
        return <FaInfoCircle size={18} />;
    }
  };

  return (
    <header className="doctor-header">
      {/* Menu Toggle Button */}
      <button className="menu-toggle-btn" onClick={toggleSidebar}>
        <Menu size={24} />
      </button>
      
      <h2 className="header-title">{getPageTitle()}</h2>

      {/* Date and Time Display */}
      <div className="header-datetime">
        <div className="header-date">
          <span className="material-symbols-outlined">calendar_today</span>
          <span>{formatDate()}</span>
        </div>
        <div className="header-time">
          <span className="material-symbols-outlined">schedule</span>
          <span>{formatTime()}</span>
        </div>
      </div>

      <div className="nav-right">
        {/* Dark Mode Button */}
        <button className="switch-mode-btn" onClick={toggleDarkMode}>
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notification Button */}
        <div 
          className={`notification ${showNotifications ? "active" : ""}`} 
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="num">{notificationCount > 99 ? "99+" : notificationCount}</span>
          )}

          {/* NOTIFICATION DROPDOWN */}
          <div className="notification-dropdown">
            <div className="notification-header">
              <h3>Notifications</h3>
              <button 
                className="mark-all-read"
                onClick={(e) => {
                  e.stopPropagation();
                  setNotifications([]);
                  setNotificationCount(0);
                }}
              >
                Mark all as read
              </button>
            </div>

            <div className="notification-list">
              {notifications.length > 0 ? (
                notifications.map((item) => (
                  <div key={item.id} className={`notification-item ${item.unread ? "unread" : ""}`}>
                    <div className={`notification-icon ${item.type}`}>
                      {getIcon(item.type)}
                    </div>
                    <div className="notification-content">
                      <p className="notification-title">{item.title}</p>
                      <p className="notification-message">{item.message}</p>
                      <p className="notification-time">{item.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-notifications">
                  <p>No new notifications</p>
                </div>
              )}
            </div>

            <div className="notification-footer">
              <a href="#" className="view-all-link">View all notifications</a>
            </div>
          </div>
        </div>

        {/* Profile Dropdown */}
        <div className="profile-wrapper">
          <button 
            className="profile"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            title={receptionist.name}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '18px',
              color: 'white'
            }}>
              {receptionist.name.charAt(0).toUpperCase()}
            </div>
          </button>

          {showProfileMenu && (
            <div className="profile-dropdown">
              <div className="profile-header">
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '20px',
                  color: 'white',
                  flexShrink: 0
                }}>
                  {receptionist.name.charAt(0).toUpperCase()}
                </div>
                <div className="profile-info">
                  <h4>{receptionist.name}</h4>
                  <p>{receptionist.email}</p>
                </div>
              </div>
              <div className="profile-divider"></div>
              <div className="profile-menu">
                <button 
                  className="profile-menu-item"
                  onClick={() => {
                    navigate('/receptionist/settings');
                    setShowProfileMenu(false);
                  }}
                >
                  <Settings size={18} />
                  <span>Settings</span>
                </button>
              </div>
              <div className="profile-divider"></div>
              <button 
                className="profile-menu-item logout"
                onClick={() => {
                  if (window.confirm('Are you sure you want to logout?')) {
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('isAuthenticated');
                    localStorage.removeItem('userName');
                    navigate('/login');
                  }
                }}
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default ReceptionistHeader;
