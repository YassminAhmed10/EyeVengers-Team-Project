// src/components/PatientLayout.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    FaBell, FaTimes, FaSignOutAlt, FaUser, FaHistory, FaFileAlt,
    FaCheck, FaChevronDown, FaGlobe, FaClipboardList,
} from 'react-icons/fa';
import './PatientLayout.css';

const BASE_API = import.meta.env?.VITE_API_URL || 'http://localhost:5201/api';

const PatientLayout = ({ children, isHomePage = false }) => {
    const navigate  = useNavigate();
    const location  = useLocation();
    const [userName, setUserName]           = useState('Guest');
    const [userEmail, setUserEmail]         = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);   // appointment notifs
    const [orderNotifs, setOrderNotifs]     = useState([]);   // doctor-order notifs
    const [showNotif, setShowNotif]         = useState(false);
    const [scrolled, setScrolled]           = useState(!isHomePage);
    const [lang, setLang]                   = useState('en');
    const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

    // ── External system URLs ───────────────────────────────────
    const radiologyBaseUrl  = import.meta.env.VITE_RADIOLOGY_URL       || 'http://localhost:5174';
    const radiologyHomePath = import.meta.env.VITE_RADIOLOGY_HOME_PATH || '/';
    const normalizedRadiologyPath = radiologyHomePath.startsWith('/') ? radiologyHomePath : `/${radiologyHomePath}`;
    const radiologyHomeUrl  = `${radiologyBaseUrl}${normalizedRadiologyPath}`;
    const pharmacyBaseUrl   = import.meta.env.VITE_PHARMACY_URL  || 'http://localhost:5175';
    const glassesBaseUrl    = import.meta.env.VITE_GLASSES_URL   || 'http://localhost:5176';

    const dropdownRef = useRef(null);
    const notifRef    = useRef(null);

    const T = {
        en: {
            home: 'Home', svc: 'Services', about: 'About', contact: 'Contact',
            radiologyCenter: 'Radiology Center', pharmacy: 'Pharmacy', glassesStore: 'Glasses Store',
            langLbl: 'عربي',
            notifTitle: 'Notifications', clearAll: 'Clear all', noNotif: 'No new notifications',
            myProfile: 'My Profile', aptHist: 'Appointment History',
            medRec: 'Medical Records', myOrders: 'My Doctor Requests', signOut: 'Sign Out',
        },
        ar: {
            home: 'الرئيسية', svc: 'الخدمات', about: 'عن الدكتور', contact: 'تواصل',
            radiologyCenter: 'مركز الأشعة', pharmacy: 'الصيدلية', glassesStore: 'متجر النظارات',
            langLbl: 'EN',
            notifTitle: 'الإشعارات', clearAll: 'مسح الكل', noNotif: 'لا توجد إشعارات',
            myProfile: 'ملفي', aptHist: 'سجل المواعيد',
            medRec: 'السجلات الطبية', myOrders: 'طلبات الدكتور', signOut: 'تسجيل الخروج',
        },
    };

    const t    = T[lang] || T.en;
    const isAr = lang === 'ar';

    // ── helpers ────────────────────────────────────────────────
    const getPatientId = () => {
        const direct = localStorage.getItem('patientId');
        if (direct) return parseInt(direct, 10);
        const userJson = localStorage.getItem('patient') || localStorage.getItem('user') || localStorage.getItem('currentUser');
        if (userJson) {
            try {
                const obj = JSON.parse(userJson);
                const id  = obj?.patientId ?? obj?.id ?? obj?.Id ?? obj?.PatientId;
                if (id) return parseInt(id, 10);
            } catch {}
        }
        return null;
    };

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

    // ── Fetch doctor orders → build notifications ──────────────
    const fetchOrderNotifs = async () => {
        const patientId = getPatientId();
        if (!patientId) { setOrderNotifs([]); setPendingOrdersCount(0); return; }
        try {
            const token = localStorage.getItem('token');
            const apiUrl = BASE_API.replace('https://localhost', 'http://localhost');
            const res   = await fetch(
                `${apiUrl}/DoctorOrders/MyOrders?patientId=${patientId}`,
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );
            if (!res.ok) { setOrderNotifs([]); setPendingOrdersCount(0); return; }
            const orders = await res.json();

            const recentOrders = orders.filter(o => {
                const age = (Date.now() - new Date(o.createdAt).getTime()) / (1000 * 60 * 60 * 24);
                return age < 7;
            });

            const pending = orders.filter(o => o.status === 'PendingPatientApproval');
            setPendingOrdersCount(pending.length);

            const TYPE_LABEL = {
                investigation: 'Radiology Investigation',
                eyeExam:       'Eye Exam / Vision',
                prescription:  'Medication Prescription',
            };

            setOrderNotifs(recentOrders.map(o => ({
                id:        o.id,
                orderId:   o.id,
                orderType: o.orderType,
                status:    o.status,
                message:   o.status === 'PendingPatientApproval'
                    ? `Your doctor sent a new request: ${TYPE_LABEL[o.orderType] || o.orderType}. Action required.`
                    : `Your ${TYPE_LABEL[o.orderType] || o.orderType} request is now ${o.status}.`,
                date:      o.createdAt,
                isPending: o.status === 'PendingPatientApproval',
            })));
        } catch {
            setOrderNotifs([]);
            setPendingOrdersCount(0);
        }
    };

    // ── Fetch appointment notifications ────────────────────────
    const fetchNotif = async () => {
        try {
            const pid = localStorage.getItem('patientId');
            if (!pid) { setNotifications([]); return; }
            const res  = await fetch(`http://localhost:5201/api/Appointments/ByPatient/${pid}`);
            if (!res.ok) { setNotifications([]); return; }
            const data = await res.json();
            setNotifications(data
                .filter(a => a.status === 0 && ((new Date() - new Date(a.updatedAt)) / 3600000) < 24)
                .map(a => ({
                    id:      a.appointmentId,
                    message: `Appointment on ${new Date(a.appointmentDate).toLocaleDateString()} confirmed!`,
                    date:    a.updatedAt || a.createdAt,
                    isAppt:  true,
                }))
            );
        } catch { setNotifications([]); }
    };

    // Combined notifications for the bell
    const allNotifs = [...orderNotifs, ...notifications];
    const totalNotifCount = allNotifs.length;

    // ── Effects ────────────────────────────────────────────────
    useEffect(() => {
        const savedLang = localStorage.getItem('language');
        if (savedLang) setLang(savedLang);
        const u = localStorage.getItem('userName');
        const e = localStorage.getItem('userEmail');
        if (u) setUserName(u);
        if (e) setUserEmail(e);

        fetchNotif();
        fetchOrderNotifs();

        const iv = setInterval(() => { fetchNotif(); fetchOrderNotifs(); }, 30000);

        const onScroll = () => { if (isHomePage) setScrolled(window.scrollY > 10); };
        const onOut    = (ev) => {
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

    const logout = () => {
        const keysToRemove = [
            'authToken','token','userName','userEmail','patientId','patientIdentifier',
            'medicalRecordId', 'userRole','isAuthenticated','patient','patientName',
            'patientEmail','patientPhone','patientDateOfBirth','userId','doctorId',
            'radiologyPatientName', 'radiologyPatientId', 'radiologyPatientEmail',
            'radiologyPatientPhone', 'radiologyPatientGender', 'radiologyPatientDateOfBirth',
            'radiologyPatientNationalId', 'radiologyPatientAddress'
        ];
        keysToRemove.forEach(k => localStorage.removeItem(k));
        navigate('/login');
    };

    const initials   = () => userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const toggleLang = () => {
        const newLang = isAr ? 'en' : 'ar';
        setLang(newLang);
        localStorage.setItem('language', newLang);
    };

    // ── Navigation ─────────────────────────────────────────────
    const goToRadiologyCenter = () => {
        const params = getPatientParams();
        const radiologyUrlWithParams = `${radiologyHomeUrl}${params.toString() ? '?' + params.toString() : ''}`;
        const redirectParams = new URLSearchParams({ target: radiologyUrlWithParams });
        navigate(`/patient/radiology-redirect?${redirectParams.toString()}`);
    };
    const goToPharmacy     = () => { const p = getPatientParams(); window.open(`${pharmacyBaseUrl}${p.toString() ? '?' + p.toString() : ''}`, '_blank'); };
    const goToGlassesStore = () => { const p = getPatientParams(); window.open(`${glassesBaseUrl}${p.toString() ? '?' + p.toString() : ''}`, '_blank'); };

    const navLinks = isHomePage
        ? [
            { href: '/patient',  label: t.home, active: true },
            { href: '#services', label: t.svc },
            { href: '#about',    label: t.about },
            { href: '#contact',  label: t.contact },
          ]
        : [
            { href: '/patient',          label: t.home, active: location.pathname === '/patient' },
            { href: '/patient#services', label: t.svc },
            { href: '/patient#about',    label: t.about },
            { href: '/patient#contact',  label: t.contact },
          ];

    // ── Dropdown menu items ────────────────────────────────────
    const dropdownItems = [
        { ico: <FaUser />,         lbl: t.myProfile, path: '/patient/profile' },
        { ico: <FaHistory />,      lbl: t.aptHist,   path: '/patient/appointments' },
        { ico: <FaFileAlt />,      lbl: t.medRec,    path: '/patient/medical-record' },
        {
            ico: (
                <span style={{ position: 'relative', display: 'inline-flex' }}>
                    <FaClipboardList />
                    {pendingOrdersCount > 0 && (
                        <span style={{
                            position: 'absolute', top: -6, right: -8,
                            background: '#ef4444', color: '#fff',
                            fontSize: '0.55rem', fontWeight: 900,
                            minWidth: 15, height: 15, borderRadius: 999,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '1.5px solid #fff',
                        }}>
                            {pendingOrdersCount}
                        </span>
                    )}
                </span>
            ),
            lbl: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {t.myOrders}
                    {pendingOrdersCount > 0 && (
                        <span style={{
                            background: '#ef4444', color: '#fff',
                            fontSize: '0.65rem', fontWeight: 800,
                            padding: '1px 7px', borderRadius: 999,
                        }}>
                            {pendingOrdersCount} new
                        </span>
                    )}
                </span>
            ),
            path: '/patient/orders',
        },
    ];

    // ── render ─────────────────────────────────────────────────
    return (
        <div className={`ph${!isHomePage ? ' ph-inner-page' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>

            <header className={`ph-header${scrolled ? ' scrolled' : ''}`}>
                <div className="ph-header-inner">

                    {/* Brand */}
                    <a className="ph-brand" href="/patient">
                        <div className="ph-logo-ring">
                            <img src="/src/images/logo.png" alt="logo" onError={(e) => { e.target.style.display = 'none'; }} />
                        </div>
                        <span className="ph-brand-text">Dr. Mohab Khairy</span>
                    </a>

                    {/* Nav pills */}
                    <nav className="ph-nav-pills">
                        {navLinks.map(link => (
                            <a key={link.label} href={link.href}
                                className={`ph-pill${link.active ? ' ph-pill-active' : ''}`}>
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    {/* Right actions */}
                    <div className="ph-actions">

                        {/* Service buttons */}
                        <div className="ph-service-buttons">
                            <button className="ph-service-btn" onClick={goToRadiologyCenter}>{t.radiologyCenter}</button>
                            <button className="ph-service-btn" onClick={goToPharmacy}>{t.pharmacy}</button>
                            <button className="ph-service-btn" onClick={goToGlassesStore}>{t.glassesStore}</button>
                        </div>

                        {/* Lang */}
                        <button className="ph-lang-toggle" onClick={toggleLang}>
                            <FaGlobe /><span>{t.langLbl}</span>
                        </button>

                        {/* Bell — combined notifications */}
                        <div className="ph-notif-wrap" ref={notifRef}>
                            <button className="ph-action-btn" onClick={() => setShowNotif(p => !p)}>
                                <FaBell />
                                {totalNotifCount > 0 && (
                                    <span className="ph-notif-dot">{totalNotifCount}</span>
                                )}
                            </button>

                            {showNotif && (
                                <div className="ph-flyout">
                                    <div className="ph-flyout-head">
                                        <span>{t.notifTitle}</span>
                                        <button type="button" onClick={(e) => {
                                            e.preventDefault(); e.stopPropagation();
                                            setNotifications([]); setOrderNotifs([]); setPendingOrdersCount(0);
                                        }}>
                                            {t.clearAll}
                                        </button>
                                    </div>

                                    {allNotifs.length === 0 ? (
                                        <div className="ph-flyout-empty">
                                            <FaBell /><p>{t.noNotif}</p>
                                        </div>
                                    ) : (
                                        allNotifs.map((n) => (
                                            <div
                                                key={`${n.isAppt ? 'apt' : 'ord'}-${n.id}`}
                                                className={`ph-flyout-row${n.isPending ? ' ph-notif-urgent' : ''}`}
                                                style={{ cursor: n.orderId ? 'pointer' : 'default' }}
                                                onClick={() => {
                                                    if (n.orderId) {
                                                        setShowNotif(false);
                                                        navigate('/patient/orders');
                                                    }
                                                }}
                                            >
                                                <span style={{
                                                    fontSize: '1.1rem', marginTop: 2, flexShrink: 0,
                                                    color: n.isPending ? '#ef4444' : n.isAppt ? '#0d9488' : '#1565c0',
                                                }}>
                                                    {n.isAppt ? <FaCheck /> : <FaClipboardList />}
                                                </span>

                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{
                                                        fontSize: '.8rem', color: '#334155',
                                                        lineHeight: 1.45, marginBottom: '.12rem',
                                                        fontWeight: n.isPending ? 700 : 400,
                                                    }}>
                                                        {n.message}
                                                    </p>
                                                    <span style={{ fontSize: '.68rem', color: '#94a3b8' }}>
                                                        {new Date(n.date).toLocaleString()}
                                                    </span>
                                                    {n.isPending && (
                                                        <span style={{
                                                            display: 'inline-block', marginLeft: 6,
                                                            background: '#fef2f2', color: '#ef4444',
                                                            fontSize: '.62rem', fontWeight: 800,
                                                            padding: '1px 7px', borderRadius: 999,
                                                            border: '1px solid #fecaca',
                                                        }}>
                                                            Action required →
                                                        </span>
                                                    )}
                                                </div>

                                                <button
                                                    type="button"
                                                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '.78rem', flexShrink: 0 }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (n.isAppt) setNotifications(p => p.filter(x => x.id !== n.id));
                                                        else          setOrderNotifs(p => p.filter(x => x.id !== n.id));
                                                    }}
                                                >
                                                    <FaTimes />
                                                </button>
                                            </div>
                                        ))
                                    )}

                                    {/* View all link */}
                                    {orderNotifs.length > 0 && (
                                        <div style={{ padding: '.75rem 1rem', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                                            <button
                                                type="button"
                                                onClick={() => { setShowNotif(false); navigate('/patient/orders'); }}
                                                style={{
                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                    color: '#1565c0', fontWeight: 700, fontSize: '.82rem',
                                                    fontFamily: 'var(--f-body)',
                                                }}
                                            >
                                                View all doctor requests →
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Profile dropdown */}
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
                                        {dropdownItems.map((item) => (
                                            <button
                                                key={item.path}
                                                type="button"
                                                className="ph-flyout-item"
                                                onClick={(e) => {
                                                    e.preventDefault(); e.stopPropagation();
                                                    setIsDropdownOpen(false);
                                                    navigate(item.path);
                                                }}
                                            >
                                                {item.ico}{item.lbl}
                                            </button>
                                        ))}
                                        <div className="ph-sep" />
                                        <button
                                            type="button"
                                            className="ph-flyout-item ph-logout"
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); logout(); }}
                                        >
                                            <FaSignOutAlt />{t.signOut}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="patient-layout-content">
                {children}
            </main>
        </div>
    );
};

export default PatientLayout;