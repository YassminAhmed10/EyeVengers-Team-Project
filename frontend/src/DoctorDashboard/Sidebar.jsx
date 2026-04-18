import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import logo from "../images/logo.png";
import "./Sidebar.css";

const NAV_ITEMS = [
  { to: '/doctor',                 icon: 'dashboard',        labelKey: 'sidebar.dashboard',    exact: true  },
  { to: '/doctor/patients',        icon: 'group',            labelKey: 'sidebar.patients'               },
  { to: '/doctor/appointments',    icon: 'calendar_month',   labelKey: 'sidebar.appointments'           },
  { to: '/doctor/finance',         icon: 'payments',         labelKey: 'sidebar.finance'                },
  { to: '/doctor/clinic-system',   icon: 'medical_services', labelKey: 'sidebar.clinicSystem'           },
  { to: '/doctor/settings',        icon: 'settings',         labelKey: 'sidebar.settings'               },
];

const Sidebar = ({ collapsed }) => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm(t('sidebar.logoutConfirm'))) {
      localStorage.removeItem('userRole');
      localStorage.removeItem('isAuthenticated');
      navigate('/login');
    }
  };

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside className={`doctor-sidebar ${collapsed ? 'collapsed' : ''}`}>

      {/* ── Logo Header ── */}
      <div className="sidebar-header">
        {/* Circular logo — centred */}
        <div className="clinic-logo">
          <img
            src={logo}
            alt="EyeCare Clinic Logo"
            className="clinic-logo-img"
            onError={e => { e.target.src = 'https://via.placeholder.com/90x90?text=EC'; }}
          />
        </div>

        {/* Doctor name + specialty */}
        <div className="doctor-profile-header">
          <h1>Dr. Mohab Khairy</h1>
          <p>{t('sidebar.ophthalmologist')}</p>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, icon, labelKey, exact }) => (
          <Link
            key={to}
            to={to}
            data-tooltip={t(labelKey)}
            className={`nav-item ${isActive(to, exact) ? 'active' : ''}`}
          >
            <div className="nav-icon">
              <span className="material-symbols-outlined">{icon}</span>
            </div>
            <span className="nav-label">{t(labelKey)}</span>
          </Link>
        ))}

        {/* Logout */}
        <div
          className="nav-item logout-button"
          data-tooltip={t('sidebar.logout')}
          onClick={handleLogout}
        >
          <div className="nav-icon">
            <span className="material-symbols-outlined">logout</span>
          </div>
          <span className="nav-label">{t('sidebar.logout')}</span>
        </div>
      </nav>

      {/* ── User Profile Footer ── */}
      <div className="user-profile">
        <div className="user-avatar">
          <img
            src="/src/images/doctor.jpg"
            alt="Doctor Profile"
            className="user-avatar-img"
            onError={e => { e.target.src = 'https://via.placeholder.com/40x40?text=Dr'; }}
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