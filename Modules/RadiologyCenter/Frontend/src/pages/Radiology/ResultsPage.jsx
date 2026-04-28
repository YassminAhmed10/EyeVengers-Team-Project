import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaFilePdf, FaWhatsapp, FaEnvelope, FaShareAlt, 
  FaEye, FaCalendarAlt, FaUserMd, FaDownload,
  FaTimes, FaCheckCircle, FaSpinner, FaCalendarCheck
} from "react-icons/fa";
import { MdOutlineMedicalInformation } from "react-icons/md";

export default function ResultsPage({ setPage, setShowSendModal }) {
  const [filter, setFilter] = useState("all");
  const [selectedResult, setSelectedResult] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareResult, setShareResult] = useState(null);
  
  const results = [
    {
      id: 1,
      icon: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80",
      name: "MRI Chest Scan",
      type: "Magnetic Resonance Imaging",
      date: "March 15, 2025",
      doctor: "Dr. Sarah Mahmoud",
      ref: "RC-2025-001",
      status: "ready",
      reportUrl: "#",
      imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
      findings: "Normal chest anatomy with no abnormalities detected. Heart size within normal limits. Lungs clear with no infiltrates or masses.",
      impression: "Normal chest MRI examination.",
      recommendations: "No further imaging needed. Routine follow-up as clinically indicated."
    },
    {
      id: 2,
      icon: "https://images.unsplash.com/photo-1579684453423-f84349ef60b0?w=400&q=80",
      name: "CT Abdomen & Pelvis",
      type: "Computed Tomography",
      date: "February 2, 2025",
      doctor: "Dr. Ali Khaled",
      ref: "RC-2025-002",
      status: "ready",
      reportUrl: "#",
      imageUrl: "https://images.unsplash.com/photo-1579684453423-f84349ef60b0?w=800&q=80",
      findings: "Liver, spleen, pancreas, and kidneys appear normal. No evidence of masses or lymphadenopathy. Bowel loops are unremarkable.",
      impression: "Normal CT examination of abdomen and pelvis.",
      recommendations: "Routine follow-up as needed."
    },
    {
      id: 3,
      icon: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80",
      name: "Brain MRI",
      type: "Neuroradiology",
      date: "January 10, 2025",
      doctor: "Dr. Nadia Roshdy",
      ref: "RC-2025-003",
      status: "ready",
      reportUrl: "#",
      imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
      findings: "Normal brain parenchyma. No evidence of masses, hemorrhage, or infarction. Ventricular system normal in size and configuration.",
      impression: "Normal brain MRI.",
      recommendations: "No further imaging recommended."
    },
    {
      id: 4,
      icon: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&q=80",
      name: "Right Knee X-Ray",
      type: "Digital Radiography",
      date: "December 18, 2024",
      doctor: "Dr. Tamer Bakr",
      ref: "RC-2024-098",
      status: "pending",
      reportUrl: null,
      imageUrl: null,
      findings: null,
      impression: null,
      recommendations: null
    },
    {
      id: 5,
      icon: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80",
      name: "Abdominal Ultrasound",
      type: "Sonography",
      date: "March 22, 2025",
      doctor: "Dr. Sarah Mahmoud",
      ref: "RC-2025-004",
      status: "upcoming",
      reportUrl: null,
      imageUrl: null,
      findings: null,
      impression: null,
      recommendations: null
    },
  ];

  const filters = [
    { id: "all", label: "All Results", icon: <MdOutlineMedicalInformation /> },
    { id: "ready", label: "Ready", icon: <FaCheckCircle /> },
    { id: "pending", label: "Pending", icon: <FaSpinner /> },
    { id: "upcoming", label: "Upcoming", icon: <FaCalendarCheck /> },
  ];

  const filtered = filter === "all" ? results : results.filter((r) => r.status === filter);

  const handleDownloadPDF = (result) => {
    alert(`Downloading PDF for ${result.name}`);
  };

  const handleShareWhatsApp = (result) => {
    const message = `Check my radiology report: ${result.name} - ${result.ref}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleShareEmail = (result) => {
    const subject = `Radiology Report - ${result.name}`;
    const body = `Here is my radiology report: ${result.name}\nReference: ${result.ref}\nDate: ${result.date}\nDoctor: ${result.doctor}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleViewReport = (result) => {
    setSelectedResult(result);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'ready':
        return { label: 'Ready', color: '#28a745', bg: '#d4edda' };
      case 'pending':
        return { label: 'Pending Review', color: '#fd7e14', bg: '#fff3e0' };
      case 'upcoming':
        return { label: 'Upcoming', color: '#1f6bff', bg: '#e3f2fd' };
      default:
        return { label: 'Unknown', color: '#6c757d', bg: '#e9ecef' };
    }
  };

  return (
    <div dir="ltr" style={{ background: "#f8fafc", minHeight: "100vh", paddingTop: "100px" }}>
      <div style={{
        background: "linear-gradient(135deg, #0b1a34 0%, #1a3a5c 100%)",
        padding: "60px 0 80px",
        position: "relative",
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 40px" }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "#00b8a8", marginBottom: 16, display: "block" }}>
              MY MEDICAL RECORDS
            </span>
            <h1 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 900, color: "white", marginBottom: 16, fontFamily: "'Outfit', sans-serif" }}>
              My Scan Results
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", maxWidth: 600 }}>
              View, download, and share your radiology reports instantly
            </p>
          </motion.div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "40px" }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 20,
          marginBottom: 32,
        }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {filters.map((f) => (
              <motion.button
                key={f.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFilter(f.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 24px",
                  background: filter === f.id ? "linear-gradient(135deg, #1f6bff, #00b8a8)" : "white",
                  color: filter === f.id ? "white" : "#30445f",
                  border: filter === f.id ? "none" : "1px solid #e0e0e0",
                  borderRadius: 40,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {f.icon}
                {f.label}
              </motion.button>
            ))}
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn btn-primary"
            onClick={() => setPage("booking")}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <FaCalendarAlt />
            Book New Appointment
          </motion.button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filtered.map((result, index) => {
            const statusBadge = getStatusBadge(result.status);
            return (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
                style={{
                  background: "white",
                  borderRadius: 20,
                  overflow: "hidden",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                  transition: "all 0.3s ease",
                }}
              >
                <div style={{ display: "flex", padding: 24, gap: 24, flexWrap: "wrap" }}>
                  {result.imageUrl ? (
                    <div style={{
                      width: 120,
                      height: 120,
                      borderRadius: 16,
                      overflow: "hidden",
                      flexShrink: 0,
                    }}>
                      <img
                        src={result.imageUrl}
                        alt={result.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                  ) : (
                    <div style={{
                      width: 120,
                      height: 120,
                      borderRadius: 16,
                      background: `linear-gradient(135deg, ${result.status === 'pending' ? '#fd7e14' : '#1f6bff'}20, ${result.status === 'pending' ? '#fd7e14' : '#1f6bff'}10)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {result.status === 'pending' ? <FaSpinner size={40} color="#fd7e14" /> : <FaCalendarCheck size={40} color="#1f6bff" />}
                    </div>
                  )}
                  
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0b1a34", marginBottom: 8 }}>
                      {result.name}
                    </h3>
                    <p style={{ fontSize: 13, color: "#6f86a3", marginBottom: 12 }}>
                      {result.type}
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <FaCalendarAlt size={12} color="#6f86a3" />
                        <span style={{ fontSize: 12, color: "#6f86a3" }}>{result.date}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <FaUserMd size={12} color="#6f86a3" />
                        <span style={{ fontSize: 12, color: "#6f86a3" }}>{result.doctor}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <MdOutlineMedicalInformation size={12} color="#6f86a3" />
                        <span style={{ fontSize: 12, color: "#6f86a3" }}>{result.ref}</span>
                      </div>
                    </div>
                    <span style={{
                      display: "inline-block",
                      background: statusBadge.bg,
                      color: statusBadge.color,
                      padding: "4px 12px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 600,
                    }}>
                      {statusBadge.label}
                    </span>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    {result.status === "ready" && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleViewReport(result)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "10px 20px",
                            background: "linear-gradient(135deg, #1f6bff, #00b8a8)",
                            color: "white",
                            border: "none",
                            borderRadius: 12,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          <FaEye size={14} />
                          View Report
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDownloadPDF(result)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "10px 20px",
                            background: "#dc3545",
                            color: "white",
                            border: "none",
                            borderRadius: 12,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          <FaFilePdf size={14} />
                          PDF
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setShareResult(result);
                            setShowShareModal(true);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "10px 20px",
                            background: "#25D366",
                            color: "white",
                            border: "none",
                            borderRadius: 12,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          <FaWhatsapp size={14} />
                          WhatsApp
                        </motion.button>
                      </>
                    )}
                    {result.status === "pending" && (
                      <div style={{
                        padding: "10px 20px",
                        background: "#fff3e0",
                        borderRadius: 12,
                        color: "#fd7e14",
                        fontSize: 13,
                        fontWeight: 600,
                      }}>
                        Processing in progress...
                      </div>
                    )}
                    {result.status === "upcoming" && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "10px 20px",
                            background: "#6c757d",
                            color: "white",
                            border: "none",
                            borderRadius: 12,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          <FaCalendarAlt size={14} />
                          Reschedule
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "10px 20px",
                            background: "white",
                            color: "#dc3545",
                            border: "1px solid #dc3545",
                            borderRadius: 12,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          <FaTimes size={14} />
                          Cancel
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedResult && (
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
              background: "rgba(0,0,0,0.8)",
              backdropFilter: "blur(8px)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px",
              overflow: "auto",
            }}
            onClick={() => setSelectedResult(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25 }}
              style={{
                maxWidth: 900,
                width: "100%",
                background: "white",
                borderRadius: 24,
                overflow: "hidden",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                background: "linear-gradient(135deg, #0b1a34, #1a3a5c)",
                padding: "30px",
                color: "white",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20 }}>
                  <div>
                    <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{selectedResult.name}</h2>
                    <p style={{ opacity: 0.8 }}>{selectedResult.type}</p>
                  </div>
                  <button
                    onClick={() => setSelectedResult(null)}
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      border: "none",
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      cursor: "pointer",
                      color: "white",
                    }}
                  >
                    <FaTimes />
                  </button>
                </div>
                <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                  <div><FaCalendarAlt style={{ marginRight: 8 }} /> {selectedResult.date}</div>
                  <div><FaUserMd style={{ marginRight: 8 }} /> {selectedResult.doctor}</div>
                  <div><MdOutlineMedicalInformation style={{ marginRight: 8 }} /> {selectedResult.ref}</div>
                </div>
              </div>

              <div style={{ padding: "30px" }}>
                {selectedResult.imageUrl && (
                  <div style={{
                    marginBottom: 30,
                    borderRadius: 16,
                    overflow: "hidden",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }}>
                    <img
                      src={selectedResult.imageUrl}
                      alt={selectedResult.name}
                      style={{ width: "100%", height: "auto", display: "block" }}
                    />
                  </div>
                )}

                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0b1a34", marginBottom: 12 }}>Findings</h3>
                  <p style={{ lineHeight: 1.7, color: "#30445f" }}>{selectedResult.findings}</p>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0b1a34", marginBottom: 12 }}>Impression</h3>
                  <p style={{ lineHeight: 1.7, color: "#30445f" }}>{selectedResult.impression}</p>
                </div>

                <div style={{ marginBottom: 30 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0b1a34", marginBottom: 12 }}>Recommendations</h3>
                  <p style={{ lineHeight: 1.7, color: "#30445f" }}>{selectedResult.recommendations}</p>
                </div>

                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", borderTop: "1px solid #e0e0e0", paddingTop: 24 }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDownloadPDF(selectedResult)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 24px",
                      background: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <FaDownload /> Download PDF
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleShareWhatsApp(selectedResult)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 24px",
                      background: "#25D366",
                      color: "white",
                      border: "none",
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <FaWhatsapp /> Share via WhatsApp
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showShareModal && shareResult && (
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
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)",
              zIndex: 1001,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: "white",
                borderRadius: 24,
                padding: 32,
                maxWidth: 400,
                width: "90%",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Share Report</h3>
              <p style={{ color: "#6f86a3", marginBottom: 24 }}>Choose how to share your radiology report</p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    handleShareWhatsApp(shareResult);
                    setShowShareModal(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 20px",
                    background: "#25D366",
                    color: "white",
                    border: "none",
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <FaWhatsapp size={20} />
                  Share via WhatsApp
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    handleShareEmail(shareResult);
                    setShowShareModal(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 20px",
                    background: "#ea4335",
                    color: "white",
                    border: "none",
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <FaEnvelope size={20} />
                  Share via Email
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    handleDownloadPDF(shareResult);
                    setShowShareModal(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 20px",
                    background: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <FaFilePdf size={20} />
                  Download PDF
                </motion.button>
              </div>
              
              <button
                onClick={() => setShowShareModal(false)}
                style={{
                  width: "100%",
                  marginTop: 16,
                  padding: "12px",
                  background: "transparent",
                  border: "1px solid #e0e0e0",
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}