import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaCalendarAlt, FaUserMd, FaClock, FaCheck, FaSignOutAlt,
    FaEye, FaStethoscope, FaSyringe, FaHeartbeat, FaMicroscope,
    FaGlasses, FaArrowRight, FaUser, FaPhone, FaEnvelope, FaHistory,
    FaBell, FaTimes
} from 'react-icons/fa';
import './PatientHomepage.css';

const PatientHomepage = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('Guest');
    const [userEmail, setUserEmail] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const dropdownRef = useRef(null);
    const notifRef = useRef(null);

    useEffect(() => {
        // Get user info from localStorage or API
        const storedUser = localStorage.getItem('userName');
        const storedEmail = localStorage.getItem('userEmail');

        if (storedUser) {
            setUserName(storedUser);
        }
        if (storedEmail) {
            setUserEmail(storedEmail);
        }

        // Fetch appointment notifications
        fetchNotifications();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);

        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            clearInterval(interval);
        };
    }, []);

    const fetchNotifications = async () => {
        try {
            const patientId = localStorage.getItem('patientId') || 'P-000001';
            const response = await fetch(`http://localhost:5201/api/Appointments/ByPatient/${patientId}`);
            if (response.ok) {
                const data = await response.json();
                // Get recently confirmed appointments (status changed from pending to upcoming in last 24 hours)
                const recentlyConfirmed = data.filter(apt => {
                    const updatedAt = apt.updatedAt ? new Date(apt.updatedAt) : null;
                    const now = new Date();
                    const hoursDiff = updatedAt ? (now - updatedAt) / (1000 * 60 * 60) : 999;
                    return apt.status === 0 && apt.appointmentType === 'online' && hoursDiff < 24;
                });

                setNotifications(recentlyConfirmed.map(apt => ({
                    id: apt.appointmentId,
                    message: `Your appointment on ${new Date(apt.appointmentDate).toLocaleDateString()} at ${apt.appointmentTime} with Dr. ${apt.doctor?.name || 'TBD'} has been confirmed!`,
                    date: apt.updatedAt || apt.createdAt,
                    read: false
                })));
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        navigate('/login');
    };

    const handleBookAppointment = () => {
        navigate('/book-appointment');
    };

    const handleAppointmentHistory = () => {
        setIsDropdownOpen(false);
        navigate('/patient/appointments');
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const services = [
        {
            icon: <FaEye />,
            title: 'Comprehensive Eye Exams',
            description: 'Complete eye health evaluations with advanced diagnostic equipment and experienced specialists.',
            link: '#services'
        },
        {
            icon: <FaSyringe />,
            title: 'Cataract Surgery',
            description: 'State-of-the-art surgical procedures to restore clear vision with minimal recovery time.',
            link: '#services'
        },
        {
            icon: <FaGlasses />,
            title: 'LASIK Surgery',
            description: 'Advanced laser vision correction for freedom from glasses and contact lenses.',
            link: '#services'
        },
        {
            icon: <FaStethoscope />,
            title: 'Glaucoma Treatment',
            description: 'Early detection and management to prevent vision loss from glaucoma.',
            link: '#services'
        },
        {
            icon: <FaHeartbeat />,
            title: 'Retinal Care',
            description: 'Specialized treatment for diabetic retinopathy and macular degeneration.',
            link: '#services'
        },
        {
            icon: <FaMicroscope />,
            title: 'Pediatric Eye Care',
            description: 'Gentle and comprehensive eye care for children of all ages.',
            link: '#services'
        }
    ];

    const getUserInitials = () => {
        return userName
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <div className="patient-homepage">
            {/* Header */}
            <header className="patient-header">
                <div className="header-container">
                    <div className="header-logo">
                        <img src="/src/images/logo.png" alt="Clinic Logo" className="logo-img" />
                        <span className="clinic-name">Dr Mohab Khairy</span>
                    </div>

                    <nav className="header-nav">
                        <a href="/patient" className="nav-link active">Home</a>
                        <a href="#services" className="nav-link">Services</a>
                        <a href="#about" className="nav-link">About</a>
                        <a href="#contact" className="nav-link">Contact</a>
                    </nav>

                    <div className="header-actions">
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
                                        <h4>Notifications</h4>
                                        <button onClick={() => setNotifications([])}>
                                            Clear All
                                        </button>
                                    </div>
                                    <div className="notifications-list">
                                        {notifications.length === 0 ? (
                                            <div className="no-notifications">
                                                <FaBell />
                                                <p>No new notifications</p>
                                            </div>
                                        ) : (
                                            notifications.map(notif => (
                                                <div key={notif.id} className="notification-item">
                                                    <FaCheck className="notif-icon" />
                                                    <div className="notif-content">
                                                        <p>{notif.message}</p>
                                                        <span className="notif-time">
                                                            {new Date(notif.date).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <button 
                                                        className="remove-notif"
                                                        onClick={() => setNotifications(prev => 
                                                            prev.filter(n => n.id !== notif.id)
                                                        )}
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="user-profile-container" ref={dropdownRef}>
                            <button className="user-profile-btn" onClick={toggleDropdown}>
                                <div className="user-avatar">
                                    {getUserInitials()}
                                </div>
                                <span className="user-name">{userName}</span>
                                <svg className="dropdown-arrow" width="12" height="8" viewBox="0 0 12 8" fill="none">
                                    <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                            </button>

                            {isDropdownOpen && (
                                <div className="profile-dropdown">
                                    <div className="dropdown-header">
                                        <div className="dropdown-user-name">{userName}</div>
                                        <div className="dropdown-user-email">{userEmail || 'patient@clinic.com'}</div>
                                    </div>
                                    <div className="dropdown-menu">
                                        <button className="dropdown-item" onClick={() => navigate('/patient/profile')}>
                                            <FaUser />
                                            <span>My Profile</span>
                                        </button>
                                        <button className="dropdown-item" onClick={handleAppointmentHistory}>
                                            <FaHistory />
                                            <span>Appointment History</span>
                                        </button>
                                        <div className="dropdown-divider"></div>
                                        <button className="dropdown-item logout-item" onClick={handleLogout}>
                                            <FaSignOutAlt />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section with Background Image */}
            <section className="hero-section" id="home" style={{
                backgroundImage: 'url(/assets/homepage1.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}>
                <div className="hero-overlay">
                    <div className="hero-content">
                        <div className="hero-text">
                            <h1 className="hero-title">
                                Welcome Back,<br />
                                <span className="highlight">{userName}!</span>
                            </h1>
                            <p className="hero-subtitle">
                                Your vision is our priority. Book your appointment today and experience
                                world-class eye care with our expert specialists.
                            </p>

                            <div className="hero-features">
                                <div className="feature-item">
                                    <div className="feature-icon">
                                        <FaCheck />
                                    </div>
                                    <span>Expert Eye Specialists</span>
                                </div>
                                <div className="feature-item">
                                    <div className="feature-icon">
                                        <FaCheck />
                                    </div>
                                    <span>Advanced Technology</span>
                                </div>
                                <div className="feature-item">
                                    <div className="feature-icon">
                                        <FaCheck />
                                    </div>
                                    <span>Flexible Scheduling</span>
                                </div>
                                <div className="feature-item">
                                    <div className="feature-icon">
                                        <FaCheck />
                                    </div>
                                    <span>Insurance Accepted</span>
                                </div>
                            </div>

                            <div className="hero-buttons">
                                <button className="cta-button" onClick={handleBookAppointment}>
                                    <FaCalendarAlt />
                                    Book Appointment Now
                                    <FaArrowRight />
                                </button>
                                
                                <button className="cta-button-secondary" onClick={handleAppointmentHistory}>
                                    <FaHistory />
                                    View My Appointments
                                    <FaArrowRight />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="services-section" id="services">
                <div className="services-container">
                    <h2 className="section-title">Our Services</h2>
                    <p className="section-subtitle">
                        Comprehensive eye care solutions tailored to your needs
                    </p>

                    <div className="services-grid">
                        {services.map((service, index) => (
                            <div key={index} className="service-card">
                                <div className="service-icon">
                                    {service.icon}
                                </div>
                                <h3 className="service-title">{service.title}</h3>
                                <p className="service-description">{service.description}</p>
                                <a href={service.link} className="service-link">
                                    Learn More <FaArrowRight />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PatientHomepage;