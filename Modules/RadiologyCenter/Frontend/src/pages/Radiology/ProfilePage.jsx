// src/pages/Radiology/ProfilePage.jsx
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  FaUser, FaEnvelope, FaPhone, FaNotesMedical, FaSave, FaEdit,
  FaSignOutAlt, FaCalendarCheck, FaFileAlt, FaHistory, FaTimes,
  FaStethoscope, FaHeartbeat, FaAllergies, FaBirthdayCake, FaIdCard
} from "react-icons/fa";
// ✅ FHIR Integration - Replacing Firebase
import { fhirIntegrationService } from "../../services/fhirIntegrationService";
import { fhirSegmentLogger } from "../../services/fhirSegmentLogger";
import { patientStatsService } from "../../services/patientStatsService";

// ── FHIR Patient Mapper ───────────────────────────────────────────────────────
const mapFhirPatient = (fhirPatient) => {
  if (!fhirPatient) return null;
  const name = fhirPatient.name?.[0] || {};
  const firstName = name.given?.[0] || "";
  const lastName = name.family || "";
  const phone = fhirPatient.telecom?.find(t => t.system === "phone")?.value || "";
  const email = fhirPatient.telecom?.find(t => t.system === "email")?.value || "";
  const birthDate = fhirPatient.birthDate || "";
  const gender = fhirPatient.gender || "";
  const address = fhirPatient.address?.[0]?.text || "";
  return { firstName, lastName, phone, email, birthDate, gender, address };
};

// ── Load patient data from localStorage (all possible keys) ──────────────────
const loadFromStorage = () => {
  // Try URL params first (passed from EyeClinic redirect)
  const urlParams = new URLSearchParams(window.location.search);
  const urlName = urlParams.get("patientName") || "";
  const urlEmail = urlParams.get("patientEmail") || "";
  const urlPhone = urlParams.get("patientPhone") || "";
  const urlDob = urlParams.get("patientDateOfBirth") || "";

  // Parse name from URL
  const urlNameParts = urlName.trim().split(" ");
  const urlFirstName = urlNameParts[0] || "";
  const urlLastName = urlNameParts.slice(1).join(" ") || "";

  // localStorage keys (priority order)
  const patientName = localStorage.getItem("patientName") || "";
  const nameParts = patientName.trim().split(" ");

  return {
    firstName:
      urlFirstName ||
      localStorage.getItem("radiologyPatientFirstName") ||
      localStorage.getItem("userFirstName") ||
      nameParts[0] || "",
    lastName:
      urlLastName ||
      localStorage.getItem("radiologyPatientLastName") ||
      localStorage.getItem("userLastName") ||
      nameParts.slice(1).join(" ") || "",
    email:
      urlEmail ||
      localStorage.getItem("radiologyPatientEmail") ||
      localStorage.getItem("patientEmail") ||
      localStorage.getItem("userEmail") || "",
    phone:
      urlPhone ||
      localStorage.getItem("radiologyPatientPhone") ||
      localStorage.getItem("patientPhone") ||
      localStorage.getItem("userPhone") || "",
    birthDate:
      urlDob ||
      localStorage.getItem("patientDateOfBirth") || "",
    patientId:
      localStorage.getItem("radiologyPatientId") ||
      localStorage.getItem("patientId") ||
      localStorage.getItem("userId") || "",
    patientIdentifier:
      localStorage.getItem("radiologyPatientIdentifier") || "",
  };
};

