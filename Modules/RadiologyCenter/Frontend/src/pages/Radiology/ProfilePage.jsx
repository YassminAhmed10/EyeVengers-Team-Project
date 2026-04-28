// src/pages/Radiology/ProfilePage.jsx
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaPhone, FaNotesMedical, FaSave, FaEdit, FaSignOutAlt, FaCalendarCheck, FaFileAlt, FaHistory, FaTimes, FaStethoscope, FaHeartbeat, FaAllergies } from "react-icons/fa";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

export default function ProfilePage({ setPage, onLogout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    chronicDiseases: "None",
    allergies: "None",
    patientId: ""
  });

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      
      const userId = localStorage.getItem("radiologyPatientId") || localStorage.getItem("userId");
      const firstName = localStorage.getItem("radiologyPatientFirstName") || localStorage.getItem("userFirstName") || "";
      const lastName = localStorage.getItem("radiologyPatientLastName") || localStorage.getItem("userLastName") || "";
      const email = localStorage.getItem("radiologyPatientEmail") || localStorage.getItem("userEmail") || "";
      const phoneFromStorage = localStorage.getItem("userPhone") || "";
      
      setUserData(prev => ({
        ...prev,
        firstName,
        lastName,
        email,
        phone: phoneFromStorage,
        patientId: userId || "RC-2024-4872"
      }));
      
      if (userId) {
        try {
          const userDocRef = doc(db, "users", userId);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(prev => ({
              ...prev,
              firstName: data.firstName || prev.firstName,
              lastName: data.lastName || prev.lastName,
              email: data.email || prev.email,
              phone: data.phone || prev.phone,
              chronicDiseases: data.chronicDiseases || "None",
              allergies: data.allergies || "None"
            }));
            
            if (data.phone) localStorage.setItem("userPhone", data.phone);
          }
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      }
      
      setLoading(false);
    };
    
    loadUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    localStorage.setItem("radiologyPatientFirstName", userData.firstName);
    localStorage.setItem("radiologyPatientLastName", userData.lastName);
    localStorage.setItem("userFirstName", userData.firstName);
    localStorage.setItem("userLastName", userData.lastName);
    localStorage.setItem("userEmail", userData.email);
    localStorage.setItem("radiologyPatientEmail", userData.email);
    localStorage.setItem("userPhone", userData.phone);
    
    const userId = localStorage.getItem("radiologyPatientId") || localStorage.getItem("userId");
    if (userId) {
      try {
        const userDocRef = doc(db, "users", userId);
        await setDoc(userDocRef, {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          chronicDiseases: userData.chronicDiseases,
          allergies: userData.allergies,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (error) {
        console.error("Error saving user data:", error);
      }
    }
    
    window.dispatchEvent(new Event("userDataUpdated"));
    setIsEditing(false);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      const keysToRemove = [
        "radiologyPatientName", "radiologyPatientFirstName", "radiologyPatientLastName",
        "radiologyPatientId", "radiologyPatientEmail", "token", "firebaseToken",
        "userRole", "userName", "userEmail", "userId", "userFirstName", "userLastName", "userPhone"
      ];
      keysToRemove.forEach(key => localStorage.removeItem(key));
      window.dispatchEvent(new Event("userDataUpdated"));
      setPage("home");
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const stats = [
    { number: "4", label: "Scans", icon: <FaFileAlt /> },
    { number: "2", label: "Appointments", icon: <FaCalendarCheck /> },
    { number: "3", label: "Reports", icon: <FaHistory /> }
  ];

  const fullName = `${userData.firstName} ${userData.lastName}`.trim() || "Guest User";
  const initials = userData.firstName && userData.lastName 
    ? (userData.firstName[0] + userData.lastName[0]).toUpperCase()
    : "U";

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f7fa",
        paddingTop: "80px"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 40,
            height: 40,
            border: "3px solid #e0e0e0",
            borderTopColor: "#1f6bff",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px"
          }} />
          <p style={{ color: "#6f86a3" }}>Loading profile...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ 
        minHeight: "100vh", 
        background: "#f5f7fa",
        paddingTop: "80px",
        paddingBottom: "60px"
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 32px" }}>
          {/* Header */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{ marginBottom: 40 }}
          >
            <span style={{ 
              fontSize: 12, 
              fontWeight: 600, 
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#1f6bff",
              display: "inline-block",
              marginBottom: 8
            }}>
              Patient Profile
            </span>
            <h1 style={{ 
              fontSize: 36, 
              fontWeight: 700, 
              color: "#1a1a2e",
              margin: 0
            }}>
              My Medical Profile
            </h1>
          </motion.div>

          {/* Full Width Layout */}
          <div style={{ display: "flex", gap: 32 }}>
            {/* Sidebar */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ delay: 0.1 }}
              style={{
                width: 320,
                flexShrink: 0,
                background: "white",
                borderRadius: 24,
                padding: "32px 24px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                textAlign: "center",
                height: "fit-content"
              }}
            >
              <div style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #1f6bff, #00b8a8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                fontSize: 36,
                fontWeight: 700,
                color: "white"
              }}>
                {initials}
              </div>

              <h2 style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#1a1a2e",
                marginBottom: 4
              }}>
                {fullName}
              </h2>

              <p style={{
                fontSize: 12,
                color: "#6f86a3",
                marginBottom: 16
              }}>
                ID: {userData.patientId}
              </p>

              <span style={{
                display: "inline-block",
                background: "rgba(0,184,168,0.1)",
                color: "#00b8a8",
                fontSize: 11,
                fontWeight: 600,
                padding: "4px 12px",
                borderRadius: 50,
                marginBottom: 24
              }}>
                Active
              </span>

              <div style={{ height: 1, background: "#eef2f6", margin: "20px 0" }} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {stats.map((stat, idx) => (
                  <div key={idx} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 18, color: "#1f6bff", marginBottom: 6 }}>{stat.icon}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#1a1a2e" }}>{stat.number}</div>
                    <div style={{ fontSize: 11, color: "#6f86a3" }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ height: 1, background: "#eef2f6", margin: "20px 0" }} />

              <button
                onClick={() => setPage("results")}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#f8fafc",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#1a1a2e",
                  cursor: "pointer",
                  marginBottom: 12,
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#1f6bff";
                  e.target.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#f8fafc";
                  e.target.style.color = "#1a1a2e";
                }}
              >
                <FaFileAlt size={14} />
                My Results
              </button>

              <button
                onClick={() => setPage("booking")}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#1f6bff",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "white",
                  cursor: "pointer",
                  marginBottom: 12,
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#00b8a8";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#1f6bff";
                }}
              >
                <FaCalendarCheck size={14} />
                New Booking
              </button>

              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "transparent",
                  border: "1px solid #ef4444",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#ef4444",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#ef4444";
                  e.target.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "transparent";
                  e.target.style.color = "#ef4444";
                }}
              >
                <FaSignOutAlt size={14} />
                Sign Out
              </button>
            </motion.div>

            {/* Main Content - Full Width */}
            <div style={{ flex: 1 }}>
              {/* Personal Information Card */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                transition={{ delay: 0.2 }}
                style={{
                  background: "white",
                  borderRadius: 24,
                  padding: "40px",
                  marginBottom: 32,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.06)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                  <h3 style={{ 
                    fontSize: 20, 
                    fontWeight: 700, 
                    color: "#1a1a2e", 
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 12
                  }}>
                    <FaUser size={20} color="#1f6bff" />
                    Personal Information
                  </h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 20px",
                      background: isEditing ? "#00b8a8" : "#f8fafc",
                      border: "none",
                      borderRadius: 12,
                      fontSize: 13,
                      fontWeight: 600,
                      color: isEditing ? "white" : "#6f86a3",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {isEditing ? <FaSave size={14} /> : <FaEdit size={14} />}
                    {isEditing ? "Save Changes" : "Edit Profile"}
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 28 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#6f86a3", marginBottom: 8 }}>First Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="firstName"
                        value={userData.firstName}
                        onChange={handleChange}
                        style={{
                          width: "100%",
                          padding: "14px 18px",
                          border: "1px solid #e2e8f0",
                          borderRadius: 12,
                          fontSize: 15,
                          background: "#fafbfc"
                        }}
                      />
                    ) : (
                      <p style={{ fontSize: 16, fontWeight: 500, color: "#1a1a2e", margin: 0, padding: "8px 0" }}>{userData.firstName || "—"}</p>
                    )}
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#6f86a3", marginBottom: 8 }}>Last Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="lastName"
                        value={userData.lastName}
                        onChange={handleChange}
                        style={{
                          width: "100%",
                          padding: "14px 18px",
                          border: "1px solid #e2e8f0",
                          borderRadius: 12,
                          fontSize: 15,
                          background: "#fafbfc"
                        }}
                      />
                    ) : (
                      <p style={{ fontSize: 16, fontWeight: 500, color: "#1a1a2e", margin: 0, padding: "8px 0" }}>{userData.lastName || "—"}</p>
                    )}
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#6f86a3", marginBottom: 8 }}>Email Address</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <FaEnvelope size={16} color="#6f86a3" />
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={userData.email}
                          onChange={handleChange}
                          style={{
                            flex: 1,
                            padding: "14px 18px",
                            border: "1px solid #e2e8f0",
                            borderRadius: 12,
                            fontSize: 15,
                            background: "#fafbfc"
                          }}
                        />
                      ) : (
                        <p style={{ fontSize: 16, fontWeight: 500, color: "#1a1a2e", margin: 0, padding: "8px 0" }}>{userData.email || "—"}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#6f86a3", marginBottom: 8 }}>Phone Number</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <FaPhone size={16} color="#6f86a3" />
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={userData.phone}
                          onChange={handleChange}
                          style={{
                            flex: 1,
                            padding: "14px 18px",
                            border: "1px solid #e2e8f0",
                            borderRadius: 12,
                            fontSize: 15,
                            background: "#fafbfc"
                          }}
                          placeholder="+20 123 456 7890"
                        />
                      ) : (
                        <p style={{ fontSize: 16, fontWeight: 500, color: "#1a1a2e", margin: 0, padding: "8px 0" }}>{userData.phone || "—"}</p>
                      )}
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div style={{ marginTop: 32, display: "flex", gap: 16, justifyContent: "flex-end" }}>
                    <button
                      onClick={() => setIsEditing(false)}
                      style={{
                        padding: "12px 28px",
                        background: "#f8fafc",
                        border: "none",
                        borderRadius: 12,
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#6f86a3",
                        cursor: "pointer"
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      style={{
                        padding: "12px 32px",
                        background: "linear-gradient(135deg, #1f6bff, #00b8a8)",
                        border: "none",
                        borderRadius: 12,
                        fontSize: 14,
                        fontWeight: 600,
                        color: "white",
                        cursor: "pointer"
                      }}
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </motion.div>

              {/* Medical Record Card - Image as Button */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                transition={{ delay: 0.3 }}
                style={{
                  background: "white",
                  borderRadius: 24,
                  padding: "40px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                  textAlign: "center"
                }}
              >
                <h3 style={{ 
                  fontSize: 20, 
                  fontWeight: 700, 
                  color: "#1a1a2e", 
                  marginBottom: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12
                }}>
                  <FaNotesMedical size={20} color="#1f6bff" />
                  Medical Record
                </h3>

                {/* Clickable Image Button */}
                <motion.button
                  onClick={() => setShowMedicalModal(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    display: "block",
                    margin: "0 auto",
                    width: "fit-content"
                  }}
                >
                  <img 
                    src="/src/assets/emr.png" 
                    alt="Medical Record" 
                    style={{
                      width: 280,
                      height: "auto",
                      display: "block",
                      margin: "0 auto",
                      opacity: 0.85,
                      transition: "opacity 0.3s ease"
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = "1"}
                    onMouseLeave={(e) => e.target.style.opacity = "0.85"}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/280x200?text=EMR";
                    }}
                  />
                  <p style={{
                    fontSize: 14,
                    color: "#1f6bff",
                    marginTop: 20,
                    marginBottom: 0,
                    fontWeight: 500
                  }}>
                    Click to view your medical record
                  </p>
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Medical Record Modal */}
      <AnimatePresence>
        {showMedicalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "20px"
            }}
            onClick={() => setShowMedicalModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{
                background: "white",
                borderRadius: 32,
                maxWidth: 600,
                width: "100%",
                overflow: "hidden",
                boxShadow: "0 25px 50px rgba(0,0,0,0.3)"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{
                padding: "24px 32px",
                background: "linear-gradient(135deg, #1f6bff, #00b8a8)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <FaStethoscope size={24} color="white" />
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: "white", margin: 0 }}>
                    Medical Record
                  </h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowMedicalModal(false)}
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    border: "none",
                    borderRadius: "50%",
                    width: 36,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "white"
                  }}
                >
                  <FaTimes size={18} />
                </motion.button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: "32px" }}>
                {/* Patient Info Summary */}
                <div style={{
                  background: "#f8fafc",
                  borderRadius: 20,
                  padding: "20px",
                  marginBottom: 28
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #1f6bff, #00b8a8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      fontWeight: 700,
                      color: "white"
                    }}>
                      {initials}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>{fullName}</h3>
                      <p style={{ fontSize: 12, color: "#6f86a3", margin: "4px 0 0" }}>Patient ID: {userData.patientId}</p>
                    </div>
                  </div>
                </div>

                {/* Chronic Diseases Section */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <FaHeartbeat size={20} color="#1f6bff" />
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>
                      Chronic Diseases
                    </h3>
                  </div>
                  <div style={{
                    background: "#f8fafc",
                    borderRadius: 16,
                    padding: "16px 20px",
                    border: "1px solid #eef2f6"
                  }}>
                    <p style={{ fontSize: 15, color: "#1a1a2e", margin: 0, lineHeight: 1.6 }}>
                      {userData.chronicDiseases || "None"}
                    </p>
                  </div>
                </div>

                {/* Allergies Section */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <FaAllergies size={20} color="#1f6bff" />
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>
                      Allergies
                    </h3>
                  </div>
                  <div style={{
                    background: "#f8fafc",
                    borderRadius: 16,
                    padding: "16px 20px",
                    border: "1px solid #eef2f6"
                  }}>
                    <p style={{ fontSize: 15, color: "#1a1a2e", margin: 0, lineHeight: 1.6 }}>
                      {userData.allergies || "None"}
                    </p>
                  </div>
                </div>

                {/* Last Updated */}
                <div style={{
                  paddingTop: 20,
                  borderTop: "1px solid #eef2f6",
                  textAlign: "center"
                }}>
                  <p style={{ fontSize: 11, color: "#6f86a3", margin: 0 }}>
                    Last updated: {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: "20px 32px",
                background: "#f8fafc",
                display: "flex",
                justifyContent: "flex-end",
                borderTop: "1px solid #eef2f6"
              }}>
                <button
                  onClick={() => setShowMedicalModal(false)}
                  style={{
                    padding: "10px 24px",
                    background: "#1f6bff",
                    border: "none",
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "white",
                    cursor: "pointer"
                  }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}