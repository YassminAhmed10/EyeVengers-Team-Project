import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
  FaHome, FaServicestack, FaUserMd, FaCalendarCheck,
  FaFileAlt, FaEnvelope, FaArrowLeft, FaChevronDown,
  FaHistory, FaClipboardList, FaCog, FaSignOutAlt,
  FaQuestionCircle, FaGlobe, FaBell,
} from "react-icons/fa";
import { FiMenu, FiX } from "react-icons/fi";
import logoSrc from "../../assets/logo.png";

const PRIMARY  = "#0070b8";
const SURFACE  = "#ffffff";
const P_LIGHT  = "rgba(0,112,184,0.08)";
const P_MEDIUM = "rgba(0,112,184,0.15)";
const P_BORDER = "rgba(0,112,184,0.22)";
const TEXT_MAIN = "#0070b8";
const TEXT_MUTE = "rgba(0,112,184,0.55)";

const CONTENT = {
  ar: {
    dir: "rtl",
    links: [
      { id: "home",     label: "الرئيسية",   icon: <FaHome /> },
      { id: "services", label: "خدماتنا",    icon: <FaServicestack /> },
      { id: "doctors",  label: "أطباؤنا",    icon: <FaUserMd /> },
      { id: "patient-book-appointment", label: "حجز موعد", icon: <FaCalendarCheck /> },
      { id: "patient-results",  label: "نتائجي",     icon: <FaFileAlt /> },
      { id: "patient-notifications",  label: "تنبيهاتي", icon: <FaBell /> },
      { id: "contact",  label: "تواصل معنا", icon: <FaEnvelope /> },
    ],
    login: "دخول", register: "تسجيل", langLabel: "EN",
    backToClinic: "العودة للعيادة",
    dashboard: "لوحة التحكم", appointments: "مواعيدي",
    reports: "تقاريري", settings: "الإعدادات",
    help: "مساعدة", logout: "تسجيل الخروج",
  },
  en: {
    dir: "ltr",
    links: [
      { id: "home",     label: "Home",     icon: <FaHome /> },
      { id: "services", label: "Services", icon: <FaServicestack /> },
      { id: "doctors",  label: "Doctors",  icon: <FaUserMd /> },
      { id: "patient-book-appointment", label: "Book",     icon: <FaCalendarCheck /> },
      { id: "patient-results",  label: "Results",  icon: <FaFileAlt /> },
      { id: "patient-notifications",  label: "Notifications",  icon: <FaBell /> },
      { id: "contact",  label: "Contact",  icon: <FaEnvelope /> },
    ],
    login: "Login", register: "Register", langLabel: "ع",
    backToClinic: "Back to Clinic",
    dashboard: "Dashboard", appointments: "Appointments",
    reports: "Reports", settings: "Settings",
    help: "Help", logout: "Logout",
  },
};

// Helper to clean localStorage values — filters out "undefined" string
const cleanVal = (key) => {
  const v = localStorage.getItem(key) || "";
  return v === "undefined" || v === "null" ? "" : v;
};

function Logo({ src, onClick }) {
  const [ok, setOk] = useState(!!src);
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05, rotate: -3 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}
    >
      {ok && src ? (
        <img src={src} alt="logo" onError={() => setOk(false)}
          style={{ width: 46, height: 46, borderRadius: 0, objectFit: "contain", background: "#fff", padding: 4 }} />
      ) : (
        <div style={{
          width: 46, height: 46, borderRadius: 0, background: PRIMARY,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: SURFACE, fontWeight: 800, fontSize: 20,
          fontFamily: "'Plus Jakarta Sans','Cairo',sans-serif", letterSpacing: -1,
        }}>N</div>
      )}
    </motion.button>
  );
}

