import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from "../images/logo.png";
import '../DoctorDashboard/Sidebar.css';

const ReceptionistSidebar = ({ collapsed }) => {
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
    <aside className={`doctor-sidebar ${collapsed ? 'collapsed' : ''}`}>
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
          <span className="nav-text">Dashboard</span>
        </Link>

        <Link 
          to="/appointments" 
          className={`nav-item ${isActive('/appointments') ? 'active' : ''}`}
        >
          <div className="nav-icon">
            <span className="material-symbols-outlined">calendar_month</span>
          </div>
          <span className="nav-text">Appointments</span>
        </Link>

        <Link 
          to="/receptionist/patients" 
          className={`nav-item ${isActive('/receptionist/patients') ? 'active' : ''}`}
        >
          <div className="nav-icon">
            <span className="material-symbols-outlined">groups</span>
          </div>
          <span className="nav-text">Patients</span>
        </Link>

        <Link 
          to="/receptionist/finance" 
          className={`nav-item ${isActive('/receptionist/finance') ? 'active' : ''}`}
        >
          <div className="nav-icon">
            <span className="material-symbols-outlined">payments</span>
          </div>
          <span className="nav-text">Finance</span>
        </Link>

        <Link 
          to="/receptionist/settings" 
          className={`nav-item ${isActive('/receptionist/settings') ? 'active' : ''}`}
        >
          <div className="nav-icon">
            <span className="material-symbols-outlined">settings</span>
          </div>
          <span className="nav-text">Settings</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        <button 
          onClick={handleLogout}
          className="nav-item logout-btn"
        >
          <div className="nav-icon">
            <span className="material-symbols-outlined">logout</span>
          </div>
          <span className="nav-text">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default ReceptionistSidebar;