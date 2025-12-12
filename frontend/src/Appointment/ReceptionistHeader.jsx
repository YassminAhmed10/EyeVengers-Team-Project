import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { Bell, Sun, Moon, Menu } from 'lucide-react';
import { FaCalendarCheck, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import '../DoctorDashboard/Header.css';

const ReceptionistHeader = ({ toggleDarkMode, darkMode, toggleSidebar }) => {
  const location = useLocation();
  const [notificationCount, setNotificationCount] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(interval);
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
    if (path.includes('/appointments')) return 'Appointments';
    if (path.includes('/patients')) return 'Patients';
    return 'Dashboard';
  };

  const notifications = [
    {
      id: 1,
      title: "New Appointment",
      message: "New appointment scheduled for tomorrow.",
      type: "appointment",
      time: "5 mins ago",
      icon: <FaCalendarCheck />
    },
    {
      id: 2,
      title: "Appointment Cancelled",
      message: "Patient Ahmed cancelled appointment.",
      type: "warning",
      time: "1 hour ago",
      icon: <FaExclamationTriangle />
    },
    {
      id: 3,
      title: "System Update",
      message: "New features available in the system.",
      type: "info",
      time: "3 hours ago",
      icon: <FaInfoCircle />
    }
  ];

  return (
    <header className="header">
      <div className="header-left">
        <button onClick={toggleSidebar} className="menu-toggle-btn">
          <Menu size={24} />
        </button>
        <div className="page-title-section">
          <h1 className="page-title">{getPageTitle()}</h1>
          <p className="page-breadcrumb">Receptionist / {getPageTitle()}</p>
        </div>
      </div>

      <div className="header-right">
        <div className="date-time-display">
          <div className="date-info">
            <span className="material-symbols-outlined">calendar_today</span>
            <span className="date-text">{formatDate()}</span>
          </div>
          <div className="time-info">
            <span className="material-symbols-outlined">schedule</span>
            <span className="time-text">{formatTime()}</span>
          </div>
        </div>

        <div className="header-actions">
          <button 
            onClick={toggleDarkMode} 
            className="action-btn theme-toggle"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="notification-wrapper">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="action-btn notification-btn"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {notificationCount > 0 && (
                <span className="notification-badge">{notificationCount}</span>
              )}
            </button>

            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="notifications-header">
                  <h3>Notifications</h3>
                  <span className="notification-count">{notificationCount} new</span>
                </div>
                <div className="notifications-list">
                  {notifications.map(notification => (
                    <div key={notification.id} className={`notification-item ${notification.type}`}>
                      <div className="notification-icon">{notification.icon}</div>
                      <div className="notification-content">
                        <h4>{notification.title}</h4>
                        <p>{notification.message}</p>
                        <span className="notification-time">{notification.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="notifications-footer">
                  <button onClick={() => setNotificationCount(0)}>Mark all as read</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default ReceptionistHeader;
