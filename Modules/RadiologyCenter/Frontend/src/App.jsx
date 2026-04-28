import { useMemo, useState } from "react";
import "./App.css";
import Footer from "./components/Radiology/Footer";
import Navbar from "./components/Radiology/Navbar";
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

export default function App() {
  const [page, setPage] = useState("home");
  const [loggedIn, setLoggedIn] = useState(
    () => !!localStorage.getItem("radiologyPatientName")
  );
  const [showSendModal, setShowSendModal] = useState(false);

  // Global success modal state — controlled at App level so it's always centered
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    message: "",
    redirectTo: "home",
  });

  const scrollProgress = useGlobalUiMotion(page, showSendModal);

  const goPage = (p) => {
    setPage(p);
    window.scrollTo({ top: 0 });
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

  const contentPages   = useMemo(() => new Set(["home","services","doctors","booking","results","report","contact"]), []);
  const hideFooterPages = useMemo(() => new Set(["register","login","confirm"]), []);

  const pageMap = {
    home:     <HomePage     setPage={goPage} />,
    services: <ServicesPage setPage={goPage} />,
    doctors:  <DoctorsPage  setPage={goPage} />,
    booking:  <BookingPage  setPage={goPage} />,
    confirm:  <ConfirmPage  setPage={goPage} />,
    results:  <ResultsPage  setPage={goPage} setShowSendModal={setShowSendModal} />,
    report:   <ReportPage   setPage={goPage} setShowSendModal={setShowSendModal} />,
    register: <RegisterPage setPage={goPage} onLogin={handleLogin} showSuccess={showSuccess} />,
    login:    <LoginPage    setPage={goPage} onLogin={handleLogin} showSuccess={showSuccess} />,
    profile:  <ProfilePage  setPage={goPage} />,
    contact:  <ContactPage />,
  };

  return (
    <>
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />
      <Navbar page={page} setPage={goPage} loggedIn={loggedIn} />
      <main style={{ paddingTop: contentPages.has(page) ? 72 : 0 }}>
        <div key={page} className="page-transition-wrap">
          {pageMap[page] ?? pageMap.home}
        </div>
      </main>
      {!hideFooterPages.has(page) && <Footer setPage={goPage} />}
      {showSendModal && <SendModal onClose={() => setShowSendModal(false)} />}

      {/* Global SuccessModal — at root level, always perfectly centered */}
      <SuccessModal
        isOpen={successModal.isOpen}
        message={successModal.message}
        onClose={() => setSuccessModal(prev => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}