export default function ProfilePage({ setPage, onLogout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fhirLoading, setFhirLoading] = useState(false);
  const [fhirData, setFhirData] = useState(null);
  const [patientStats, setPatientStats] = useState({
    scansCount: 0,
    appointmentsCount: 0,
    reportsCount: 0,
  });

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    chronicDiseases: "None",
    allergies: "None",
    patientId: "",
    patientIdentifier: "",
    gender: "",
    address: "",
  });

  // ── Load data on mount ──────────────────────────────────────────────────────
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);

      // 1. Load from localStorage / URL params
      const stored = loadFromStorage();
      setUserData(prev => ({ ...prev, ...stored }));

      // 2. Load from Eye Clinic via FHIR/HL7 (replaces Firebase)
      console.log('\n\x1b[33m╔════════════════════════════════════════════════════════════════╗\x1b[0m');
      console.log('\x1b[33m║ CLINIC → RADIOLOGY SYSTEM INTEGRATION                          ║\x1b[0m');
      console.log('\x1b[33m║ Using: FHIR/HL7 Healthcare Interoperability Standard            ║\x1b[0m');
      console.log('\x1b[33m║ Replacing: Firebase (deprecated for healthcare systems)        ║\x1b[0m');
      console.log('\x1b[33m╚════════════════════════════════════════════════════════════════╝\x1b[0m\n');
      
      await loadFhirData(stored.email);

      // 3. Load patient statistics from database
      if (stored.patientId) {
        await loadPatientStats(stored.patientId);
      }

      setLoading(false);
    };

    loadUserData();
  }, []);

  // ── Load FHIR Patient data from Eye Clinic via FHIR/HL7 ──────────────────
  const loadFhirData = async (email) => {
    if (!email) return;
    setFhirLoading(true);
    try {
      console.log('\n\x1b[36m[RADIOLOGY] Fetching patient from Eye Clinic via FHIR...\x1b[0m\n');
      
      // Fetch patient from clinic via FHIR
      const patient = await fhirIntegrationService.getPatientFromClinic(email);
      
      if (patient) {
        const parsedPatient = fhirIntegrationService.parseFhirPatient(patient);
        
        setUserData(prev => ({
          ...prev,
          ...parsedPatient,
        }));

        // Store for future use
        localStorage.setItem("radiologyPatientFirstName", parsedPatient.firstName);
        localStorage.setItem("radiologyPatientLastName", parsedPatient.lastName);
        localStorage.setItem("radiologyPatientEmail", parsedPatient.email);
        localStorage.setItem("radiologyPatientPhone", parsedPatient.phone);
        localStorage.setItem("radiologyPatientId", parsedPatient.resourceId);

        setFhirData({ 
          source: "FHIR/HL7 - Eye Clinic", 
          patientId: parsedPatient.resourceId,
          timestamp: new Date().toISOString()
        });
        
        // Fetch appointments and observations
        await Promise.all([
          fhirIntegrationService.getAppointmentsFromClinic(parsedPatient.resourceId),
          fhirIntegrationService.getObservationsFromClinic(parsedPatient.resourceId)
        ]);
      }
    } catch (error) {
      console.error("FHIR load error:", error);
      fhirSegmentLogger.logConnection('Eye Clinic', 'Radiology Center', 'ERROR');
    } finally {
      setFhirLoading(false);
    }
  };

  // ── Load patient statistics from database ────────────────────────────────
  const loadPatientStats = async (patientId) => {
    try {
      if (!patientId) return;
      
      const statsData = await patientStatsService.getStats(patientId);
      if (statsData) {
        setPatientStats({
          scansCount: statsData.scansCount || 0,
          appointmentsCount: statsData.appointmentsCount || 0,
          reportsCount: statsData.reportsCount || 0,
        });
        
        // Also save to localStorage for offline use
        patientStatsService.saveToLocalStorage(patientId, statsData);
      }
    } catch (error) {
      console.error("Error loading patient stats:", error);
      // Fallback to localStorage if API fails
      const localStats = patientStatsService.loadFromLocalStorage(patientId);
      if (localStats) {
        setPatientStats(localStats);
      }
    }
  };

  // ── Increment stats functions ───────────────────────────────────────────
  const incrementScans = async () => {
    const patientId = userData.patientId || localStorage.getItem("radiologyPatientId");
    if (!patientId) return;
    
    const result = await patientStatsService.incrementScans(patientId);
    if (result) {
      setPatientStats({
        ...patientStats,
        scansCount: result.scansCount,
      });
    }
  };

  const incrementAppointments = async () => {
    const patientId = userData.patientId || localStorage.getItem("radiologyPatientId");
    if (!patientId) return;
    
    const result = await patientStatsService.incrementAppointments(patientId);
    if (result) {
      setStats({
        ...stats,
        appointmentsCount: result.appointmentsCount,
      });
    }
  };

  const incrementReports = async () => {
    const patientId = userData.patientId || localStorage.getItem("radiologyPatientId");
    if (!patientId) return;
    
    const result = await patientStatsService.incrementReports(patientId);
    if (result) {
      setStats({
        ...stats,
        reportsCount: result.reportsCount,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    // Save to localStorage
    localStorage.setItem("radiologyPatientFirstName", userData.firstName);
    localStorage.setItem("radiologyPatientLastName", userData.lastName);
    localStorage.setItem("userFirstName", userData.firstName);
    localStorage.setItem("userLastName", userData.lastName);
    localStorage.setItem("userEmail", userData.email);
    localStorage.setItem("radiologyPatientEmail", userData.email);
    localStorage.setItem("userPhone", userData.phone);
    localStorage.setItem("radiologyPatientPhone", userData.phone);
    localStorage.setItem("radiologyPatientGender", userData.gender);
    if (userData.birthDate) {
      localStorage.setItem("patientDateOfBirth", userData.birthDate);
    }
    if (userData.patientIdentifier) {
      localStorage.setItem("radiologyPatientIdentifier", userData.patientIdentifier);
    }

    // Save to Firebase
    const userId = userData.patientId || localStorage.getItem("radiologyPatientId");
    if (userId) {
      try {
        const userDocRef = doc(db, "users", userId);
        await setDoc(userDocRef, {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          gender: userData.gender,
          birthDate: userData.birthDate,
          chronicDiseases: userData.chronicDiseases,
          allergies: userData.allergies,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (error) {
        console.error("Firebase save error:", error);
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
        "userRole", "userName", "userEmail", "userId", "userFirstName",
        "userLastName", "userPhone", "patientName", "patientEmail",
        "patientPhone", "patientDateOfBirth", "radiologyPatientPhone"
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
    { number: patientStats.scansCount.toString(), label: "Scans", icon: <FaFileAlt /> },
    { number: patientStats.appointmentsCount.toString(), label: "Appointments", icon: <FaCalendarCheck /> },
    { number: patientStats.reportsCount.toString(), label: "Reports", icon: <FaHistory /> }
  ];

  const fullName = `${userData.firstName} ${userData.lastName}`.trim() || "Guest User";
  const initials = userData.firstName && userData.lastName
    ? (userData.firstName[0] + userData.lastName[0]).toUpperCase()
    : userData.firstName ? userData.firstName[0].toUpperCase() : "U";

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "2-digit", month: "long", year: "numeric"
      });
    } catch { return dateStr; }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#f5f7fa", paddingTop: "80px"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 40, height: 40, border: "3px solid #e0e0e0",
            borderTopColor: "#1f6bff", borderRadius: "50%",
            animation: "spin 0.8s linear infinite", margin: "0 auto 16px"
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
        minHeight: "100vh", background: "#f5f7fa",
        paddingTop: "80px", paddingBottom: "60px"
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 32px" }}>

          {/* Header */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ marginBottom: 40 }}>
            <span style={{
              fontSize: 12, fontWeight: 600, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "#1f6bff",
              display: "inline-block", marginBottom: 8
            }}>
              Patient Profile
            </span>
            <h1 style={{ fontSize: 36, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>
              My Medical Profile
            </h1>
            {fhirData && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(0,184,168,0.1)", color: "#00b8a8",
                fontSize: 11, fontWeight: 600, padding: "4px 12px",
                borderRadius: 50, marginTop: 8
              }}>
                <span style={{ width: 6, height: 6, background: "#00b8a8", borderRadius: "50%" }} />
                Synced with EyeClinic — FHIR R4
              </span>
            )}
          </motion.div>

          <div style={{ display: "flex", gap: 32 }}>
            {/* Sidebar */}
            <motion.div
              initial="hidden" animate="visible" variants={fadeUp}
              transition={{ delay: 0.1 }}
              style={{
                width: 320, flexShrink: 0, background: "white",
                borderRadius: 24, padding: "32px 24px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                textAlign: "center", height: "fit-content"
              }}
            >
              <div style={{
                width: 100, height: 100, borderRadius: "50%",
                background: "linear-gradient(135deg, #1f6bff, #00b8a8)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px", fontSize: 36, fontWeight: 700, color: "white"
              }}>
                {initials}
              </div>

              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1a1a2e", marginBottom: 4 }}>
                {fullName}
              </h2>

              {userData.patientIdentifier && (
                <p style={{ fontSize: 12, color: "#00b8a8", fontWeight: 600, marginBottom: 8 }}>
                  {userData.patientIdentifier}
                </p>
              )}

              {userData.email && (
                <p style={{ fontSize: 12, color: "#6f86a3", marginBottom: 16 }}>
                  {userData.email}
                </p>
              )}

              <span style={{
                display: "inline-block", background: "rgba(0,184,168,0.1)",
                color: "#00b8a8", fontSize: 11, fontWeight: 600,
                padding: "4px 12px", borderRadius: 50, marginBottom: 24
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

              <button onClick={() => setPage("results")} style={{
                width: "100%", padding: "12px", background: "#f8fafc",
                border: "none", borderRadius: 12, fontSize: 13, fontWeight: 600,
                color: "#1a1a2e", cursor: "pointer", marginBottom: 12,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.2s ease"
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "#1f6bff"; e.currentTarget.style.color = "white"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#1a1a2e"; }}
              >
                <FaFileAlt size={14} /> My Results
              </button>

              <button onClick={() => setPage("booking")} style={{
                width: "100%", padding: "12px", background: "#1f6bff",
                border: "none", borderRadius: 12, fontSize: 13, fontWeight: 600,
                color: "white", cursor: "pointer", marginBottom: 12,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.2s ease"
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#00b8a8"}
                onMouseLeave={e => e.currentTarget.style.background = "#1f6bff"}
              >
                <FaCalendarCheck size={14} /> New Booking
              </button>

              <button onClick={handleLogout} style={{
                width: "100%", padding: "12px", background: "transparent",
                border: "1px solid #ef4444", borderRadius: 12, fontSize: 13,
                fontWeight: 600, color: "#ef4444", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.2s ease"
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "#ef4444"; e.currentTarget.style.color = "white"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#ef4444"; }}
              >
                <FaSignOutAlt size={14} /> Sign Out
              </button>
            </motion.div>

            {/* Main Content */}
            <div style={{ flex: 1 }}>
              {/* Personal Information */}
              <motion.div
                initial="hidden" animate="visible" variants={fadeUp}
                transition={{ delay: 0.2 }}
                style={{
                  background: "white", borderRadius: 24, padding: "40px",
                  marginBottom: 32, boxShadow: "0 4px 20px rgba(0,0,0,0.06)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                  <h3 style={{
                    fontSize: 20, fontWeight: 700, color: "#1a1a2e", margin: 0,
                    display: "flex", alignItems: "center", gap: 12
                  }}>
                    <FaUser size={20} color="#1f6bff" />
                    Personal Information
                    {fhirLoading && (
                      <span style={{ fontSize: 11, color: "#00b8a8", fontWeight: 400 }}>
                        syncing...
                      </span>
                    )}
                  </h3>
                  <button
                    onClick={isEditing ? handleSave : () => setIsEditing(true)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "10px 20px",
                      background: isEditing ? "#00b8a8" : "#f8fafc",
                      border: "none", borderRadius: 12, fontSize: 13, fontWeight: 600,
                      color: isEditing ? "white" : "#6f86a3", cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {isEditing ? <FaSave size={14} /> : <FaEdit size={14} />}
                    {isEditing ? "Save Changes" : "Edit Profile"}
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 28 }}>
                  {/* First Name */}
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#6f86a3", marginBottom: 8 }}>
                      First Name
                    </label>
                    {isEditing ? (
                      <input type="text" name="firstName" value={userData.firstName}
                        onChange={handleChange} style={inputStyle} />
                    ) : (
                      <p style={valueStyle}>{userData.firstName || "—"}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#6f86a3", marginBottom: 8 }}>
                      Last Name
                    </label>
                    {isEditing ? (
                      <input type="text" name="lastName" value={userData.lastName}
                        onChange={handleChange} style={inputStyle} />
                    ) : (
                      <p style={valueStyle}>{userData.lastName || "—"}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#6f86a3", marginBottom: 8 }}>
                      Email Address
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <FaEnvelope size={16} color="#6f86a3" />
                      {isEditing ? (
                        <input type="email" name="email" value={userData.email}
                          onChange={handleChange} style={{ ...inputStyle, flex: 1 }} />
                      ) : (
                        <p style={valueStyle}>{userData.email || "—"}</p>
                      )}
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#6f86a3", marginBottom: 8 }}>
                      Phone Number
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <FaPhone size={16} color="#6f86a3" />
                      {isEditing ? (
                        <input type="tel" name="phone" value={userData.phone}
                          onChange={handleChange} style={{ ...inputStyle, flex: 1 }}
                          placeholder="+20 123 456 7890" />
                      ) : (
                        <p style={valueStyle}>{userData.phone || "—"}</p>
                      )}
                    </div>
                  </div>

                  {/* Date of Birth */}
                  {userData.birthDate && (
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#6f86a3", marginBottom: 8 }}>
                        Date of Birth
                      </label>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <FaBirthdayCake size={16} color="#6f86a3" />
                        <p style={valueStyle}>{formatDate(userData.birthDate)}</p>
                      </div>
                    </div>
                  )}

                  {/* Gender */}
                  {userData.gender && (
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#6f86a3", marginBottom: 8 }}>
                        Gender
                      </label>
                      <p style={valueStyle}>{userData.gender}</p>
                    </div>
                  )}

                  {/* Address */}
                  {userData.address && (
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#6f86a3", marginBottom: 8 }}>
                        Address
                      </label>
                      <p style={valueStyle}>{userData.address}</p>
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div style={{ marginTop: 32, display: "flex", gap: 16, justifyContent: "flex-end" }}>
                    <button onClick={() => setIsEditing(false)} style={{
                      padding: "12px 28px", background: "#f8fafc", border: "none",
                      borderRadius: 12, fontSize: 14, fontWeight: 500, color: "#6f86a3", cursor: "pointer"
                    }}>
                      Cancel
                    </button>
                    <button onClick={handleSave} style={{
                      padding: "12px 32px",
                      background: "linear-gradient(135deg, #1f6bff, #00b8a8)",
                      border: "none", borderRadius: 12, fontSize: 14,
                      fontWeight: 600, color: "white", cursor: "pointer"
                    }}>
                      Save Changes
                    </button>
                  </div>
                )}
              </motion.div>


            </div>
          </div>
        </div>
      </div>


    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const inputStyle = {
  width: "100%", padding: "14px 18px",
  border: "1px solid #e2e8f0", borderRadius: 12,
  fontSize: 15, background: "#fafbfc",
  boxSizing: "border-box"
};

const valueStyle = {
  fontSize: 16, fontWeight: 500, color: "#1a1a2e",
  margin: 0, padding: "8px 0"
};