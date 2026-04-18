import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { 
  FaHome, FaServicestack, FaUserMd, FaCalendarCheck, 
  FaFileAlt, FaEnvelope, FaSignInAlt, FaUserPlus, 
  FaUserCircle, FaGlobe, FaArrowRight, FaChevronDown,
  FaHistory, FaClipboardList, FaCog, FaSignOutAlt,
  FaBell, FaQuestionCircle
} from "react-icons/fa";
import { FiMenu, FiX } from "react-icons/fi";
import ScanIcon from "./ScanIcon";
import logoSrc from "../../assets/logo.png";

/* ─── i18n content ─── */
const CONTENT = {
  ar: {
    dir: "rtl",
    links: [
      { id: "home",    label: "الرئيسية", icon: <FaHome /> },
      { id: "services",label: "خدماتنا", icon: <FaServicestack /> },
      { id: "doctors", label: "أطباؤنا", icon: <FaUserMd /> },
      { id: "booking", label: "حجز موعد", icon: <FaCalendarCheck /> },
      { id: "results", label: "نتائجي", icon: <FaFileAlt /> },
      { id: "contact", label: "تواصل معنا", icon: <FaEnvelope /> },
    ],
    login:    "دخول",
    register: "تسجيل جديد",
    langLabel: "EN",
    backToClinic: "العودة إلى عيادتك",
    dashboard: "لوحة التحكم",
    appointments: "مواعيدي",
    reports: "تقاريري",
    settings: "الإعدادات",
    help: "مساعدة",
    logout: "تسجيل الخروج",
  },
  en: {
    dir: "ltr",
    links: [
      { id: "home",    label: "Home", icon: <FaHome /> },
      { id: "services",label: "Services", icon: <FaServicestack /> },
      { id: "doctors", label: "Doctors", icon: <FaUserMd /> },
      { id: "booking", label: "Book", icon: <FaCalendarCheck /> },
      { id: "results", label: "Results", icon: <FaFileAlt /> },
      { id: "contact", label: "Contact", icon: <FaEnvelope /> },
    ],
    login:    "Login",
    register: "Register",
    langLabel: "ع",
    backToClinic: "Back to your clinic",
    dashboard: "Dashboard",
    appointments: "Appointments",
    reports: "Reports",
    settings: "Settings",
    help: "Help",
    logout: "Logout",
  },
};

/* ─── Larger Circular Logo component ─── */
function CircularLogo({ src, lang, onClick }) {
  const [imgOk, setImgOk] = useState(!!src);
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      {imgOk && src ? (
        <div style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          overflow: "hidden",
          background: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 15px rgba(0,0,0,0.15)",
        }}>
          <img
            src={src}
            alt="Radiology Center"
            onError={() => setImgOk(false)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      ) : (
        <div style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #1f6bff, #00b8a8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(31,107,255,0.3)",
        }}>
          <ScanIcon />
        </div>
      )}
    </motion.div>
  );
}

/* ─── Language toggle ─── */
function LangToggle({ lang, onToggle }) {
  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ color: "#1f6bff", opacity: 1 }}
      whileTap={{ scale: 0.95 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 12px",
        fontSize: 14,
        fontWeight: 500,
        color: "white",
        cursor: "pointer",
        border: "none",
        background: "transparent",
        fontFamily: "'Poppins', 'Cairo', sans-serif",
        letterSpacing: "0.5px",
        transition: "all 0.2s ease",
      }}
    >
      <FaGlobe size={12} style={{ opacity: 0.7 }} />
      <AnimatePresence mode="wait">
        <motion.span
          key={lang}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.2 }}
        >
          {CONTENT[lang].langLabel}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

