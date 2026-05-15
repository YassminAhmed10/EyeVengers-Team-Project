// src/components/Patient/Navbar.jsx
import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FaHome, FaStethoscope, FaUserMd, FaCalendarAlt, FaFileAlt, 
  FaBell, FaUser, FaSignOutAlt, FaChevronDown, FaClipboardList,
  FaHistory, FaEnvelope, FaCog, FaPhone, FaMapMarkerAlt
} from 'react-icons/fa';
import logo from '../../assets/logo.png';

export function Navbar() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const name = localStorage.getItem('radiologyPatientName') || 
                 localStorage.getItem('userName') || 
                 'Patient';
    setPatientName(name);
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('radiologyPatientName');
    localStorage.removeItem('radiologyPatientId');
    localStorage.removeItem('radiologyPatientEmail');
    localStorage.removeItem('radiologyPatientPhone');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: FaHome },
    { path: '/services', label: 'Services', icon: FaStethoscope },
    { path: '/doctors', label: 'Doctors', icon: FaUserMd },
    { path: '/patient/book-appointment', label: 'Book Appointment', icon: FaCalendarAlt },
    { path: '/patient/results', label: 'My Results', icon: FaFileAlt },
    { path: '/patient/notifications', label: 'Notifications', icon: FaBell },
    { path: '/contact', label: 'Contact', icon: FaEnvelope },
  ];

  const dropdownItems = [
    { path: '/profile', label: 'My Profile', icon: FaUser },
    { path: '/patient/appointments', label: 'Appointments', icon: FaHistory },
    { path: '/patient/orders', label: 'Doctor Orders', icon: FaClipboardList },
    { path: '/settings', label: 'Settings', icon: FaCog },
  ];

  const getInitials = () => {
    if (!patientName || patientName === 'Patient') return 'GU';
    return patientName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        zIndex: 1000,
        padding: '0 20px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '70px',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {/* Logo */}
          <div 
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          >
            <img src={logo} alt="Logo" style={{ height: '40px', width: 'auto' }} onError={(e) => e.target.style.display = 'none'} />
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#1e3a5f' }}>
              Nile Radiology
            </span>
          </div>

          {/* Desktop Navigation */}
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active' : ''}`
                }
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: isActive ? '#1e3a5f' : '#4b5563',
                  background: isActive ? '#e8f0fe' : 'transparent',
                  transition: 'all 0.2s'
                })}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.background = '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <link.icon size={16} />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>

          {/* User Profile */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '6px 12px',
                borderRadius: '30px',
                border: '1px solid #e2e8f0',
                background: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1e3a5f, #29b6f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '600',
                fontSize: '12px'
              }}>
                {getInitials()}
              </div>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                {patientName.split(' ')[0]}
              </span>
              <FaChevronDown size={12} style={{ color: '#6b7280', transition: 'transform 0.2s', transform: isDropdownOpen ? 'rotate(180deg)' : 'none' }} />
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
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
                  <p style={{ fontWeight: '600', color: '#1e293b', margin: 0 }}>{patientName}</p>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0' }}>
                    {localStorage.getItem('radiologyPatientEmail') || 'patient@example.com'}
                  </p>
                </div>
                {dropdownItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate(item.path);
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
                    <item.icon size={14} /> {item.label}
                  </button>
                ))}
                <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    handleLogout();
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

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#1e3a5f'
            }}
            className="mobile-menu-btn"
          >
            ☰
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          style={{
            position: 'fixed',
            top: '70px',
            left: 0,
            right: 0,
            background: 'white',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            zIndex: 999,
            padding: '20px',
            maxHeight: 'calc(100vh - 70px)',
            overflowY: 'auto'
          }}
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => 
                `mobile-nav-link ${isActive ? 'active' : ''}`
              }
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: isActive ? '600' : '500',
                color: isActive ? '#1e3a5f' : '#4b5563',
                background: isActive ? '#e8f0fe' : 'transparent',
                marginBottom: '4px'
              })}
            >
              <link.icon size={18} />
              {link.label}
            </NavLink>
          ))}
          
          <div style={{ height: '1px', background: '#e2e8f0', margin: '12px 0' }} />
          
          {dropdownItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate(item.path);
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '15px',
                color: '#4b5563',
                marginBottom: '4px',
                borderRadius: '8px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              <item.icon size={18} /> {item.label}
            </button>
          ))}
          
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              handleLogout();
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '15px',
              color: '#dc2626',
              borderRadius: '8px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
          >
            <FaSignOutAlt size={18} /> Sign Out
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 968px) {
          .nav-link span {
            display: none;
          }
          .nav-link {
            padding: 8px 10px !important;
          }
        }
        
        @media (max-width: 768px) {
          .nav-link {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
        
        .mobile-nav-link:hover {
          background: #f3f4f6;
        }
        
        .mobile-nav-link.active {
          background: #e8f0fe;
          color: #1e3a5f;
        }
      `}</style>
    </>
  );
}