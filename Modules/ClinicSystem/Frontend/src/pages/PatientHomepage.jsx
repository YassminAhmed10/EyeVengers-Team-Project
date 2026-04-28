import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaCalendarAlt, FaHistory, FaEye, FaStethoscope,
    FaSyringe, FaHeartbeat, FaMicroscope, FaGlasses, FaArrowRight,
    FaCheck, FaPhoneAlt,
    FaMapMarkerAlt, FaEnvelope,
    FaClock
} from 'react-icons/fa';
import PatientLayout from '../components/PatientLayout';
import './PatientHomepage.css';

const PatientHomepage = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('Guest');
    const [lang, setLang] = useState('en');

    const T = {
        en: {
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

    useEffect(() => {
        const u = localStorage.getItem('userName');
        const savedLang = localStorage.getItem('language');
        if (u) setUserName(u);
        if (savedLang) setLang(savedLang);
    }, []);

    return (
        <PatientLayout isHomePage>
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
        </PatientLayout>
    );
};

export default PatientHomepage;