import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from "../images/logo.png";
import './ReceptionistSidebar.css';

const ReceptionistSidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem("userRole");
      localStorage.removeItem("isAuthenticated");
      navigate("/login");
    }
  };

  const isActive = (path) => {
    if (path === '/receptionist' && location.pathname === '/receptionist') return true;
    return location.pathname.startsWith(path + '/') || location.pathname === path;
  };

  return (
    <>
      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div 
          className="sidebar-overlay active"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={`receptionist-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="clinic-logo">
            <img 
              src={logo} 
              alt="EyeCare Clinic Logo" 
              className="clinic-logo-img"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/190x193?text=LOGO';
              }}
            />
          </div>
          <div className="doctor-profile-header">
            <h1>Receptionist</h1>
            <p>Front Desk</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link 
            to="/receptionist" 
            className={`nav-item ${isActive('/receptionist') && location.pathname === '/receptionist' ? 'active' : ''}`}
          >
            <div className="nav-icon">
              <span className="material-symbols-outlined">dashboard</span>
            </div>
            <span className="nav-label">Dashboard</span>
          </Link>

          <Link 
            to="/receptionist/appointments" 
            className={`nav-item ${isActive('/receptionist/appointments') || isActive('/appointments') ? 'active' : ''}`}
          >
            <div className="nav-icon">
              <span className="material-symbols-outlined">calendar_month</span>
            </div>
            <span className="nav-label">Appointments</span>
          </Link>
        </nav>

        <button 
          onClick={handleLogout}
          className="logout-button"
        >
          <div className="nav-icon">
            <span className="material-symbols-outlined">logout</span>
          </div>
          <span className="nav-label">Logout</span>
        </button>
      </aside>
    </>
  );
};

export default ReceptionistSidebar;
