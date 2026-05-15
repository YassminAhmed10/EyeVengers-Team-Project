// src/App.jsx — No Firebase, No FHIR unless explicitly configured
import { useMemo, useState, useEffect } from "react";
import "./App.css";
import Footer from "./components/Radiology/Footer";
import Navbar from "./components/Radiology/Navbar";
import AdminNavbar from "./components/Radiology/AdminNavbar";
import SendModal from "./components/Radiology/SendModal";
import SuccessModal from "./components/Radiology/SuccessModal";
import useGlobalUiMotion from "./hooks/useGlobalUiMotion";
import BookingPage from "./pages/Radiology/BookingPage";
import ConfirmPage from "./pages/Radiology/ConfirmPage";
import ContactPage from "./pages/Radiology/ContactPage";
import DoctorsPage from "./pages/Radiology/DoctorsPage";
import HomePage from "./pages/Radiology/HomePage";
import LoginPage from "./pages/Radiology/LoginPage";
import ProfilePage from "./pages/Radiology/ProfilePage";
import RegisterPage from "./pages/Radiology/RegisterPage";
import ReportPage from "./pages/Radiology/ReportPage";
import ResultsPage from "./pages/Radiology/ResultsPage";
import ServicesPage from "./pages/Radiology/ServicesPage";
import AdminDashboard from "./pages/Radiology/AdminDashboard";
import AppointmentRequestsPage from "./pages/Admin/AppointmentRequestsPage";
import UploadRadiologyResultsPage from "./pages/Admin/UploadRadiologyResultsPage";
import InvestigationManagementPage from "./pages/Admin/InvestigationManagementPage";
import BookAppointmentPage from "./pages/Radiology/BookAppointmentPage";
import RadiologyResultsPage from "./pages/Radiology/RadiologyResultsPage";
import AppointmentHistoryPage from "./pages/Radiology/AppointmentHistoryPage";
import NotificationsPage from "./pages/Radiology/NotificationsPage";
import SettingsPage from "./pages/Radiology/SettingsPage";
import { MyDoctorRequestsPage } from "./pages/patient/MyDoctorRequestsPage";
import { BookFromOrderPage } from "./pages/patient/BookFromOrderPage";
import { authService } from "./services/authService";

