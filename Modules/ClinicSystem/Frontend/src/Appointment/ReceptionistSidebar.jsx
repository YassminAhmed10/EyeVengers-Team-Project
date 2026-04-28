import React from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import logo from "../images/logo.png";
import './ReceptionistSidebar.css';

const ReceptionistSidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const onAppointments = location.pathname.includes('/appointments');
  const currentTab = onAppointments ? (searchParams.get('tab') || 'book') : null;

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem("userRole");
      localStorage.removeItem("isAuthenticated");
      navigate("/login");
    }
  };

  const goTo = (path) => {
    navigate(path);
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
          <div 
            className={`nav-item ${location.pathname === '/receptionist' && !onAppointments ? 'active' : ''}`}
            onClick={() => goTo('/receptionist')}
          >
            <div className="nav-icon">
              <span className="material-symbols-outlined">dashboard</span>
            </div>
            <span className="nav-label">Dashboard</span>
          </div>

          <div 
            className={`nav-item ${currentTab === 'book' ? 'active' : ''}`}
            onClick={() => goTo('/receptionist/appointments?tab=book')}
          >
            <div className="nav-icon">
              <span className="material-symbols-outlined">edit_calendar</span>
            </div>
            <span className="nav-label">Book Appointment</span>
          </div>

          <div 
            className={`nav-item ${currentTab === 'all' ? 'active' : ''}`}
            onClick={() => goTo('/receptionist/appointments?tab=all')}
          >
            <div className="nav-icon">
              <span className="material-symbols-outlined">event_note</span>
            </div>
            <span className="nav-label">Appointment Details</span>
          </div>

          <div 
            className={`nav-item ${currentTab === 'requests' ? 'active' : ''}`}
            onClick={() => goTo('/receptionist/appointments?tab=requests')}
          >
            <div className="nav-icon">
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
            <span className="nav-label">Online Requests</span>
          </div>
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
