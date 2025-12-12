import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from "../images/logo.png";
import "./Sidebar.css";

const Sidebar = ({ collapsed }) => {
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
    if (path === '/doctor' && location.pathname === '/doctor') return true;
    return location.pathname.startsWith(path + '/') || location.pathname === path;
  };

  return (
    <aside className={`doctor-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo Header */}
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
          <h1>Dr. Mohab Khairy</h1>
          <p>Ophthalmologist</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <Link 
          to="/doctor" 
          className={`nav-item ${isActive('/doctor') && location.pathname === '/doctor' ? 'active' : ''}`}
        >
          <div className="nav-icon">
            <span className="material-symbols-outlined">dashboard</span>
          </div>
          <span className="nav-label">Dashboard</span>
        </Link>

        <Link 
          to="/doctor/patients" 
          className={`nav-item ${isActive('/doctor/patients') ? 'active' : ''}`}
        >
          <div className="nav-icon">
            <span className="material-symbols-outlined">group</span>
          </div>
          <span className="nav-label">Patients</span>
        </Link>

        <Link 
          to="/doctor/appointments" 
          className={`nav-item ${isActive('/doctor/appointments') ? 'active' : ''}`}
        >
          <div className="nav-icon">
            <span className="material-symbols-outlined">calendar_month</span>
          </div>
          <span className="nav-label">Appointments</span>
        </Link>

        <Link 
          to="/doctor/finance" 
          className={`nav-item ${isActive('/doctor/finance') ? 'active' : ''}`}
        >
          <div className="nav-icon">
            <span className="material-symbols-outlined">payments</span>
          </div>
          <span className="nav-label">Finance</span>
        </Link>

        <Link 
          to="/doctor/clinic-system" 
          className={`nav-item ${isActive('/doctor/clinic-system') ? 'active' : ''}`}
        >
          <div className="nav-icon">
            <span className="material-symbols-outlined">medical_services</span>
          </div>
          <span className="nav-label">Clinic System</span>
        </Link>

        <Link 
          to="/doctor/settings" 
          className={`nav-item ${isActive('/doctor/settings') ? 'active' : ''}`}
        >
          <div className="nav-icon">
            <span className="material-symbols-outlined">settings</span>
          </div>
          <span className="nav-label">Settings</span>
        </Link>

        {/* Logout Button */}
        <div className="nav-item logout-button" onClick={handleLogout}>
          <div className="nav-icon">
            <span className="material-symbols-outlined">logout</span>
          </div>
          <span className="nav-label">Logout</span>
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="user-profile">
        <div className="user-avatar">
          <img 
            src="/src/images/doctor.jpg" 
            alt="Doctor Profile" 
            className="user-avatar-img"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/55x55?text=Dr';
            }}
          />
        </div>
        <div className="user-info">
          <h3>Dr. Mohab Khairy</h3>
          <p>Ophthalmologist</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;