/* ─── Profile Dropdown Menu ─── */
function ProfileDropdown({ patientName, patientId, getUserInitials, onNavigate, onLogout, lang, isOpen, onToggle, dropdownRef }) {
  const t = CONTENT[lang];
  const dir = t.dir;

  const menuItems = [
    { id: "dashboard", label: t.dashboard, icon: <FaUserCircle />, path: "profile" },
    { id: "appointments", label: t.appointments, icon: <FaHistory />, path: "booking" },
    { id: "reports", label: t.reports, icon: <FaClipboardList />, path: "results" },
    { id: "settings", label: t.settings, icon: <FaCog />, path: "profile" },
    { id: "help", label: t.help, icon: <FaQuestionCircle />, path: "contact" },
  ];

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <motion.div
        onClick={onToggle}
        whileHover={{ opacity: 0.8 }}
        whileTap={{ scale: 0.98 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "6px 12px",
          cursor: "pointer",
          background: "transparent",
          border: "none",
          borderRadius: 40,
          transition: "all 0.2s ease",
        }}
      >
        <div style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: 600,
          fontSize: 14,
        }}>
          {getUserInitials()}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <FaChevronDown size={10} style={{ color: "white", opacity: 0.6 }} />
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              [dir === "rtl" ? "right" : "left"]: 0,
              minWidth: 240,
              background: "rgba(255, 255, 255, 0.98)",
              backdropFilter: "blur(10px)",
              borderRadius: 12,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
              overflow: "hidden",
              zIndex: 1000,
            }}
          >
            <div style={{
              padding: "16px",
              borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
              background: "rgba(31, 107, 255, 0.05)",
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #1f6bff, #00b8a8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 18,
                }}>
                  {getUserInitials()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: "#1a1a2e", fontSize: 14 }}>
                    {patientName}
                  </div>
                  {patientId && (
                    <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>
                      ID: {patientId}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ padding: "8px 0" }}>
              {menuItems.map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ background: "rgba(31, 107, 255, 0.08)" }}
                  onClick={() => {
                    onNavigate(item.path);
                    onToggle();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                    padding: "10px 16px",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#333",
                    textAlign: dir === "rtl" ? "right" : "left",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span style={{ fontSize: 14, color: "#1f6bff" }}>{item.icon}</span>
                  <span>{item.label}</span>
                </motion.button>
              ))}
            </div>

            <div style={{ height: 1, background: "rgba(0, 0, 0, 0.08)", margin: "4px 0" }} />

            <motion.button
              whileHover={{ background: "rgba(220, 53, 69, 0.08)" }}
              onClick={() => {
                onLogout();
                onToggle();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                padding: "10px 16px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 500,
                color: "#dc3545",
                textAlign: dir === "rtl" ? "right" : "left",
                transition: "all 0.2s ease",
              }}
            >
              <FaSignOutAlt size={14} />
              <span>{t.logout}</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Mobile menu button ─── */
function MobileMenuButton({ open, toggle }) {
  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.95 }}
      style={{
        display: "none",
        alignItems: "center",
        justifyContent: "center",
        width: 44,
        height: 44,
        background: "transparent",
        border: "none",
        cursor: "pointer",
        color: "white",
      }}
      className="nav-hamburger"
    >
      {open ? <FiX size={22} /> : <FiMenu size={22} />}
    </motion.button>
  );
}

