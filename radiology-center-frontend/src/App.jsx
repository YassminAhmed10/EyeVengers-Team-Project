import { useMemo, useState } from "react";
import "./App.css";
import Footer from "./components/Radiology/Footer";
import Navbar from "./components/Radiology/Navbar";
import SendModal from "./components/Radiology/SendModal";
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
  const [loggedIn, setLoggedIn] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const scrollProgress = useGlobalUiMotion(page, showSendModal);

  const goPage = (p) => {
    setPage(p);
    window.scrollTo({ top: 0 });
  };

  const contentPages = useMemo(() => new Set(["home", "services", "doctors", "booking", "results", "report", "contact"]), []);
  const hideFooterPages = useMemo(() => new Set(["register", "login", "confirm"]), []);

  const pageMap = {
    home: <HomePage setPage={goPage} />,
    services: <ServicesPage setPage={goPage} />,
    doctors: <DoctorsPage setPage={goPage} />,
    booking: <BookingPage setPage={goPage} />,
    confirm: <ConfirmPage setPage={goPage} />,
    results: <ResultsPage setPage={goPage} setShowSendModal={setShowSendModal} />,
    report: <ReportPage setPage={goPage} setShowSendModal={setShowSendModal} />,
    register: <RegisterPage setPage={goPage} onLogin={() => setLoggedIn(true)} />,
    login: <LoginPage setPage={goPage} onLogin={() => setLoggedIn(true)} />,
    profile: <ProfilePage setPage={goPage} />,
    contact: <ContactPage />,
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
    </>
  );
}