function ProfileDropdown({ patientName, patientEmail, getUserInitials, onNavigate, onLogout, lang, isOpen, onToggle, dropdownRef }) {
  const t = CONTENT[lang];
  const isRtl = t.dir === "rtl";
  const items = [
    { id: "dashboard",    label: t.dashboard,    icon: <FaUserMd />,         path: "profile"  },
    { id: "appointments", label: t.appointments, icon: <FaHistory />,        path: "booking"  },
    { id: "reports",      label: t.reports,      icon: <FaClipboardList />,  path: "results"  },
    { id: "settings",     label: t.settings,     icon: <FaCog />,            path: "profile"  },
    { id: "help",         label: t.help,         icon: <FaQuestionCircle />, path: "contact"  },
  ];

  const displayName = patientName && patientName !== "undefined" ? patientName : "User";
  const firstWord   = displayName.split(" ")[0];

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <motion.button
        onClick={onToggle}
        whileHover={{ background: P_LIGHT, borderColor: P_BORDER }}
        whileTap={{ scale: 0.97 }}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(0,0,0,0)", border: `1.5px solid ${P_BORDER}`,
          cursor: "pointer", padding: "6px 12px 6px 10px",
          borderRadius: 100, transition: "all 0.18s",
        }}
      >
        <div style={{
          width: 28, height: 28, borderRadius: "50%", background: PRIMARY,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: SURFACE, fontWeight: 700, fontSize: 11,
          fontFamily: "'Plus Jakarta Sans','Cairo',sans-serif",
        }}>
          {getUserInitials()}
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: TEXT_MAIN, fontFamily: "'Plus Jakarta Sans','Cairo',sans-serif" }}>
          {firstWord}
        </span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <FaChevronDown size={9} style={{ color: TEXT_MUTE }} />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            style={{
              position: "absolute",
              top: "calc(100% + 12px)",
              [isRtl ? "right" : "left"]: 0,
              minWidth: 220,
              background: SURFACE,
              borderRadius: 14,
              boxShadow: `0 12px 40px ${P_MEDIUM}, 0 2px 8px ${P_BORDER}`,
              border: `1px solid ${P_BORDER}`,
              overflow: "hidden",
              zIndex: 1000,
            }}
          >
            {/* Header */}
            <div style={{
              padding: "14px 16px", borderBottom: `1px solid ${P_BORDER}`,
              display: "flex", alignItems: "center", gap: 10,
              background: P_LIGHT,
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%", background: PRIMARY,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: SURFACE, fontWeight: 700, fontSize: 14,
                fontFamily: "'Plus Jakarta Sans','Cairo',sans-serif",
              }}>
                {getUserInitials()}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT_MAIN, fontFamily: "'Plus Jakarta Sans','Cairo',sans-serif" }}>
                  {displayName}
                </div>
                {patientEmail && patientEmail !== "undefined" && (
                  <div style={{ fontSize: 11, color: TEXT_MUTE, marginTop: 1 }}>{patientEmail}</div>
                )}
              </div>
            </div>

            {/* Items */}
            <div style={{ padding: "6px 0" }}>
              {items.map((item, i) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: isRtl ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ background: P_LIGHT, x: isRtl ? -3 : 3 }}
                  onClick={() => { onNavigate(item.path); onToggle(); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    width: "100%", padding: "9px 16px",
                    border: "none", background: "rgba(0,0,0,0)", cursor: "pointer",
                    fontSize: 13, fontWeight: 500, color: TEXT_MAIN,
                    textAlign: isRtl ? "right" : "left",
                    fontFamily: "'Plus Jakarta Sans','Cairo',sans-serif",
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ color: PRIMARY, fontSize: 12, opacity: 0.7 }}>{item.icon}</span>
                  {item.label}
                </motion.button>
              ))}
            </div>

            <div style={{ height: 1, background: P_BORDER }} />

            <motion.button
              whileHover={{ background: "rgba(239,68,68,0.06)" }}
              onClick={() => { onLogout(); onToggle(); }}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "9px 16px 13px",
                border: "none", background: "rgba(0,0,0,0)", cursor: "pointer",
                fontSize: 13, fontWeight: 600, color: "#ef4444",
                textAlign: isRtl ? "right" : "left",
                fontFamily: "'Plus Jakarta Sans','Cairo',sans-serif",
                transition: "all 0.15s",
              }}
            >
              <FaSignOutAlt size={12} />
              {t.logout}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar({ page, setPage, loggedIn }) {
  const [lang, setLang]             = useState(() => localStorage.getItem("radiologyLang") || "ar");
  const [mobileOpen, setMobile]     = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [dropdownOpen, setDropdown] = useState(false);
  const [patientName, setPatientName]   = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [adminLogged, setAdminLogged] = useState(() => localStorage.getItem("radiologyAdminLoggedIn") === "true");
  const [adminEmailState, setAdminEmailState] = useState(() => localStorage.getItem("radiologyAdminEmail") || "");
  const [fromClinic, setFromClinic] = useState(false);
  const navRef      = useRef(null);
  const dropdownRef = useRef(null);

  const t      = CONTENT[lang];
  const isRtl  = t.dir === "rtl";
  const CLINIC_URL = import.meta.env.VITE_CLINIC_URL || "http://localhost:5173";

  const readUserData = () => ({
    name:  cleanVal("radiologyPatientName"),
    email: cleanVal("radiologyPatientEmail"),
  });

  // Read from URL params or localStorage on mount
  useEffect(() => {
    const params   = new URLSearchParams(window.location.search);
    const urlName  = params.get("patientName");
    const urlEmail = params.get("patientEmail");
    const clinicFlag = params.get("fromClinic") || params.get("from") || params.get("fromClinicFlag");
    const refIsClinic = document.referrer && document.referrer.includes(CLINIC_URL);
    const fromLocal = localStorage.getItem("radiologyFromClinic") === "true";
    const isFrom = (clinicFlag === "1" || clinicFlag === "true") || refIsClinic || fromLocal;
    setFromClinic(!!isFrom);
    if (isFrom) localStorage.setItem("radiologyFromClinic", "true");
    const name  = urlName  || cleanVal("radiologyPatientName");
    const email = urlEmail || cleanVal("radiologyPatientEmail");
    if (name)  { setPatientName(name);  localStorage.setItem("radiologyPatientName",  name);  }
    if (email) { setPatientEmail(email); localStorage.setItem("radiologyPatientEmail", email); }
    if (urlName || urlEmail) window.history.replaceState({}, "", window.location.pathname);
  }, []);

  // Re-read when loggedIn or page changes
  useEffect(() => {
    const { name, email } = readUserData();
    setPatientName(name);
    setPatientEmail(email);
    setAdminLogged(localStorage.getItem("radiologyAdminLoggedIn") === "true");
    setAdminEmailState(localStorage.getItem("radiologyAdminEmail") || "");
  }, [loggedIn, page]);

  // Listen to custom event dispatched after login
  useEffect(() => {
    const handler = () => {
      const { name, email } = readUserData();
      setPatientName(name);
      setPatientEmail(email);
      setAdminLogged(localStorage.getItem("radiologyAdminLoggedIn") === "true");
      setAdminEmailState(localStorage.getItem("radiologyAdminEmail") || "");
    };
    window.addEventListener("userDataUpdated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("userDataUpdated", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  useEffect(() => { localStorage.setItem("radiologyLang", lang); }, [lang]);
  useEffect(() => { setMobile(false); }, [page]);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  useEffect(() => {
    const fn = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdown(false);
      if (navRef.current && !navRef.current.contains(e.target) && mobileOpen) setMobile(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [mobileOpen]);
  useEffect(() => {
    document.documentElement.dir  = t.dir;
    document.documentElement.lang = lang;
  }, [lang, t.dir]);

  const handleBackToClinic = () => {
    const p = new URLSearchParams();
    if (patientName)  p.append("patientName",  patientName);
    if (patientEmail) p.append("patientEmail", patientEmail);
    window.location.href = `${CLINIC_URL}/patient${p.toString() ? "?" + p : ""}`;
  };

  const handleLogout = () => {
    [
      "radiologyPatientName", "radiologyPatientId", "radiologyPatientEmail",
      "firebaseToken", "userRole", "userName", "userEmail", "userId",
    ].forEach(k => localStorage.removeItem(k));
    setPatientName("");
    setPatientEmail("");
    setPage("home");
  };

  const handleAdminLogout = () => {
    ["radiologyAdminEmail", "radiologyAdminRole", "radiologyAdminLoggedIn"].forEach(k => localStorage.removeItem(k));
    setAdminLogged(false);
    setAdminEmailState("");
    setPage("home");
  };

  const getUserInitials = () => {
    const name = (patientName && patientName !== "undefined") ? patientName.trim() : "";
    if (!name) return lang === "ar" ? "م" : "GU";
    const parts = name.split(" ").filter(Boolean);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Cairo:wght@400;500;600;700&display=swap');

        .nb-link {
          position: relative;
          display: flex; align-items: center; gap: 6px;
          padding: 9px 16px; border: none;
          background: rgba(0,0,0,0); border-radius: 10px; cursor: pointer;
          font-size: 13.5px; font-weight: 500; color: rgba(0,112,184,0.65);
          font-family: 'Plus Jakarta Sans','Cairo',sans-serif;
          transition: color 0.2s, background 0.2s, transform 0.15s;
          white-space: nowrap;
        }
        .nb-link .nb-ico { font-size: 12px; opacity: 0.5; transition: opacity 0.2s, transform 0.25s cubic-bezier(.34,1.56,.64,1); }
        .nb-link:hover { color: #0070b8; background: rgba(0,112,184,0.08); transform: translateY(-1px); }
        .nb-link:hover .nb-ico { opacity: 1; transform: scale(1.2) rotate(-8deg); }
        .nb-link.act { color: #0070b8; font-weight: 700; }
        .nb-link.act .nb-ico { opacity: 1; }
        .nb-link::after {
          content: ''; position: absolute; bottom: -21px; left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: 20px; height: 3px; border-radius: 3px 3px 0 0;
          background: #0070b8; transition: transform 0.25s cubic-bezier(.34,1.56,.64,1);
        }
        .nb-link.act::after  { transform: translateX(-50%) scaleX(1); }
        .nb-link:hover::after { transform: translateX(-50%) scaleX(0.5); }

        .nb-ghost {
          padding: 8px 20px; border-radius: 10px;
          border: 1.5px solid rgba(0,112,184,0.3); background: rgba(0,0,0,0); cursor: pointer;
          font-size: 13px; font-weight: 600; color: #0070b8;
          font-family: 'Plus Jakarta Sans','Cairo',sans-serif; transition: all 0.2s;
        }
        .nb-ghost:hover { border-color: #0070b8; background: rgba(0,112,184,0.08); transform: translateY(-1px); }

        .nb-solid {
          position: relative; overflow: hidden;
          padding: 8px 22px; border-radius: 10px; border: none;
          background: #0070b8; cursor: pointer;
          font-size: 13px; font-weight: 700; color: #fff;
          font-family: 'Plus Jakarta Sans','Cairo',sans-serif;
          box-shadow: 0 3px 14px rgba(0,112,184,0.35);
          transition: transform 0.18s, box-shadow 0.18s;
        }
        .nb-solid::before { content: ''; position: absolute; inset: 0; background: rgba(255,255,255,0.12); opacity: 0; transition: opacity 0.18s; }
        .nb-solid:hover::before { opacity: 1; }
        .nb-solid:hover { transform: translateY(-2px); box-shadow: 0 6px 22px rgba(0,112,184,0.45); }
        .nb-solid:active { transform: scale(0.97); }

        .nb-back {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 10px;
          border: 1.5px solid rgba(0,112,184,0.2);
          background: rgba(0,112,184,0.05); cursor: pointer;
          font-size: 12.5px; font-weight: 600; color: #0070b8;
          font-family: 'Plus Jakarta Sans','Cairo',sans-serif; transition: all 0.18s;
        }
        .nb-back:hover { border-color: #0070b8; background: rgba(0,112,184,0.1); transform: translateX(-3px); }

        .nb-lang {
          display: flex; align-items: center; gap: 5px;
          padding: 7px 13px; border-radius: 10px;
          border: 1.5px solid rgba(0,112,184,0.2); background: rgba(0,0,0,0); cursor: pointer;
          font-size: 12px; font-weight: 700; color: #0070b8;
          font-family: 'Plus Jakarta Sans',sans-serif; transition: all 0.18s;
        }
        .nb-lang:hover { border-color: #0070b8; background: rgba(0,112,184,0.08); transform: scale(1.05); }

        .nb-sep { width: 1px; height: 28px; background: rgba(0,112,184,0.15); flex-shrink: 0; }

        @media (max-width: 960px) {
          .nb-center      { display: none !important; }
          .nb-desktop-end { display: none !important; }
          .nb-hamburger   { display: flex !important; }
        }
        @media (min-width: 961px) {
          .nb-mobile-panel { display: none !important; }
          .nb-hamburger    { display: none !important; }
        }
      `}</style>

      <motion.header
        ref={navRef}
        dir={t.dir}
        animate={{
          boxShadow: scrolled
            ? "0 4px 30px rgba(0,112,184,0.12), 0 1px 0 rgba(0,112,184,0.08)"
            : "0 1px 0 rgba(0,112,184,0.08)",
          backdropFilter: scrolled ? "blur(12px)" : "blur(0px)",
        }}
        transition={{ duration: 0.3 }}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 999,
          height: 80, background: scrolled ? "rgba(255,255,255,0.95)" : "#ffffff",
          display: "flex", alignItems: "center", padding: "0 40px",
          borderBottom: `1px solid rgba(0,112,184,0.1)`,
        }}
      >
        <Logo src={logoSrc} onClick={() => setPage("home")} />

        <nav className="nb-center" style={{
          position: "absolute", left: "50%", top: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex", alignItems: "center", gap: 2, direction: t.dir,
        }}>
          {t.links.map(l => (
            <motion.button
              key={l.id}
              className={`nb-link${page === l.id ? " act" : ""}`}
              onClick={() => setPage(l.id)}
              whileTap={{ scale: 0.95 }}
            >
              <span className="nb-ico">{l.icon}</span>
              {l.label}
            </motion.button>
          ))}
        </nav>

          <div className="nb-desktop-end" style={{ marginInlineStart: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <motion.button className="nb-lang" onClick={() => setLang(l => l === "ar" ? "en" : "ar")} whileTap={{ scale: 0.93, rotate: 10 }}>
            <FaGlobe size={10} style={{ opacity: 0.6 }} />
            <AnimatePresence mode="wait">
              <motion.span key={lang} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.15 }}>
                {t.langLabel}
              </motion.span>
            </AnimatePresence>
          </motion.button>
         

          <div className="nb-sep" />

          {patientName ? (
            <ProfileDropdown
              patientName={patientName} patientEmail={patientEmail}
              getUserInitials={getUserInitials} onNavigate={setPage}
              onLogout={handleLogout} lang={lang}
              isOpen={dropdownOpen} onToggle={() => setDropdown(o => !o)}
              dropdownRef={dropdownRef}
            />
          ) : adminLogged ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ padding: "6px 10px", borderRadius: 10, background: "rgba(0,0,0,0.04)", fontWeight: 700 }}>{adminEmailState}</div>
              <motion.button className="nb-solid" onClick={() => setPage("admin-dashboard")} whileTap={{ scale: 0.96 }}>{t.dashboard}</motion.button>
              <motion.button className="nb-ghost" onClick={handleAdminLogout} whileTap={{ scale: 0.96 }}>{t.logout}</motion.button>
            </div>
          ) : (
            <>
              <motion.button className="nb-ghost" onClick={() => setPage("login")} whileTap={{ scale: 0.96 }}>{t.login}</motion.button>
              <motion.button className="nb-solid" onClick={() => setPage("register")} whileTap={{ scale: 0.96 }}>{t.register}</motion.button>
            </>
          )}

          <div className="nb-sep" />

          {fromClinic && (
            <motion.button className="nb-back" onClick={handleBackToClinic} whileTap={{ scale: 0.96 }}>
              <motion.span animate={{ x: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
                <FaArrowLeft size={10} style={{ transform: isRtl ? "scaleX(-1)" : "none" }} />
              </motion.span>
              {t.backToClinic}
            </motion.button>
          )}
        </div>

        <motion.button
          className="nb-hamburger"
          onClick={() => setMobile(o => !o)}
          whileTap={{ scale: 0.9 }}
          style={{
            display: "none", marginInlineStart: "auto",
            alignItems: "center", justifyContent: "center",
            width: 40, height: 40, background: "rgba(0,112,184,0.08)",
            border: "1.5px solid rgba(0,112,184,0.15)",
            borderRadius: 10, cursor: "pointer", color: "#0070b8",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span key={mobileOpen ? "x" : "menu"} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              {mobileOpen ? <FiX size={18} /> : <FiMenu size={18} />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="nb-mobile-panel"
            dir={t.dir}
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            style={{
              position: "fixed", top: 88, left: 12, right: 12, zIndex: 998,
              background: "#fff", borderRadius: 16,
              boxShadow: `0 12px 40px rgba(0,112,184,0.15)`,
              border: `1px solid rgba(0,112,184,0.12)`, padding: "12px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {t.links.map((l, i) => (
                <motion.button
                  key={l.id}
                  initial={{ opacity: 0, x: isRtl ? 14 : -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, type: "spring", stiffness: 400, damping: 28 }}
                  onClick={() => setPage(l.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "11px 16px", borderRadius: 10,
                    border: "none", cursor: "pointer",
                    fontSize: 14, fontWeight: page === l.id ? 700 : 500,
                    color: page === l.id ? "#0070b8" : "rgba(0,112,184,0.6)",
                    background: page === l.id ? "rgba(0,112,184,0.08)" : "rgba(0,0,0,0)",
                    textAlign: isRtl ? "right" : "left",
                    fontFamily: "'Plus Jakarta Sans','Cairo',sans-serif",
                    transition: "all 0.18s",
                  }}
                >
                  <span style={{ fontSize: 14, opacity: page === l.id ? 1 : 0.5 }}>{l.icon}</span>
                  {l.label}
                </motion.button>
              ))}
            </div>

            <div style={{ height: 1, background: "rgba(0,112,184,0.1)", margin: "10px 4px" }} />

            <div style={{ display: "flex", gap: 8, padding: "0 4px 4px" }}>
              {!patientName && !adminLogged && (
                <>
                  <button onClick={() => setPage("login")} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid rgba(0,112,184,0.25)", background: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#0070b8", fontFamily: "'Plus Jakarta Sans','Cairo',sans-serif" }}>
                    {t.login}
                  </button>
                  <button onClick={() => setPage("register")} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "#0070b8", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: "'Plus Jakarta Sans','Cairo',sans-serif", boxShadow: "0 3px 12px rgba(0,112,184,0.35)" }}>
                    {t.register}
                  </button>
                </>
              )}
              {adminLogged && (
                <div style={{ display: "flex", gap: 8, width: "100%" }}>
                  <button onClick={() => setPage("admin-dashboard")} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "#0070b8", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#fff" }}>
                    {t.dashboard}
                  </button>
                  <button onClick={handleAdminLogout} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid rgba(0,112,184,0.25)", background: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#0070b8" }}>
                    {t.logout}
                  </button>
                </div>
              )}
              {fromClinic && (
                <button onClick={handleBackToClinic} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px 16px", borderRadius: 10, border: "1.5px solid rgba(0,112,184,0.2)", background: "rgba(0,112,184,0.05)", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#0070b8", fontFamily: "'Plus Jakarta Sans','Cairo',sans-serif" }}>
                  <FaArrowLeft size={11} style={{ transform: isRtl ? "scaleX(-1)" : "none" }} />
                  {t.backToClinic}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}