import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import logo from "../images/logo.png";
import "./Sidebar.css";

const Sidebar = ({ collapsed }) => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm(t('sidebar.logoutConfirm'))) {
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
          <p>{t('sidebar.ophthalmologist')}</p>
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
          <span className="nav-label">{t('sidebar.dashboard')}</span>
        </Link>

        <Link 
          to="/doctor/patients" 
          className={`nav-item ${isActive('/doctor/patients') ? 'active' : ''}`}
        >
          <div className="nav-icon">
            <span className="material-symbols-outlined">group</span>
          </div>
          <span className="nav-label">{t('sidebar.patients')}</span>
        </Link>

        <Link 
          to="/doctor/appointments" 
          className={`nav-item ${isActive('/doctor/appointments') ? 'active' : ''}`}
        >
          <div className="nav-icon">
            <span className="material-symbols-outlined">calendar_month</span>
          </div>
          <span className="nav-label">{t('sidebar.appointments')}</span>
        </Link>

        <Link 
          to="/doctor/finance" 
          className={`nav-item ${isActive('/doctor/finance') ? 'active' : ''}`}
        >
          <div className="nav-icon">
            <span className="material-symbols-outlined">payments</span>
          </div>
          <span className="nav-label">{t('sidebar.finance')}</span>
        </Link>

        <Link 
          to="/doctor/clinic-system" 
          className={`nav-item ${isActive('/doctor/clinic-system') ? 'active' : ''}`}
        >
          <div className="nav-icon">
            <span className="material-symbols-outlined">medical_services</span>
          </div>
          <span className="nav-label">{t('sidebar.clinicSystem')}</span>
        </Link>

        <Link 
          to="/doctor/settings" 
          className={`nav-item ${isActive('/doctor/settings') ? 'active' : ''}`}
        >
          <div className="nav-icon">
            <span className="material-symbols-outlined">settings</span>
          </div>
          <span className="nav-label">{t('sidebar.settings')}</span>
        </Link>

        {/* Logout Button */}
        <div className="nav-item logout-button" onClick={handleLogout}>
          <div className="nav-icon">
            <span className="material-symbols-outlined">logout</span>
          </div>
          <span className="nav-label">{t('sidebar.logout')}</span>
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
          <p>{t('sidebar.ophthalmologist')}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
