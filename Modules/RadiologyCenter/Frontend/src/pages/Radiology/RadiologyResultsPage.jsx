// src/pages/Radiology/RadiologyResultsPage.jsx
// Patient page to view radiology results and reports

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaImage, FaFilePdf, FaDownload, FaCheckCircle, FaHourglassStart, FaClock, FaEye, FaCalendar } from 'react-icons/fa';
import { appointmentService } from '../../services/appointmentService';
import { radiologyResultService } from '../../services/radiologyResultService';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function RadiologyResultsPage() {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);

  // Get patient ID from localStorage
  const patientId = localStorage.getItem('radiologyPatientId');

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    if (selectedAppointment) {
      loadResults(selectedAppointment.id);
    }
  }, [selectedAppointment]);

  const loadAppointments = async () => {
    if (!patientId) return;
    setLoading(true);
    const result = await appointmentService.getPatientAppointments(patientId, 'Accepted');
    if (result.success) {
      setAppointments(result.data);
      if (result.data.length > 0) {
        setSelectedAppointment(result.data[0]);
      }
    }
    setLoading(false);
  };

  const loadResults = async (appointmentId) => {
    const result = await radiologyResultService.getResultsByAppointment(appointmentId);
    if (result.success) {
      setResults(result.data);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Upcoming':
        return <FaHourglassStart size={16} style={{ color: '#3b82f6' }} />;
      case 'In Progress':
        return <FaClock size={16} style={{ color: '#f59e0b' }} />;
      case 'Done':
        return <FaCheckCircle size={16} style={{ color: '#10b981' }} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading your results...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', background: '#f5f7fa', minHeight: '100vh' }}>
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>
          Radiology Results
        </h1>
        <p style={{ color: '#6f86a3', marginBottom: 32 }}>
          View your investigation results and reports
        </p>
      </motion.div>

      {appointments.length === 0 ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          style={{
            background: 'white',
            borderRadius: 16,
            padding: 60,
            textAlign: 'center',
            color: '#6f86a3'
          }}
        >
          <FaCalendar size={48} style={{ margin: '0 auto 20px', opacity: 0.5 }} />
          <p style={{ fontSize: 16 }}>No completed appointments yet</p>
          <p style={{ fontSize: 14 }}>Your investigation results will appear here once completed</p>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 32 }}>
          {/* Appointments List */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.1 }}>
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 20,
              maxHeight: '70vh',
              overflowY: 'auto',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', marginBottom: 16 }}>
                My Appointments
              </h3>
              <div style={{ display: 'grid', gap: 8 }}>
                {appointments.map((apt) => (
                  <motion.div
                    key={apt.id}
                    onClick={() => setSelectedAppointment(apt)}
                    whileHover={{ scale: 1.02 }}
                    style={{
                      padding: 16,
                      background: selectedAppointment?.id === apt.id ? '#1f6bff' : '#f8fafc',
                      border: selectedAppointment?.id === apt.id ? 'none' : '1px solid #e2e8f0',
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      {getStatusIcon(apt.investigationStatus)}
                      <p style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: selectedAppointment?.id === apt.id ? 'white' : '#1a1a2e',
                        margin: 0
                      }}>
                        {apt.serviceName}
                      </p>
                    </div>
                    <p style={{
                      fontSize: 12,
                      color: selectedAppointment?.id === apt.id ? 'rgba(255,255,255,0.7)' : '#6f86a3',
                      margin: 0
                    }}>
                      {new Date(apt.slotDateTime).toLocaleDateString()}
                    </p>
                    <div style={{
                      marginTop: 8,
                      fontSize: 11,
                      fontWeight: 500,
                      color: selectedAppointment?.id === apt.id ? 'rgba(255,255,255,0.8)' : '#6f86a3'
                    }}>
                      {apt.resultCount} result(s)
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Results Display */}
          {selectedAppointment && (
            <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.2 }}>
              <div style={{
                background: 'white',
                borderRadius: 16,
                padding: 32,
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
              }}>
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', margin: 0, marginBottom: 8 }}>
                    {selectedAppointment.serviceName}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {getStatusIcon(selectedAppointment.investigationStatus)}
                    <span style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: selectedAppointment.investigationStatus === 'Done' ? '#10b981' : 
                             selectedAppointment.investigationStatus === 'In Progress' ? '#f59e0b' : '#3b82f6'
                    }}>
                      {selectedAppointment.investigationStatus}
                    </span>
                    <span style={{ fontSize: 12, color: '#6f86a3' }}>
                      • {new Date(selectedAppointment.slotDateTime).toLocaleDateString()} at {new Date(selectedAppointment.slotDateTime).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Results Grid */}
                {results.length > 0 ? (
                  <div style={{ display: 'grid', gap: 16 }}>
                    {results.map((result) => (
                      <motion.div
                        key={result.id}
                        onClick={() => setSelectedResult(selectedResult?.id === result.id ? null : result)}
                        whileHover={{ scale: 1.02 }}
                        style={{
                          padding: 20,
                          background: selectedResult?.id === result.id ? '#e0f2fe' : '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: 12,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                          <div>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
                              {result.reportTitle}
                            </h3>
                            <p style={{ fontSize: 12, color: '#6f86a3', margin: '4px 0 0' }}>
                              Uploaded: {new Date(result.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <FaEye size={16} style={{ color: '#1f6bff' }} />
                        </div>

                        {/* Expandable Details */}
                        {selectedResult?.id === result.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}
                          >
                            {result.findings && (
                              <div style={{ marginBottom: 12 }}>
                                <h4 style={{ fontSize: 12, fontWeight: 600, color: '#6f86a3', marginBottom: 6 }}>
                                  FINDINGS
                                </h4>
                                <p style={{ fontSize: 13, color: '#1a1a2e', lineHeight: 1.6, margin: 0 }}>
                                  {result.findings}
                                </p>
                              </div>
                            )}
                            {result.conclusion && (
                              <div style={{ marginBottom: 12 }}>
                                <h4 style={{ fontSize: 12, fontWeight: 600, color: '#6f86a3', marginBottom: 6 }}>
                                  CONCLUSION
                                </h4>
                                <p style={{ fontSize: 13, color: '#1a1a2e', lineHeight: 1.6, margin: 0 }}>
                                  {result.conclusion}
                                </p>
                              </div>
                            )}

                            {/* Download Buttons */}
                            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                              {result.imageUrl && (
                                <a
                                  href={result.imageUrl}
                                  download
                                  style={{
                                    flex: 1,
                                    padding: '8px 12px',
                                    background: '#e0f2fe',
                                    border: '1px solid #0284c7',
                                    borderRadius: 6,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: '#0284c7',
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 6,
                                    cursor: 'pointer'
                                  }}
                                >
                                  <FaImage size={12} /> Image
                                </a>
                              )}
                              {result.reportUrl && (
                                <a
                                  href={result.reportUrl}
                                  download
                                  style={{
                                    flex: 1,
                                    padding: '8px 12px',
                                    background: '#fef3c7',
                                    border: '1px solid #f59e0b',
                                    borderRadius: 6,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: '#f59e0b',
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 6,
                                    cursor: 'pointer'
                                  }}
                                >
                                  <FaFilePdf size={12} /> PDF
                                </a>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: '#6f86a3'
                  }}>
                    {selectedAppointment.investigationStatus === 'Done' ? (
                      <p>Results are being processed. Please check back soon.</p>
                    ) : (
                      <p>Investigation is {selectedAppointment.investigationStatus.toLowerCase()}. Results will be available when completed.</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
