import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaClipboardList, FaHourglassHalf, FaCheckCircle, FaUsers } from "react-icons/fa";

export default function AdminDashboard({ setPage }) {
  const [adminEmail, setAdminEmail] = useState(localStorage.getItem("radiologyAdminEmail") || "");

  useEffect(() => {
    const logged = localStorage.getItem("radiologyAdminLoggedIn") === "true";
    if (!logged) setPage("login");
  }, [setPage]);

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: "#0070b8" }}>Admin Dashboard</h1>
            <p style={{ margin: "8px 0 0", color: "#6b7280", fontSize: 14 }}>Manage radiology center operations</p>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ padding: "10px 16px", borderRadius: 8, background: "#e8f1ff", fontWeight: 600, color: "#0070b8" }}>{adminEmail}</div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.1 }}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 40 }}
        >
          {[
            { label: "Pending Requests", icon: FaClipboardList, color: "#f59e0b" },
            { label: "In Progress", icon: FaHourglassHalf, color: "#3b82f6" },
            { label: "Completed Today", icon: FaCheckCircle, color: "#10b981" },
            { label: "Total Patients", icon: FaUsers, color: "#8b5cf6" }
          ].map((stat, idx) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
                whileHover={{ y: -4 }}
                style={{ background: "white", padding: 24, borderRadius: 12, border: "1px solid rgba(0,112,184,0.1)", boxShadow: "0 2px 8px rgba(0,112,184,0.04)", cursor: "pointer", transition: "all 0.3s" }}
              >
                <div style={{ fontSize: 32, marginBottom: 12, color: stat.color }}>
                  <IconComponent />
                </div>
                <p style={{ margin: 0, fontSize: 12, color: "#6b7280", fontWeight: 500 }}>{stat.label}</p>
                <p style={{ margin: "8px 0 0", fontSize: 24, fontWeight: 800, color: stat.color }}>—</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.3 }}
          style={{ background: "white", padding: 32, borderRadius: 14, border: "1px solid rgba(0,112,184,0.1)", boxShadow: "0 2px 12px rgba(0,112,184,0.06)" }}
        >
          <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 700, color: "#0070b8" }}>Getting Started</h2>
          <p style={{ margin: 0, color: "#6b7280", lineHeight: 1.6 }}>Welcome to the Radiology Admin Center. Use the navigation menu above to:</p>
          <ul style={{ margin: "16px 0 0", paddingLeft: 20, color: "#6b7280", lineHeight: 1.8 }}>
            <li><strong style={{ color: "#0070b8" }}>Requests</strong> — Review and accept/reject appointment requests</li>
            <li><strong style={{ color: "#0070b8" }}>Investigations</strong> — Monitor investigation status and progress</li>
            <li><strong style={{ color: "#0070b8" }}>Upload Results</strong> — Upload images and reports for completed investigations</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
