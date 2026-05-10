import { useMemo, useState } from "react";
import { Routes, Route } from "react-router-dom";
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
import NotificationsPage from "./pages/Radiology/NotificationsPage";
import { MyDoctorRequestsPage } from "./pages/patient/MyDoctorRequestsPage";
import { BookFromOrderPage } from "./pages/patient/BookFromOrderPage";

export default function App() {
  // ===== STATE DECLARATIONS (all useState hooks first) =====
  const [loggedIn, setLoggedIn] = useState(
    () => !!localStorage.getItem("radiologyPatientName")
  );
  const [adminLogged, setAdminLogged] = useState(() => localStorage.getItem("radiologyAdminLoggedIn") === "true");
  const [page, setPage] = useState(() => (adminLogged ? "admin-dashboard" : (loggedIn ? "home" : "login")));
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showBooking, setShowBooking] = useState(false);

  // Global success modal state
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    message: "",
    redirectTo: "home",
  });

  // ===== CUSTOM HOOKS =====
  const scrollProgress = useGlobalUiMotion(page, showSendModal);

  // ===== FUNCTIONS =====
  const goPage = (p) => {
    setPage(p);
    window.scrollTo({ top: 0 });
    // Keep adminLogged in sync when navigating to admin pages or on storage changes
    const isAdmin = localStorage.getItem("radiologyAdminLoggedIn") === "true" || String(p || "").startsWith("admin");
    setAdminLogged(!!isAdmin);
  };

  // Show success modal then redirect after 2 seconds
  const showSuccess = (message, redirectTo = "home") => {
    setSuccessModal({ isOpen: true, message, redirectTo });
    setTimeout(() => {
      setSuccessModal(prev => ({ ...prev, isOpen: false }));
      goPage(redirectTo);
    }, 2200);
  };

  const handleLogin = (userData) => {
    if (userData && userData.name) {
      localStorage.setItem("radiologyPatientName", userData.name);
      localStorage.setItem("radiologyPatientId", userData.id || "");
      localStorage.setItem("radiologyPatientEmail", userData.email || "");
    }
    setLoggedIn(true);
  };

  const handleSelectService = (service) => {
    setSelectedService(service);
    setShowBooking(true);
    setPage("booking");
  };

  const handleBackToServices = () => {
    setShowBooking(false);
    setSelectedService(null);
    setPage("services");
  };

  // ===== MEMOIZED VALUES =====
  const contentPages = useMemo(() => new Set(["home", "services", "doctors", "booking", "results", "report", "contact", "admin-dashboard", "admin-requests", "admin-upload", "admin-investigations", "patient-book-appointment", "patient-results", "patient-notifications"]), []);
  const hideFooterPages = useMemo(() => new Set(["register", "login", "confirm", "admin-dashboard", "admin-requests", "admin-upload", "admin-investigations"]), []);

  // ===== PAGE MAP =====
  const pageMap = {
    home: <HomePage setPage={goPage} />,
    services: <ServicesPage setPage={goPage} onSelectService={handleSelectService} />,
    doctors: <DoctorsPage setPage={goPage} />,
    booking: showBooking && selectedService ? (
      <BookingPage 
        selectedService={selectedService}
        onBack={handleBackToServices}
      />
    ) : (
      <BookingPage setPage={goPage} />
    ),
    confirm: <ConfirmPage setPage={goPage} />,
    results: <ResultsPage setPage={goPage} setShowSendModal={setShowSendModal} />,
    report: <ReportPage setPage={goPage} setShowSendModal={setShowSendModal} />,
    register: <RegisterPage setPage={goPage} onLogin={handleLogin} showSuccess={showSuccess} />,
    login: <LoginPage setPage={goPage} onLogin={handleLogin} showSuccess={showSuccess} />,
    "admin-dashboard": <AdminDashboard setPage={goPage} />,
    "admin-requests": <AppointmentRequestsPage setPage={goPage} />,
    "admin-upload": <UploadRadiologyResultsPage setPage={goPage} />,
    "admin-investigations": <InvestigationManagementPage setPage={goPage} />,
    "patient-book-appointment": <BookAppointmentPage setPage={goPage} />,
    "patient-results": <RadiologyResultsPage setPage={goPage} />,
    "patient-notifications": <NotificationsPage setPage={goPage} />,
    profile: <ProfilePage setPage={goPage} />,
    contact: <ContactPage />,
  };

  // ===== RENDER =====
  return (
    <>
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />
      {adminLogged ? (
        <AdminNavbar setPage={goPage} setAdminLogged={setAdminLogged} />
      ) : (
        <Navbar page={page} setPage={goPage} loggedIn={loggedIn} />
      )}
      <main style={{ paddingTop: contentPages.has(page) ? 72 : 0 }}>
        <div key={page} className="page-transition-wrap">
          {pageMap[page] ?? pageMap.home}
        </div>
      </main>
      {!hideFooterPages.has(page) && <Footer setPage={goPage} />}
      {showSendModal && <SendModal onClose={() => setShowSendModal(false)} />}

      {/* Global SuccessModal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        message={successModal.message}
        onClose={() => setSuccessModal(prev => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}