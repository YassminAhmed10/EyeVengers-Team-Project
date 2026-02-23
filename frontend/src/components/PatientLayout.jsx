import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    FaBell, FaTimes, FaSignOutAlt, FaUser, FaHistory, FaFileAlt,
    FaBars, FaHome, FaBriefcaseMedical, FaUserMd, FaPhoneAlt, FaChevronDown
} from 'react-icons/fa';
import './PatientLayout.css';

const PatientLayout = ({ children, showSidebarToggle = false, onToggleSidebar, sidebarCollapsed = true }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [userName, setUserName] = useState('Guest');
    const [userEmail, setUserEmail] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [language, setLanguage] = useState('en');
    const dropdownRef = useRef(null);
    const notifRef = useRef(null);

    const translations = {
        en: {
            home: 'Home',
            services: 'Services',
            contact: 'Contact',
            notifications: 'Notifications',
            clearAll: 'Clear All',
            myProfile: 'My Profile',
            appointmentHistory: 'Appointment History',
            medicalRecords: 'Medical Records (EMR)',
            logout: 'Sign Out'
        },
        ar: {
            home: 'الرئيسية',
            services: 'الخدمات',

            contact: 'اتصل بنا',
            notifications: 'الإشعارات',
            clearAll: 'مسح الكل',
            myProfile: 'ملفي الشخصي',
            appointmentHistory: 'سجل المواعيد',
            medicalRecords: 'السجلات الطبية',
            logout: 'تسجيل الخروج'
        }
    };

    const t = translations[language] || translations.en;

    useEffect(() => {
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage) {
            setLanguage(savedLanguage);
        }
        const savedUserName = localStorage.getItem('userName');
        const savedUserEmail = localStorage.getItem('userEmail');
        if (savedUserName) setUserName(savedUserName);
        if (savedUserEmail) setUserEmail(savedUserEmail);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        navigate('/login');
    };

    const handleAppointmentHistory = () => {
        navigate('/patient/appointments');
        setIsDropdownOpen(false);
    };

    const getUserInitials = () => {
        return userName
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <div className="patient-layout" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {/* Header */}
            <header className="patient-layout-header">
                <div className="header-container">
                    <div className="header-logo">
                        <img src="/src/images/logo.png" alt="Clinic Logo" className="logo-img" />
                        <span className="clinic-name">Dr Mohab Khairy</span>
                    </div>

                    <nav className="header-nav">
                        <a href="/patient" className="nav-link">{t.home}</a>
                        <a href="/patient/book-appointment" className="nav-link">{t.services}</a>
                        <a href="/contact" className="nav-link">{t.contact}</a>
                    </nav>

                    <div className="header-actions">
                        {/* Sidebar Toggle Button - Only show when enabled */}
                        {showSidebarToggle && (
                            <button 
                                className="sidebar-toggle-header-btn"
                                onClick={onToggleSidebar}
                                title={sidebarCollapsed ? 'فتح القائمة الجانبية' : 'إغلاق القائمة الجانبية'}
                            >
                                <FaBars />
                            </button>
                        )}

                        {/* Notification Bell */}
                        <div className="notification-container" ref={notifRef}>
                            <button 
                                className="notification-btn"
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                <FaBell />
                                {notifications.length > 0 && (
                                    <span className="notification-badge">{notifications.length}</span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="notifications-dropdown">
                                    <div className="notifications-header">
                                        <h4>{t.notifications}</h4>
                                        <button onClick={() => setNotifications([])}>{t.clearAll}</button>
                                    </div>
                                    <div className="notifications-list">
                                        {notifications.length === 0 ? (
                                            <div className="no-notifications">
                                                <p>No new notifications</p>
                                            </div>
                                        ) : (
                                            notifications.map((notif, idx) => (
                                                <div key={idx} className="notification-item">
                                                    <span className="notif-icon">ℹ️</span>
                                                    <div className="notif-content">
                                                        <p>{notif}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Profile Dropdown */}
                        <div className="user-profile-container" ref={dropdownRef}>
                            <button 
                                className="user-profile-btn"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <div className="user-avatar">{getUserInitials()}</div>
                                <span className="user-name">{userName}</span>
                            </button>

                            {isDropdownOpen && (
                                <div className="profile-dropdown">
                                    <div className="dropdown-header">
                                        <div className="dropdown-user-name">{userName}</div>
                                        <div className="dropdown-user-email">{userEmail || 'patient@clinic.com'}</div>
                                    </div>
                                    <div className="dropdown-menu">
                                        <button className="dropdown-item" onClick={() => { navigate('/patient/profile'); setIsDropdownOpen(false); }}>
                                            <FaUser />
                                            <span>{t.myProfile}</span>
                                        </button>
                                        <button className="dropdown-item" onClick={handleAppointmentHistory}>
                                            <FaHistory />
                                            <span>{t.appointmentHistory}</span>
                                        </button>
                                        <button className="dropdown-item" onClick={() => {
                                            setIsDropdownOpen(false);
                                            navigate('/patient/medical-record');
                                        }}>
                                            <FaFileAlt />
                                            <span>{t.medicalRecords}</span>
                                        </button>
                                        <div className="dropdown-divider"></div>
                                        <button className="dropdown-item logout-btn" onClick={handleLogout}>
                                            <FaSignOutAlt />
                                            <span>{t.logout}</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="patient-layout-content">
                {children}
            </main>
        </div>
    );
};

export default PatientLayout;
