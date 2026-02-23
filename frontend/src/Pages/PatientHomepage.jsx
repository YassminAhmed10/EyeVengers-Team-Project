import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaCalendarAlt, FaHistory, FaSignOutAlt, FaEye, FaStethoscope,
    FaSyringe, FaHeartbeat, FaMicroscope, FaGlasses, FaArrowRight,
    FaUser, FaFileAlt, FaBell, FaTimes, FaCheck, FaPhoneAlt,
    FaMapMarkerAlt, FaEnvelope, FaChevronDown, FaShieldAlt,
    FaClock, FaAward, FaUsers, FaGlobe
} from 'react-icons/fa';
import { MdVisibility } from 'react-icons/md';
import './PatientHomepage.css';

const PatientHomepage = () => {
    const navigate = useNavigate();
    const [userName, setUserName]             = useState('Guest');
    const [userEmail, setUserEmail]           = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [notifications, setNotifications]   = useState([]);
    const [showNotif, setShowNotif]           = useState(false);
    const [scrolled, setScrolled]             = useState(false);
    const [lang, setLang]                     = useState('en');
    const dropdownRef = useRef(null);
    const notifRef    = useRef(null);

    const T = {
        en: {
            home:'Home', svc:'Services', about:'About', contact:'Contact',
            langLbl:'عربي',
            heroTitle:'Welcome Back,',
            heroSub:'Your vision is our priority. Book your next appointment with Dr. Mohab Khairy — trusted ophthalmologist with over 15 years of expertise.',
            bookNow:'Book Appointment', myApts:'My Appointments',
            stats:[{v:'12,000+',l:'Patients Treated'},{v:'15+',l:'Years Experience'},{v:'98%',l:'Satisfaction Rate'},{v:'24/7',l:'Support'}],
            svcLabel:'What We Offer', svcTitle:'Our Services', svcSub:'Comprehensive eye care solutions tailored to your needs',
            learnMore:'Learn More',
            aboutLabel:'About the Doctor', aboutTitle:'Dr. Mohab Khairy',
            aboutDesc:'A leading ophthalmologist with over 15 years of dedicated experience diagnosing and treating a wide range of eye conditions, committed to compassionate personalised care.',
            aboutPts:['Cataract & LASIK Surgery Expert','Retinal Disease Specialist','Advanced Glaucoma Management','Pediatric Eye Care'],
            bookConsult:'Book a Consultation',
            myProfile:'My Profile', aptHist:'Appointment History', medRec:'Medical Records', signOut:'Sign Out',
            notifTitle:'Notifications', clearAll:'Clear all', noNotif:'No new notifications',
            svcList:[
                {title:'Eye Exams',desc:'Full evaluations with advanced diagnostic equipment by experienced specialists.'},
                {title:'Cataract Surgery',desc:'State-of-the-art procedures to restore clear vision with minimal recovery time.'},
                {title:'LASIK Surgery',desc:'Laser vision correction for permanent freedom from glasses and contacts.'},
                {title:'Glaucoma Care',desc:'Early detection and management to prevent vision loss from glaucoma.'},
                {title:'Retinal Care',desc:'Specialised treatment for diabetic retinopathy and macular degeneration.'},
                {title:'Pediatric Eyes',desc:'Gentle, comprehensive eye care for children of all ages.'},
            ],
        },
        ar: {
            home:'الرئيسية', svc:'الخدمات', about:'عن الدكتور', contact:'تواصل',
            langLbl:'EN',
            heroTitle:'أهلاً بعودتك،',
            heroSub:'رؤيتك هي أولويتنا. احجز موعدك مع الدكتور مهاب خيري، طبيب عيون متميز بخبرة تتجاوز 15 عاماً.',
            bookNow:'احجز موعد', myApts:'مواعيدي',
            stats:[{v:'+12,000',l:'مريض تمت معالجته'},{v:'+15',l:'سنوات خبرة'},{v:'98%',l:'نسبة الرضا'},{v:'24/7',l:'دعم مستمر'}],
            svcLabel:'ما نقدمه', svcTitle:'خدماتنا', svcSub:'حلول شاملة لرعاية العيون مصممة وفق احتياجاتك',
            learnMore:'اعرف أكثر',
            aboutLabel:'عن الدكتور', aboutTitle:'د. مهاب خيري',
            aboutDesc:'طبيب عيون رائد بخبرة تزيد على 15 عاماً في تشخيص وعلاج أمراض العيون، يسعى دائماً لتقديم رعاية شخصية وإنسانية.',
            aboutPts:['خبير جراحة الساد والليزك','متخصص في أمراض الشبكية','علاج الجلوكوما المتقدم','رعاية عيون الأطفال'],
            bookConsult:'احجز استشارة',
            myProfile:'ملفي', aptHist:'سجل المواعيد', medRec:'السجلات الطبية', signOut:'تسجيل الخروج',
            notifTitle:'الإشعارات', clearAll:'مسح الكل', noNotif:'لا توجد إشعارات',
            svcList:[
                {title:'فحص العيون',desc:'تقييم كامل بأحدث الأجهزة التشخيصية وعلى يد متخصصين ذوي خبرة.'},
                {title:'جراحة الساد',desc:'إجراءات جراحية متطورة لاستعادة وضوح الرؤية مع فترة تعافٍ قصيرة.'},
                {title:'جراحة الليزك',desc:'تصحيح الرؤية بالليزر للتحرر الدائم من النظارات والعدسات.'},
                {title:'علاج الجلوكوما',desc:'كشف مبكر ومتابعة مستمرة للحد من فقدان البصر.'},
                {title:'رعاية الشبكية',desc:'علاج متخصص لاعتلال الشبكية السكري والضمور البقعي.'},
                {title:'عيون الأطفال',desc:'رعاية لطيفة وشاملة لعيون الأطفال من جميع الأعمار.'},
            ],
        },
    }[lang];

    const svcIcons = [<FaEye/>,<FaSyringe/>,<FaGlasses/>,<FaStethoscope/>,<FaHeartbeat/>,<FaMicroscope/>];
    const isAr = lang === 'ar';

    useEffect(() => {
        const u = localStorage.getItem('userName');
        const e = localStorage.getItem('userEmail');
        if (u) setUserName(u);
        if (e) setUserEmail(e);
        fetchNotif();
        const iv = setInterval(fetchNotif, 30000);
        const onScroll = () => setScrolled(window.scrollY > 10);
        const onOut = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false);
            if (notifRef.current    && !notifRef.current.contains(e.target))    setShowNotif(false);
        };
        window.addEventListener('scroll', onScroll);
        document.addEventListener('mousedown', onOut);
        return () => { clearInterval(iv); window.removeEventListener('scroll', onScroll); document.removeEventListener('mousedown', onOut); };
    }, []);

    const fetchNotif = async () => {
        try {
            const pid = localStorage.getItem('patientId') || 'P-000001';
            const res = await fetch(`http://localhost:5201/api/Appointments/ByPatient/${pid}`);
            if (!res.ok) { setNotifications([]); return; }
            const data = await res.json();
            setNotifications(data
                .filter(a => a.status === 0 && ((new Date() - new Date(a.updatedAt)) / 3600000) < 24)
                .map(a => ({ id: a.appointmentId, message: `Appointment on ${new Date(a.appointmentDate).toLocaleDateString()} confirmed!`, date: a.updatedAt || a.createdAt }))
            );
        } catch { setNotifications([]); }
    };

    const logout = () => {
        ['token','userName','userEmail','patientId'].forEach(k => localStorage.removeItem(k));
        navigate('/login');
    };
    const initials = () => userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);

    return (
        <div className="ph" dir={isAr ? 'rtl' : 'ltr'}>

            {/* ══════════════════════════════════
                NAVBAR — Floating pill style
            ══════════════════════════════════ */}
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
                        <a href="/patient"  className="ph-pill ph-pill-active">{T.home}</a>
                        <a href="#services" className="ph-pill">{T.svc}</a>
                        <a href="#about"    className="ph-pill">{T.about}</a>
                        <a href="#contact"  className="ph-pill">{T.contact}</a>
                    </nav>

                    {/* Right actions */}
                    <div className="ph-actions">

                        {/* Lang */}
                        <button className="ph-lang-toggle" onClick={() => setLang(isAr?'en':'ar')}>
                            <FaGlobe />
                            <span>{T.langLbl}</span>
                        </button>

                        {/* Bell */}
                        <div className="ph-notif-wrap" ref={notifRef}>
                            <button className="ph-action-btn" onClick={() => setShowNotif(p=>!p)}>
                                <FaBell />
                                {notifications.length > 0 && <span className="ph-notif-dot">{notifications.length}</span>}
                            </button>
                            {showNotif && (
                                <div className="ph-flyout">
                                    <div className="ph-flyout-head">
                                        <span>{T.notifTitle}</span>
                                        <button onClick={() => setNotifications([])}>{T.clearAll}</button>
                                    </div>
                                    {notifications.length === 0
                                        ? <div className="ph-flyout-empty"><FaBell /><p>{T.noNotif}</p></div>
                                        : notifications.map(n => (
                                            <div key={n.id} className="ph-flyout-row">
                                                <FaCheck className="ph-chk"/>
                                                <div><p>{n.message}</p><span>{new Date(n.date).toLocaleString()}</span></div>
                                                <button onClick={() => setNotifications(p=>p.filter(x=>x.id!==n.id))}><FaTimes/></button>
                                            </div>
                                        ))
                                    }
                                </div>
                            )}
                        </div>

                        {/* Profile */}
                        <div className="ph-profile-wrap" ref={dropdownRef}>
                            <button className="ph-profile-pill" onClick={() => setIsDropdownOpen(p=>!p)}>
                                <div className="ph-avatar">{initials()}</div>
                                <span>{userName}</span>
                                <FaChevronDown className={`ph-caret${isDropdownOpen?' open':''}`}/>
                            </button>
                            {isDropdownOpen && (
                                <div className="ph-flyout ph-profile-flyout">
                                    <div className="ph-flyout-head ph-flyout-user">
                                        <strong>{userName}</strong>
                                        <span>{userEmail || 'patient@clinic.com'}</span>
                                    </div>
                                    <div className="ph-flyout-menu">
                                        {[
                                            {ico:<FaUser/>,    lbl:T.myProfile, path:'/patient/profile'},
                                            {ico:<FaHistory/>, lbl:T.aptHist,   path:'/patient/appointments'},
                                            {ico:<FaFileAlt/>, lbl:T.medRec,    path:'/patient/medical-record'},
                                        ].map(item=>(
                                            <button key={item.path} className="ph-flyout-item" onClick={()=>{setIsDropdownOpen(false);navigate(item.path);}}>
                                                {item.ico}{item.lbl}
                                            </button>
                                        ))}
                                        <div className="ph-sep"/>
                                        <button className="ph-flyout-item ph-logout" onClick={logout}>
                                            <FaSignOutAlt/>{T.signOut}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* ══════════════════════════════════
                HERO — full viewport with homep.png
            ══════════════════════════════════ */}
            <section className="ph-hero" style={{backgroundImage:'url(/src/images/eye.png)'}}>
                <div className="ph-hero-overlay"/>
                <div className="ph-hero-inner">
                    <div className="ph-hero-text">
                        <h1 className="ph-hero-h1">
                            {T.heroTitle}<br />
                            <span className="ph-hero-name">{userName}!</span>
                        </h1>
                        <p className="ph-hero-sub">{T.heroSub}</p>
                        <div className="ph-hero-btns">
                            <button className="ph-btn-primary" onClick={()=>navigate('/book-appointment')}>
                                <FaCalendarAlt/> {T.bookNow} <FaArrowRight className="ph-arrow"/>
                            </button>
                            <button className="ph-btn-secondary" onClick={()=>navigate('/patient/appointments')}>
                                <FaHistory/> {T.myApts}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats strip at bottom of hero */}
                <div className="ph-stats-strip">
                    {T.stats.map((s,i)=>(
                        <div key={i} className="ph-stat-item">
                            <span className="ph-stat-v">{s.v}</span>
                            <span className="ph-stat-l">{s.l}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════════════════════════
                SERVICES
            ══════════════════════════════════ */}
            <section className="ph-services" id="services">
                <div className="ph-wrap">
                    <p className="ph-sec-label">{T.svcLabel}</p>
                    <h2 className="ph-sec-title">{T.svcTitle}</h2>
                    <p className="ph-sec-sub">{T.svcSub}</p>
                    <div className="ph-svc-grid">
                        {T.svcList.map((s,i)=>(
                            <div key={i} className="ph-svc-card" style={{animationDelay:`${i*.09}s`}}>
                                <div className="ph-svc-ico">{svcIcons[i]}</div>
                                <h3>{s.title}</h3>
                                <p>{s.desc}</p>
                                <span className="ph-svc-lnk">{T.learnMore} <FaArrowRight/></span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════
                ABOUT
            ══════════════════════════════════ */}
            <section className="ph-about" id="about">
                <div className="ph-wrap ph-about-grid">
                    <div className="ph-about-img">
                        <img src="/src/images/doctor.jpg" alt="Dr Mohab Khairy"/>
                        <div className="ph-about-badge">
                            <strong>15+</strong><span>Years of Excellence</span>
                        </div>
                    </div>
                    <div className="ph-about-txt">
                        <p className="ph-sec-label ph-label-left">{T.aboutLabel}</p>
                        <h2 className="ph-sec-title ph-title-left">{T.aboutTitle}</h2>
                        <p className="ph-about-desc">{T.aboutDesc}</p>
                        <ul className="ph-about-list">
                            {T.aboutPts.map(p=><li key={p}><FaCheck className="ph-chk-ico"/>{p}</li>)}
                        </ul>
                        <button className="ph-btn-primary" onClick={()=>navigate('/book-appointment')}>
                            <FaCalendarAlt/>{T.bookConsult}<FaArrowRight className="ph-arrow"/>
                        </button>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════
                CONTACT
            ══════════════════════════════════ */}
            <section className="ph-contact" id="contact">
                <div className="ph-wrap ph-contact-grid">
                    {[
                        {ico:<FaPhoneAlt/>,    lbl:'Phone',   val:'+20 100 000 0000'},
                        {ico:<FaEnvelope/>,    lbl:'Email',   val:'clinic@mohab.com'},
                        {ico:<FaMapMarkerAlt/>,lbl:'Address', val:'Cairo, Egypt'},
                        {ico:<FaClock/>,       lbl:'Hours',   val:'Sat–Thu, 9 AM – 6 PM'},
                    ].map(c=>(
                        <div key={c.lbl} className="ph-contact-item">
                            <div className="ph-contact-ico">{c.ico}</div>
                            <div><strong>{c.lbl}</strong><span>{c.val}</span></div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="ph-footer">
                <div className="ph-wrap ph-footer-inner">
                    <div className="ph-brand ph-footer-brand">
                        <div className="ph-logo-ring ph-logo-ring-sm">
                            <img src="/src/images/logo.png" alt="logo"/>
                        </div>
                        <span>Dr. Mohab Khairy Eye Clinic</span>
                    </div>
                    <p>© {new Date().getFullYear()} Dr. Mohab Khairy Eye Clinic. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default PatientHomepage;