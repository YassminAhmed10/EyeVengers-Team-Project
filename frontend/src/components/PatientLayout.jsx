import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    FaBell, FaTimes, FaSignOutAlt, FaUser, FaHistory, FaFileAlt,
    FaCheck, FaChevronDown, FaGlobe
} from 'react-icons/fa';
import './PatientLayout.css';

const PatientLayout = ({ children, isHomePage = false }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [userName, setUserName] = useState('Guest');
    const [userEmail, setUserEmail] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotif, setShowNotif] = useState(false);
    const [scrolled, setScrolled] = useState(!isHomePage);
    const [lang, setLang] = useState('en');

    // ── Radiology ──────────────────────────────────────────────
    const radiologyBaseUrl   = import.meta.env.VITE_RADIOLOGY_URL        || 'http://localhost:5174';
    const radiologyHomePath  = import.meta.env.VITE_RADIOLOGY_HOME_PATH  || '/patient';
    const normalizedRadiologyPath = radiologyHomePath.startsWith('/')
        ? radiologyHomePath
        : `/${radiologyHomePath}`;
    const radiologyHomeUrl = `${radiologyBaseUrl}${normalizedRadiologyPath}`;

    // ── Pharmacy ───────────────────────────────────────────────
    const pharmacyBaseUrl = import.meta.env.VITE_PHARMACY_URL || 'http://localhost:5175';

    // ── Glasses Store ──────────────────────────────────────────
    const glassesBaseUrl = import.meta.env.VITE_GLASSES_URL || 'http://localhost:5176';

    const dropdownRef = useRef(null);
    const notifRef    = useRef(null);

    const T = {
        en: {
            home: 'Home', svc: 'Services', about: 'About', contact: 'Contact',
            radiologyCenter: 'Radiology Center',
            pharmacy: 'Pharmacy',
            glassesStore: 'Glasses Store',
            langLbl: 'عربي',
            notifTitle: 'Notifications', clearAll: 'Clear all', noNotif: 'No new notifications',
            myProfile: 'My Profile', aptHist: 'Appointment History', medRec: 'Medical Records', signOut: 'Sign Out',
        },
        ar: {
            home: 'الرئيسية', svc: 'الخدمات', about: 'عن الدكتور', contact: 'تواصل',
            radiologyCenter: 'مركز الأشعة',
            pharmacy: 'الصيدلية',
            glassesStore: 'متجر النظارات',
            langLbl: 'EN',
            notifTitle: 'الإشعارات', clearAll: 'مسح الكل', noNotif: 'لا توجد إشعارات',
            myProfile: 'ملفي', aptHist: 'سجل المواعيد', medRec: 'السجلات الطبية', signOut: 'تسجيل الخروج',
        },
    };

    const t    = T[lang] || T.en;
    const isAr = lang === 'ar';

    // ── helpers ────────────────────────────────────────────────
    const getPatientParams = () => {
        const patientId       = localStorage.getItem('patientId')       || '';
        const patientName     = localStorage.getItem('patientName')     || localStorage.getItem('userName') || '';
        const patientEmail    = localStorage.getItem('patientEmail')    || localStorage.getItem('userEmail') || '';
        const patientPhone    = localStorage.getItem('patientPhone')    || '';
        const patientDateOfBirth = localStorage.getItem('patientDateOfBirth') || '';

        const params = new URLSearchParams();
        if (patientId)          params.append('patientId',          patientId);
        if (patientName)        params.append('patientName',        patientName);
        if (patientEmail)       params.append('patientEmail',       patientEmail);
        if (patientPhone)       params.append('patientPhone',       patientPhone);
        if (patientDateOfBirth) params.append('patientDateOfBirth', patientDateOfBirth);
        return params;
    };

    // ── effects ────────────────────────────────────────────────
    useEffect(() => {
        const savedLang = localStorage.getItem('language');
        if (savedLang) setLang(savedLang);
        const u = localStorage.getItem('userName');
        const e = localStorage.getItem('userEmail');
        if (u) setUserName(u);
        if (e) setUserEmail(e);
        fetchNotif();
        const iv = setInterval(fetchNotif, 30000);
        const onScroll = () => { if (isHomePage) setScrolled(window.scrollY > 10); };
        const onOut = (ev) => {
            if (dropdownRef.current && !dropdownRef.current.contains(ev.target)) setIsDropdownOpen(false);
            if (notifRef.current   && !notifRef.current.contains(ev.target))    setShowNotif(false);
        };
        window.addEventListener('scroll', onScroll);
        document.addEventListener('mousedown', onOut);
        return () => {
            clearInterval(iv);
            window.removeEventListener('scroll', onScroll);
            document.removeEventListener('mousedown', onOut);
        };
    }, [isHomePage]);

    const fetchNotif = async () => {
        try {
            const pid = localStorage.getItem('patientId');
            if (!pid) { setNotifications([]); return; }
            const res = await fetch(`http://localhost:5201/api/Appointments/ByPatient/${pid}`);
            if (!res.ok) { setNotifications([]); return; }
            const data = await res.json();
            setNotifications(data
                .filter(a => a.status === 0 && ((new Date() - new Date(a.updatedAt)) / 3600000) < 24)
                .map(a => ({
                    id: a.appointmentId,
                    message: `Appointment on ${new Date(a.appointmentDate).toLocaleDateString()} confirmed!`,
                    date: a.updatedAt || a.createdAt,
                }))
            );
        } catch { setNotifications([]); }
    };

    const logout = () => {
        ['token', 'userName', 'userEmail', 'patientId'].forEach(k => localStorage.removeItem(k));
        navigate('/login');
    };

    const initials   = () => userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const toggleLang = () => {
        const newLang = isAr ? 'en' : 'ar';
        setLang(newLang);
        localStorage.setItem('language', newLang);
    };

    // ── navigation handlers ────────────────────────────────────

    // Radiology — uses existing redirect page (keeps same behaviour)
    const goToRadiologyCenter = () => {
        const params        = getPatientParams();
        const radiologyUrlWithParams = `${radiologyHomeUrl}${params.toString() ? '?' + params.toString() : ''}`;
        const redirectParams = new URLSearchParams({ target: radiologyUrlWithParams });
        navigate(`/patient/radiology-redirect?${redirectParams.toString()}`);
    };

    // Pharmacy — opens pharmacy system in new tab
    const goToPharmacy = () => {
        const params = getPatientParams();
        const url    = `${pharmacyBaseUrl}${params.toString() ? '?' + params.toString() : ''}`;
        window.open(url, '_blank');
    };

    // Glasses Store — opens glass-store system in new tab
    const goToGlassesStore = () => {
        const params = getPatientParams();
        const url    = `${glassesBaseUrl}${params.toString() ? '?' + params.toString() : ''}`;
        window.open(url, '_blank');
    };

    // ── nav links ──────────────────────────────────────────────
    const navLinks = isHomePage
        ? [
            { href: '/patient',   label: t.home, active: true },
            { href: '#services',  label: t.svc },
            { href: '#about',     label: t.about },
            { href: '#contact',   label: t.contact },
        ]
        : [
            { href: '/patient',          label: t.home, active: location.pathname === '/patient' },
            { href: '/patient#services', label: t.svc },
            { href: '/patient#about',    label: t.about },
            { href: '/patient#contact',  label: t.contact },
        ];

    // ── render ─────────────────────────────────────────────────
    return (
        <div className={`ph${!isHomePage ? ' ph-inner-page' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>

            {/* ══════════════════════════════════════
                NAVBAR
            ══════════════════════════════════════ */}
            <header className={`ph-header${scrolled ? ' scrolled' : ''}`}>
                <div className="ph-header-inner">

                    {/* Brand */}
                    <a className="ph-brand" href="/patient">
                        <div className="ph-logo-ring">
                            <img src="/src/images/logo.png" alt="logo" />
                        </div>
                        <span className="ph-brand-text">Dr. Mohab Khairy</span>
                    </a>

                    {/* Center nav pills */}
                    <nav className="ph-nav-pills">
                        {navLinks.map(link => (
                            <a
                                key={link.label}
                                href={link.href}
                                className={`ph-pill${link.active ? ' ph-pill-active' : ''}`}
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    {/* Right actions */}
                    <div className="ph-actions">

                        {/* Service buttons — each opens its own system */}
                        <div className="ph-service-buttons">
                            <button className="ph-service-btn" onClick={goToRadiologyCenter}>
                                {t.radiologyCenter}
                            </button>
                            <button className="ph-service-btn" onClick={goToPharmacy}>
                                {t.pharmacy}
                            </button>
                            <button className="ph-service-btn" onClick={goToGlassesStore}>
                                {t.glassesStore}
                            </button>
                        </div>

                        {/* Lang toggle */}
                        <button className="ph-lang-toggle" onClick={toggleLang}>
                            <FaGlobe />
                            <span>{t.langLbl}</span>
                        </button>

                        {/* Bell */}
                        <div className="ph-notif-wrap" ref={notifRef}>
                            <button className="ph-action-btn" onClick={() => setShowNotif(p => !p)}>
                                <FaBell />
                                {notifications.length > 0 && (
                                    <span className="ph-notif-dot">{notifications.length}</span>
                                )}
                            </button>
                            {showNotif && (
                                <div className="ph-flyout">
                                    <div className="ph-flyout-head">
                                        <span>{t.notifTitle}</span>
                                        <button onClick={() => setNotifications([])}>{t.clearAll}</button>
                                    </div>
                                    {notifications.length === 0
                                        ? (
                                            <div className="ph-flyout-empty">
                                                <FaBell /><p>{t.noNotif}</p>
                                            </div>
                                        )
                                        : notifications.map(n => (
                                            <div key={n.id} className="ph-flyout-row">
                                                <FaCheck className="ph-chk" />
                                                <div>
                                                    <p>{n.message}</p>
                                                    <span>{new Date(n.date).toLocaleString()}</span>
                                                </div>
                                                <button onClick={() =>
                                                    setNotifications(p => p.filter(x => x.id !== n.id))
                                                }>
                                                    <FaTimes />
                                                </button>
                                            </div>
                                        ))
                                    }
                                </div>
                            )}
                        </div>

                        {/* Profile */}
                        <div className="ph-profile-wrap" ref={dropdownRef}>
                            <button className="ph-profile-pill" onClick={() => setIsDropdownOpen(p => !p)}>
                                <div className="ph-avatar">{initials()}</div>
                                <span>{userName}</span>
                                <FaChevronDown className={`ph-caret${isDropdownOpen ? ' open' : ''}`} />
                            </button>
                            {isDropdownOpen && (
                                <div className="ph-flyout ph-profile-flyout">
                                    <div className="ph-flyout-head ph-flyout-user">
                                        <strong>{userName}</strong>
                                        <span>{userEmail || 'patient@clinic.com'}</span>
                                    </div>
                                    <div className="ph-flyout-menu">
                                        {[
                                            { ico: <FaUser />,    lbl: t.myProfile, path: '/patient/profile' },
                                            { ico: <FaHistory />, lbl: t.aptHist,   path: '/patient/appointments' },
                                            { ico: <FaFileAlt />, lbl: t.medRec,    path: '/patient/medical-record' },
                                        ].map(item => (
                                            <button
                                                key={item.path}
                                                className="ph-flyout-item"
                                                onClick={() => { setIsDropdownOpen(false); navigate(item.path); }}
                                            >
                                                {item.ico}{item.lbl}
                                            </button>
                                        ))}
                                        <div className="ph-sep" />
                                        <button className="ph-flyout-item ph-logout" onClick={logout}>
                                            <FaSignOutAlt />{t.signOut}
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