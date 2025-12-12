import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { Bell, Sun, Moon, Menu } from 'lucide-react';
import { FaCalendarCheck, FaExclamationTriangle, FaInfoCircle, FaUserPlus } from 'react-icons/fa';
import './Header.css';

const Header = ({ toggleDarkMode, darkMode, toggleSidebar }) => {
  const location = useLocation();
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dateTime, setDateTime] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [lastAppointmentCount, setLastAppointmentCount] = useState(0);

  // Fetch appointments and check for new ones
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch('http://localhost:5201/api/Appointments');
        const data = await response.json();
        
        // Check if there are new appointments
        if (lastAppointmentCount > 0 && data.length > lastAppointmentCount) {
          const newAppointments = data.slice(0, data.length - lastAppointmentCount);
          
          // Add notifications for new appointments
          newAppointments.forEach(appointment => {
            const newNotification = {
              id: Date.now() + Math.random(),
              title: "New Patient Added",
              message: `${appointment.patientName} has been added to the appointments list.`,
              type: "patient",
              time: "Just now",
              unread: true,
            };
            
            setNotifications(prev => [newNotification, ...prev]);
            setNotificationCount(prev => prev + 1);
          });
        }
        
        setLastAppointmentCount(data.length);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };

    // Initial fetch
    fetchAppointments();
    
    // Poll every 5 seconds for new appointments
    const interval = setInterval(fetchAppointments, 5000);
    
    return () => clearInterval(interval);
  }, [lastAppointmentCount]);

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

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/doctor' || path === '/doctor/') return 'Dashboard';
    if (path.includes('/patients')) return 'Patients Management';
    if (path.includes('/appointments')) return 'Appointments';
    if (path.includes('/finance')) return 'Finance';
    if (path.includes('/clinic-system')) return 'Clinic System';
    if (path.includes('/settings')) return 'Settings';
    if (path.includes('/view-medical-record')) return 'Medical Record';
    return 'Dashboard';
  };

  const handleNotificationClick = (e) => {
    e.preventDefault();
    setShowNotifications(!showNotifications);
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, unread: false } : notif
      )
    );
    setNotificationCount(prev => Math.max(0, prev - 1));
  };

  const handleProfileClick = (e) => {
    e.preventDefault();
    console.log('Profile clicked');
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
          onClick={handleNotificationClick}
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
                  setNotifications(prev => 
                    prev.map(notif => ({ ...notif, unread: false }))
                  );
                  setNotificationCount(0);
                }}
              >
                Mark all as read
              </button>
            </div>

            <div className="notification-list">
              {notifications.length > 0 ? (
                notifications.map((item) => (
                  <div 
                    key={item.id} 
                    className={`notification-item ${item.unread ? "unread" : ""}`}
                    onClick={() => markAsRead(item.id)}
                  >
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

        {/* Profile */}
        <a href="#" className="profile" onClick={handleProfileClick}>
          <img 
            src="/src/images/doctor.jpg" 
            alt="Doctor Profile"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/42x42?text=Dr';
            }}
          />
        </a>
      </div>
    </header>
  );
};

export default Header;