/* ══════════════════════════════════════════
   MAIN NAVBAR WITH WIDER FONT & RED BACK BUTTON
══════════════════════════════════════════ */
export default function Navbar({ page, setPage, loggedIn }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('radiologyLang') || "ar";
  });
  const [mobileOpen, setMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const navRef = useRef(null);
  const dropdownRef = useRef(null);

  const t = CONTENT[lang];
  const dir = t.dir;

  const CLINIC_URL = import.meta.env.VITE_CLINIC_URL || 'http://localhost:5173';

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlPatientName = urlParams.get('patientName');
    const urlPatientId = urlParams.get('patientId');
    const urlPatientEmail = urlParams.get('patientEmail');
    
    const storedName = localStorage.getItem('radiologyPatientName');
    const storedId = localStorage.getItem('radiologyPatientId');
    
    const finalName = urlPatientName || storedName;
    const finalId = urlPatientId || storedId;
    
    if (finalName) {
      setPatientName(finalName);
      localStorage.setItem('radiologyPatientName', finalName);
    }
    
    if (finalId) {
      setPatientId(finalId);
      localStorage.setItem('radiologyPatientId', finalId);
    }
    
    if (urlPatientEmail) {
      localStorage.setItem('radiologyPatientEmail', urlPatientEmail);
    }
    
    if (urlPatientName || urlPatientId) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('radiologyLang', lang);
  }, [lang]);

  useEffect(() => { setMobile(false); }, [page]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (navRef.current && !navRef.current.contains(event.target) && mobileOpen) {
        setMobile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen]);

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang, dir]);

  const toggleLang = () => setLang(l => l === "ar" ? "en" : "ar");

  const handleBackToClinic = () => {
    let clinicUrl = CLINIC_URL;
    if (patientId || patientName) {
      const params = new URLSearchParams();
      if (patientId) params.append('patientId', patientId);
      if (patientName) params.append('patientName', patientName);
      clinicUrl = `${CLINIC_URL}/patient?${params.toString()}`;
    } else {
      clinicUrl = `${CLINIC_URL}/patient`;
    }
    window.location.href = clinicUrl;
  };

  const handleLogout = () => {
    localStorage.removeItem('radiologyPatientName');
    localStorage.removeItem('radiologyPatientId');
    localStorage.removeItem('radiologyPatientEmail');
    localStorage.removeItem('token');
    setPatientName("");
    setPatientId("");
    setPage("home");
  };

  const getUserInitials = () => {
    if (!patientName) return lang === 'ar' ? 'ز' : 'GU';
    const nameParts = patientName.split(' ');
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return patientName.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&family=Cairo:wght@400;500;600;700;800&display=swap');
        
        @media (max-width: 968px) {
          .nav-links-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
          .back-to-clinic-desktop { display: none !important; }
          .auth-buttons-desktop { display: none !important; }
        }
        @media (min-width: 969px) {
          .nav-mobile-menu { display: none !important; }
          .back-to-clinic-mobile { display: none !important; }
          .auth-buttons-mobile { display: none !important; }
        }
        
        .nav-link-hover {
          transition: all 0.2s ease;
          font-family: 'Inter', 'Cairo', sans-serif;
          letter-spacing: -0.2px;
        }
        
        .nav-link-hover:hover {
          color: #1f6bff !important;
          opacity: 1 !important;
        }
        
        .back-button-red {
          transition: all 0.2s ease;
          font-family: 'Inter', 'Cairo', sans-serif;
          font-weight: 600;
        }
        
        .back-button-red:hover {
          color: #ff4444 !important;
          opacity: 1 !important;
        }
      `}</style>

      <motion.nav
        ref={navRef}
        dir={dir}
        animate={{
          padding: scrolled ? "16px 0" : "24px 0",
        }}
        transition={{ duration: 0.3 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 999,
          border: "none",
          background: "transparent",
        }}
      >
        <div className="container" style={{ 
          maxWidth: 1400,
          margin: "0 auto",
          padding: "0 48px",
        }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            width: "100%",
          }}>

            {/* Left: Larger Circular Logo */}
            <CircularLogo src={logoSrc} lang={lang} onClick={() => setPage("home")} />

            {/* Center: Navigation Links with Wider Font */}
            <div className="nav-links-desktop" style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 8,
              direction: dir,
            }}>
              {t.links.map((l) => (
                <motion.button
                  key={l.id}
                  onClick={() => setPage(l.id)}
                  whileHover={{ color: "#1f6bff", opacity: 1 }}
                  whileTap={{ scale: 0.98 }}
                  className="nav-link-hover"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 20px",
                    fontSize: 15,
                    fontWeight: page === l.id ? 700 : 500,
                    color: page === l.id ? "#1f6bff" : "white",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    opacity: page === l.id ? 1 : 0.85,
                    fontFamily: "'Inter', 'Cairo', sans-serif",
                    letterSpacing: "-0.2px",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span style={{ fontSize: 16 }}>{l.icon}</span>
                  <span style={{ whiteSpace: "nowrap" }}>{l.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Right: Actions - Back button at the end with red color */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 20,
              direction: dir,
            }}>
              
              {/* Language Toggle */}
              <LangToggle lang={lang} onToggle={toggleLang} />

              {/* Auth Buttons or Profile Dropdown */}
              <div className="auth-buttons-desktop">
                {patientName ? (
                  <ProfileDropdown
                    patientName={patientName}
                    patientId={patientId}
                    getUserInitials={getUserInitials}
                    onNavigate={setPage}
                    onLogout={handleLogout}
                    lang={lang}
                    isOpen={dropdownOpen}
                    onToggle={() => setDropdownOpen(!dropdownOpen)}
                    dropdownRef={dropdownRef}
                  />
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <motion.button
                      onClick={() => setPage("login")}
                      whileHover={{ color: "#1f6bff", opacity: 1 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        padding: "10px 20px",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "white",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        opacity: 0.85,
                        transition: "all 0.2s ease",
                        fontFamily: "'Inter', 'Cairo', sans-serif",
                        letterSpacing: "-0.2px",
                      }}
                    >
                      {t.login}
                    </motion.button>
                    <motion.button
                      onClick={() => setPage("register")}
                      whileHover={{ color: "#1f6bff", opacity: 1 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        padding: "10px 20px",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "white",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        opacity: 0.85,
                        transition: "all 0.2s ease",
                        fontFamily: "'Inter', 'Cairo', sans-serif",
                        letterSpacing: "-0.2px",
                      }}
                    >
                      {t.register}
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Back to Clinic Button - Red, with ArrowRight, positioned at end */}
              <motion.button
                className="back-to-clinic-desktop back-button-red"
                onClick={handleBackToClinic}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 20px",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#ff4444",
                  background: "rgba(255, 68, 68, 0.1)",
                  border: "1px solid rgba(255, 68, 68, 0.3)",
                  borderRadius: 40,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontFamily: "'Inter', 'Cairo', sans-serif",
                  letterSpacing: "-0.2px",
                }}
              >
                <span>{t.backToClinic}</span>
                <FaArrowRight size={12} />
              </motion.button>

              <MobileMenuButton open={mobileOpen} toggle={() => setMobile(o => !o)} />
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="nav-mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                overflow: "hidden",
                background: "rgba(0, 0, 0, 0.95)",
                backdropFilter: "blur(20px)",
                marginTop: 16,
                borderTop: "1px solid rgba(255, 255, 255, 0.05)",
              }}
            >
              <div style={{ 
                padding: "24px", 
                display: "flex", 
                flexDirection: "column", 
                gap: 12,
              }}>
                {t.links.map((l, i) => (
                  <motion.button
                    key={l.id}
                    initial={{ opacity: 0, x: dir === "rtl" ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setPage(l.id)}
                    whileHover={{ color: "#1f6bff" }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      width: "100%",
                      padding: "14px 20px",
                      fontSize: 16,
                      fontWeight: page === l.id ? 700 : 500,
                      color: page === l.id ? "#1f6bff" : "white",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      opacity: page === l.id ? 1 : 0.85,
                      textAlign: dir === "rtl" ? "right" : "left",
                      transition: "all 0.2s ease",
                      fontFamily: "'Inter', 'Cairo', sans-serif",
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{l.icon}</span>
                    <span>{l.label}</span>
                  </motion.button>
                ))}

                <div style={{ 
                  borderTop: "1px solid rgba(255, 255, 255, 0.05)", 
                  marginTop: 16, 
                  paddingTop: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}>
                  {!patientName && (
                    <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                      <motion.button
                        onClick={() => setPage("login")}
                        whileHover={{ color: "#1f6bff" }}
                        style={{
                          flex: 1,
                          padding: "12px 16px",
                          fontSize: 15,
                          fontWeight: 600,
                          color: "white",
                          background: "rgba(255, 255, 255, 0.1)",
                          border: "none",
                          borderRadius: 10,
                          cursor: "pointer",
                          fontFamily: "'Inter', 'Cairo', sans-serif",
                        }}
                      >
                        {t.login}
                      </motion.button>
                      <motion.button
                        onClick={() => setPage("register")}
                        whileHover={{ color: "#1f6bff" }}
                        style={{
                          flex: 1,
                          padding: "12px 16px",
                          fontSize: 15,
                          fontWeight: 600,
                          color: "white",
                          background: "rgba(255, 255, 255, 0.1)",
                          border: "none",
                          borderRadius: 10,
                          cursor: "pointer",
                          fontFamily: "'Inter', 'Cairo', sans-serif",
                        }}
                      >
                        {t.register}
                      </motion.button>
                    </div>
                  )}

                  {/* Back button in mobile menu - Red */}
                  <motion.button
                    onClick={handleBackToClinic}
                    whileHover={{ scale: 1.02 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      width: "100%",
                      padding: "12px 16px",
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#ff4444",
                      background: "rgba(255, 68, 68, 0.1)",
                      border: "1px solid rgba(255, 68, 68, 0.3)",
                      borderRadius: 40,
                      cursor: "pointer",
                      fontFamily: "'Inter', 'Cairo', sans-serif",
                    }}
                  >
                    <span>{t.backToClinic}</span>
                    <FaArrowRight size={12} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}