import { motion } from "framer-motion";
import { FaTachometerAlt, FaUsers, FaCalendarCheck, FaFileAlt, FaSignOutAlt } from "react-icons/fa";
import logoSrc from "../../assets/logo.png";

export default function AdminNavbar({ setPage, setAdminLogged }) {
  const adminEmail = localStorage.getItem("radiologyAdminEmail") || "";

  const handleLogout = () => {
    ["radiologyAdminEmail", "radiologyAdminRole", "radiologyAdminLoggedIn"].forEach(k => localStorage.removeItem(k));
    setAdminLogged(false);
    setPage("home");
  };

  const links = [
    { id: "admin-dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { id: "admin-requests", label: "Requests", icon: <FaCalendarCheck /> },
    { id: "admin-investigations", label: "Investigations", icon: <FaUsers /> },
    { id: "admin-upload", label: "Upload Results", icon: <FaFileAlt /> },
  ];

  return (
    <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 999, height: 72, background: "#ffffff", display: "flex", alignItems: "center", padding: "0 20px", color: "#0070b8", boxShadow: "0 2px 12px rgba(0,112,184,0.08)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => setPage("admin-dashboard")}>
        <img src={logoSrc} alt="logo" style={{ width: 44, height: 44, objectFit: "contain", background: "#e8f1ff", borderRadius: 8, padding: 6 }} />
        <div style={{ fontWeight: 800, fontSize: 16, color: "#0070b8" }}>Radiology Admin</div>
      </div>

      <nav style={{ marginLeft: 32, display: "flex", gap: 4, alignItems: "center", flex: 1 }}>
        {links.map(l => (
          <motion.button key={l.id} onClick={() => setPage(l.id)} whileHover={{ background: "rgba(0,112,184,0.06)" }} whileTap={{ scale: 0.96 }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 8, border: "none", background: "transparent", color: "#0070b8", cursor: "pointer", fontWeight: 600, fontSize: 14, transition: "all 0.2s" }}>
            <span style={{ opacity: 0.8 }}>{l.icon}</span>
            <span>{l.label}</span>
          </motion.button>
        ))}
      </nav>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ padding: "8px 14px", borderRadius: 8, background: "#e8f1ff", fontWeight: 600, color: "#0070b8", fontSize: 13 }}>{adminEmail}</div>
        <motion.button onClick={handleLogout} whileHover={{ background: "#fee2e2" }} style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#fef2f2", color: "#dc2626", cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }}>
          <FaSignOutAlt size={14} /> Logout
        </motion.button>
      </div>
    </header>
  );
}
