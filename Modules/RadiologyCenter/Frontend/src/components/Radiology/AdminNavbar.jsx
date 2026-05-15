// src/components/Radiology/AdminNavbar.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, FaClipboardList, FaFlask, FaUpload, 
  FaSignOutAlt, FaUser, FaChevronDown, FaCog
} from 'react-icons/fa';
import logo from '../../assets/logo.png';

export default function AdminNavbar({ setPage, setAdminLogged }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [adminName, setAdminName] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const name = localStorage.getItem('radiologyAdminEmail') || 'Admin';
    setAdminName(name);
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Clear all admin-related localStorage items
    localStorage.removeItem('radiologyAdminLoggedIn');
    localStorage.removeItem('radiologyAdminEmail');
    localStorage.removeItem('radiologyAdminRole');
    
    // Also clear any auth tokens
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    
    // Update state if setAdminLogged is provided
    if (setAdminLogged) {
      setAdminLogged(false);
    }
    
    // Navigate to login page
    // Support both hash routing and React Router
    if (setPage) {
      // Using hash-based routing (setPage from App.jsx)
      setPage('login');
    } else {
      // Using React Router
      navigate('/login');
    }
    
    // Force reload to clear any cached state
    window.location.href = '/#/login';
  };

  const handleNavigation = (pageName) => {
    if (setPage) {
      // Using hash-based routing
      setPage(pageName);
    } else {
      // Using React Router
      if (pageName === 'admin-dashboard') {
        navigate('/admin');
      } else if (pageName === 'admin-requests') {
        navigate('/admin/requests');
      } else if (pageName === 'admin-investigations') {
        navigate('/admin/investigations');
      } else if (pageName === 'admin-upload') {
        navigate('/admin/upload');
      } else {
        navigate(`/admin/${pageName}`);
      }
    }
  };

  const navItems = [
    { page: 'admin-dashboard', label: 'Dashboard', icon: FaTachometerAlt, active: location.pathname === '/admin' || location.pathname === '/admin/' },
    { page: 'admin-requests', label: 'Appointment Requests', icon: FaClipboardList, active: location.pathname === '/admin/requests' },
    { page: 'admin-investigations', label: 'Investigations', icon: FaFlask, active: location.pathname === '/admin/investigations' },
    { page: 'admin-upload', label: 'Upload Results', icon: FaUpload, active: location.pathname === '/admin/upload' },
  ];

  const getInitials = () => {
    return adminName.charAt(0).toUpperCase();
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: 'linear-gradient(135deg, #1e3a5f, #0f2b45)',
      color: 'white',
      zIndex: 1000,
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      padding: '0 40px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '70px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Logo and Title */}
        <div 
          onClick={() => handleNavigation('admin-dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <img src={logo} alt="Logo" style={{ height: '40px', width: 'auto' }} onError={(e) => e.target.style.display = 'none'} />
          <div>
            <span style={{ fontSize: '18px', fontWeight: '700' }}>
              Radiology Admin
            </span>
            <span style={{ fontSize: '11px', marginLeft: '8px', opacity: 0.7 }}>
              Portal
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {navItems.map((item) => (
            <button
              key={item.page}
              onClick={() => handleNavigation(item.page)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                background: item.active ? 'rgba(255,255,255,0.2)' : 'transparent',
                color: 'white',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!item.active) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!item.active) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <item.icon size={16} />
              <span className="nav-text">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Admin Profile Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 12px',
              borderRadius: '30px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#29b6f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              {getInitials()}
            </div>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>
              {adminName.split('@')[0]}
            </span>
            <FaChevronDown size={12} style={{ transition: 'transform 0.2s', transform: isDropdownOpen ? 'rotate(180deg)' : 'none' }} />
          </button>

          {isDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              minWidth: '220px',
              overflow: 'hidden',
              zIndex: 1000,
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <p style={{ fontWeight: '600', color: '#1e293b', margin: 0 }}>{adminName}</p>
                <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0' }}>
                  Administrator
                </p>
              </div>
              
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  if (setPage) {
                    setPage('settings');
                  } else {
                    navigate('/settings');
                  }
                }}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '13px',
                  color: '#4b5563',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                <FaCog size={14} /> Settings
              </button>
              
              <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />
              
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '13px',
                  color: '#dc2626',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                <FaSignOutAlt size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 968px) {
          .nav-text {
            display: none;
          }
          button[style*="padding: 8px 16px"] {
            padding: 8px 12px !important;
          }
        }
      `}</style>
    </nav>
  );
}