// ── Hash → page name ──────────────────────────────────────────────────────────
function hashToPage(hash) {
  if (!hash || hash === "#" || hash === "#/") return null;
  const map = { "#/admin":"admin-dashboard", "#admin":"admin-dashboard",
                "#/login":"login",  "#login":"login",
                "#/register":"register", "#register":"register" };
  if (map[hash]) return map[hash];
  let path = hash.startsWith("#/") ? hash.slice(2) : hash.slice(1);
  if (path.includes("?")) path = path.split("?")[0];
  return path ? path.replace(/\//g, "-") : null;
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(
    () => !!(localStorage.getItem("radiologyPatientName") || localStorage.getItem("authToken"))
  );
  const [adminLogged, setAdminLogged] = useState(
    () => localStorage.getItem("radiologyAdminLoggedIn") === "true"
  );
  const [page, setPage] = useState(() => {
    const hash = window.location.hash;
    console.log("[App Init] Hash:", hash);
    const p = hashToPage(hash);
    if (p) { console.log("[App Init] Converted hash path to page:", p); return p; }
    if (localStorage.getItem("radiologyAdminLoggedIn") === "true") return "admin-dashboard";
    if (localStorage.getItem("radiologyPatientName") || localStorage.getItem("authToken")) return "home";
    return "login";
  });

  const [showSendModal,   setShowSendModal]  = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showBooking,     setShowBooking]     = useState(false);
  const [successModal,    setSuccessModal]    = useState({ isOpen:false, message:"", redirectTo:"home" });

  const scrollProgress = useGlobalUiMotion(page, showSendModal);

  // ── Storage sync (multi-tab) ──────────────────────────────────────────────
  useEffect(() => {
    const handle = (e) => {
      if (e.key === "radiologyAdminLoggedIn") {
        const isAdmin = e.newValue === "true";
        setAdminLogged(isAdmin);
        if (!isAdmin && page.startsWith("admin")) setPage("login");
      }
      if (e.key === "radiologyPatientName" || e.key === "authToken") {
        const ok = !!(localStorage.getItem("radiologyPatientName") || localStorage.getItem("authToken"));
        setLoggedIn(ok);
        if (!ok && !page.startsWith("admin") && page !== "login" && page !== "register") setPage("login");
      }
    };
    window.addEventListener("storage", handle);
    return () => window.removeEventListener("storage", handle);
  }, [page]);

  // ── Hash listener ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handle = () => {
      const hash = window.location.hash;
      console.log("[Hash Change] New hash:", hash);
      if (hash === "#/" || hash === "#") { setPage("home"); return; }
      const p = hashToPage(hash);
      if (p) { console.log("[Hash Change] Converted to page:", p); setPage(p); }
    };
    window.addEventListener("hashchange", handle);
    return () => window.removeEventListener("hashchange", handle);
  }, []);

  // ── Navigation ────────────────────────────────────────────────────────────
  const goPage = (p, updateHash = true) => {
    setPage(p);
    window.scrollTo({ top:0, behavior:"smooth" });
    if (updateHash) {
      const hashMap = {
        "admin-dashboard":"admin", "login":"login",
        "register":"register",    "home":"/"
      };
      window.location.hash = hashMap[p] || p.replace(/-/g, "/");
    }
    setAdminLogged(
      localStorage.getItem("radiologyAdminLoggedIn") === "true" || String(p).startsWith("admin")
    );
  };

  const showSuccess = (message, redirectTo = "home") => {
    setSuccessModal({ isOpen:true, message, redirectTo });
    setTimeout(() => {
      setSuccessModal(prev => ({ ...prev, isOpen:false }));
      goPage(redirectTo);
    }, 2200);
  };

  const handleLogin = (userData) => {
    if (userData?.name) {
      localStorage.setItem("radiologyPatientName", userData.name);
      // Ensure RAD- ID exists — never store Firebase UID
      const existing = localStorage.getItem("radiologyPatientId") || "";
      if (!existing.startsWith("RAD-")) {
        const id = `RAD-${Math.floor(1000 + Math.random() * 9000)}`;
        localStorage.setItem("radiologyPatientId", id);
      }
      if (userData.email) {
        localStorage.setItem("radiologyPatientEmail", userData.email);
        localStorage.setItem("userEmail", userData.email);
      }
    }
    setLoggedIn(true);
    if (userData?.redirectTo !== "admin") goPage("home");
  };

  const handleLogout = () => {
    authService.logout();
    setLoggedIn(false);
    setAdminLogged(false);
    goPage("login");
  };

  const handleSelectService = (service) => {
    setSelectedService(service);
    setShowBooking(true);
    goPage("booking", false);
  };
  const handleBackToServices = () => {
    setShowBooking(false);
    setSelectedService(null);
    goPage("services", false);
  };

  const contentPages = useMemo(() => new Set([
    "home","services","doctors","booking","results","report","contact",
    "admin-dashboard","admin-requests","admin-upload","admin-investigations",
    "patient-book-appointment","patient-results","patient-notifications",
    "patient-appointments","profile","settings",
  ]), []);

  const hideFooterPages = useMemo(() => new Set([
    "register","login","confirm","admin-dashboard","admin-requests",
    "admin-upload","admin-investigations","profile",
  ]), []);

  const pageMap = {
    home:     <HomePage setPage={goPage}/>,
    services: <ServicesPage setPage={goPage} onSelectService={handleSelectService}/>,
    doctors:  <DoctorsPage setPage={goPage}/>,
    booking: showBooking && selectedService
      ? <BookingPage selectedService={selectedService} onBack={handleBackToServices} setPage={goPage}/>
      : <BookingPage setPage={goPage}/>,
    confirm:  <ConfirmPage setPage={goPage}/>,
    results:  <ResultsPage setPage={goPage} setShowSendModal={setShowSendModal}/>,
    report:   <ReportPage  setPage={goPage} setShowSendModal={setShowSendModal}/>,
    register: <RegisterPage setPage={goPage} onLogin={handleLogin} showSuccess={showSuccess}/>,
    login:    <LoginPage    setPage={goPage} onLogin={handleLogin} showSuccess={showSuccess}/>,
    "admin-dashboard":      <AdminDashboard             setPage={goPage}/>,
    "admin-requests":       <AppointmentRequestsPage    setPage={goPage}/>,
    "admin-upload":         <UploadRadiologyResultsPage setPage={goPage}/>,
    "admin-investigations": <InvestigationManagementPage setPage={goPage}/>,
    "patient-book-appointment": <BookAppointmentPage setPage={goPage}/>,
    "patient-appointments":     <AppointmentHistoryPage setPage={goPage}/>,
    "patient-results":          <RadiologyResultsPage   setPage={goPage}/>,
    "patient-notifications":    <NotificationsPage      setPage={goPage}/>,
    settings: <SettingsPage  setPage={goPage}/>,
    profile:  <ProfilePage   setPage={goPage} onLogout={handleLogout}/>,
    contact:  <ContactPage   setPage={goPage}/>,
  };

  return (
    <div className="app-container">
      <div className="scroll-progress" style={{
        width:`${scrollProgress}%`, position:"fixed", top:0, left:0,
        height:"3px", backgroundColor:"var(--primary,#2563eb)",
        zIndex:1000, transition:"width 0.1s ease-out",
      }}/>

      {adminLogged
        ? <AdminNavbar setPage={goPage} setAdminLogged={setAdminLogged}/>
        : <Navbar page={page} setPage={goPage} loggedIn={loggedIn} onLogout={handleLogout}/>
      }

      <main style={{ paddingTop: contentPages.has(page) ? 72 : 0 }}>
        <div key={page} className="page-transition-wrap">
          {pageMap[page] ?? pageMap.home}
        </div>
      </main>

      {!hideFooterPages.has(page) && <Footer setPage={goPage}/>}
      {showSendModal && <SendModal onClose={() => setShowSendModal(false)}/>}
      <SuccessModal
        isOpen={successModal.isOpen}
        message={successModal.message}
        onClose={() => setSuccessModal(prev => ({ ...prev, isOpen:false }))}
      />
    </div>
  );
}