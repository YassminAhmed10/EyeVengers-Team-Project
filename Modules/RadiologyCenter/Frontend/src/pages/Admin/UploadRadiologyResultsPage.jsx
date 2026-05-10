// src/pages/Admin/UploadRadiologyResultsPage.jsx
// Admin page to upload radiology images and reports

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCloudUploadAlt, FaImage, FaFilePdf, FaCheckCircle, FaFileAlt } from 'react-icons/fa';
import { appointmentService } from '../../services/appointmentService';
import { radiologyResultService } from '../../services/radiologyResultService';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function UploadRadiologyResultsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    reportTitle: '',
    reportText: '',
    findings: '',
    conclusion: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [results, setResults] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadAcceptedAppointments();
  }, []);

  useEffect(() => {
    if (selectedAppointment) {
      loadResults(selectedAppointment.id);
    }
  }, [selectedAppointment]);

  const loadAcceptedAppointments = async () => {
    setLoading(true);
    const result = await appointmentService.getAppointments('Accepted');
    if (result.success) {
      setAppointments(result.data);
    }
    setLoading(false);
  };

  const loadResults = async (appointmentId) => {
    const result = await radiologyResultService.getResultsByAppointment(appointmentId);
    if (result.success) {
      setResults(result.data);
    }
  };

  const handleCreateResult = async () => {
    if (!selectedAppointment) {
      alert('Please select an appointment');
      return;
    }

    setUploading(true);
    const result = await radiologyResultService.createResult(
      selectedAppointment.id,
      formData.reportTitle,
      formData.reportText,
      formData.findings,
      formData.conclusion
    );

    if (result.success) {
      const resultId = result.data.id;

      // Upload image if provided
      if (imageFile) {
        await radiologyResultService.uploadImage(resultId, imageFile);
      }

      // Upload PDF if provided
      if (pdfFile) {
        await radiologyResultService.uploadReport(resultId, pdfFile);
      }

      // Reset form
      setFormData({ reportTitle: '', reportText: '', findings: '', conclusion: '' });
      setImageFile(null);
      setPdfFile(null);

      // Reload results
      await loadResults(selectedAppointment.id);
      alert('Result uploaded successfully!');
    }
    setUploading(false);
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading appointments...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', background: '#f5f7fa', minHeight: '100vh' }}>
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>
          Upload Radiology Results
        </h1>
        <p style={{ color: '#6f86a3', marginBottom: 32 }}>
          Upload images and reports for patient investigations
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: appointments.length > 0 ? '300px 1fr' : '1fr', gap: 32 }}>
        {/* Appointments List */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.1 }}>
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: 20,
            maxHeight: '70vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', marginBottom: 16 }}>
              Appointments
            </h3>
            <div style={{ display: 'grid', gap: 8 }}>
              {appointments.map((apt) => (
                <motion.div
                  key={apt.id}
                  onClick={() => setSelectedAppointment(apt)}
                  whileHover={{ scale: 1.02 }}
                  style={{
                    padding: 12,
                    background: selectedAppointment?.id === apt.id ? '#1f6bff' : '#f8fafc',
                    border: selectedAppointment?.id === apt.id ? 'none' : '1px solid #e2e8f0',
                    borderRadius: 8,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <p style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: selectedAppointment?.id === apt.id ? 'white' : '#1a1a2e',
                    margin: 0
                  }}>
                    {apt.patientName}
                  </p>
                  <p style={{
                    fontSize: 12,
                    color: selectedAppointment?.id === apt.id ? 'rgba(255,255,255,0.7)' : '#6f86a3',
                    margin: '4px 0 0'
                  }}>
                    {apt.serviceName}
                  </p>
                </motion.div>
              ))}
              {appointments.length === 0 && (
                <p style={{ color: '#6f86a3', fontSize: 13 }}>No accepted appointments</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Upload Form & Results */}
        {selectedAppointment && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.2 }}>
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 32,
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
            }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', marginBottom: 24 }}>
                Upload Result for {selectedAppointment.patientName}
              </h2>

              {/* Form Fields */}
              <div style={{ display: 'grid', gap: 16, marginBottom: 32 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#6f86a3', display: 'block', marginBottom: 8 }}>
                    Report Title
                  </label>
                  <input
                    type="text"
                    value={formData.reportTitle}
                    onChange={(e) => setFormData({ ...formData, reportTitle: e.target.value })}
                    placeholder="e.g., Chest X-Ray Report"
                    style={{
                      width: '100%',
                      padding: 12,
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      fontSize: 14,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#6f86a3', display: 'block', marginBottom: 8 }}>
                    Findings
                  </label>
                  <textarea
                    value={formData.findings}
                    onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                    placeholder="Describe what was found in the investigation..."
                    style={{
                      width: '100%',
                      minHeight: 80,
                      padding: 12,
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      fontSize: 14,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#6f86a3', display: 'block', marginBottom: 8 }}>
                    Conclusion
                  </label>
                  <textarea
                    value={formData.conclusion}
                    onChange={(e) => setFormData({ ...formData, conclusion: e.target.value })}
                    placeholder="Your clinical conclusion..."
                    style={{
                      width: '100%',
                      minHeight: 80,
                      padding: 12,
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      fontSize: 14,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* File Uploads */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
                {/* Image Upload */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#6f86a3', display: 'block', marginBottom: 8 }}>
                    <FaImage size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Upload Image (JPG, PNG, DICOM)
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,application/dicom,.dcm"
                    onChange={(e) => setImageFile(e.target.files?.[0])}
                    style={{
                      width: '100%',
                      padding: 12,
                      border: '2px dashed #e2e8f0',
                      borderRadius: 8,
                      cursor: 'pointer',
                      boxSizing: 'border-box'
                    }}
                  />
                  {imageFile && (
                    <p style={{ fontSize: 12, color: '#10b981', marginTop: 8 }}>
                      ✓ {imageFile.name}
                    </p>
                  )}
                </div>

                {/* PDF Upload */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#6f86a3', display: 'block', marginBottom: 8 }}>
                    <FaFilePdf size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Upload PDF Report
                  </label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setPdfFile(e.target.files?.[0])}
                    style={{
                      width: '100%',
                      padding: 12,
                      border: '2px dashed #e2e8f0',
                      borderRadius: 8,
                      cursor: 'pointer',
                      boxSizing: 'border-box'
                    }}
                  />
                  {pdfFile && (
                    <p style={{ fontSize: 12, color: '#10b981', marginTop: 8 }}>
                      ✓ {pdfFile.name}
                    </p>
                  )}
                </div>
              </div>

              <motion.button
                onClick={handleCreateResult}
                disabled={uploading}
                whileHover={!uploading ? { scale: 1.05 } : {}}
                whileTap={!uploading ? { scale: 0.95 } : {}}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  background: uploading ? '#ccc' : '#1f6bff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'white',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 24
                }}
              >
                <FaCloudUploadAlt /> {uploading ? 'Uploading...' : 'Upload Result'}
              </motion.button>

              {/* Previous Results */}
              {results.length > 0 && (
                <div style={{ marginTop: 32, paddingTop: 32, borderTop: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', marginBottom: 16 }}>
                    Previous Results
                  </h3>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {results.map((res) => (
                      <div key={res.id} style={{
                        background: '#f8fafc',
                        padding: 16,
                        borderRadius: 8,
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                          <h4 style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>
                            {res.reportTitle}
                          </h4>
                          <span style={{ fontSize: 11, color: '#6f86a3' }}>
                            {new Date(res.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                          {res.imageUrl && (
                            <a href={res.imageUrl} download style={{
                              fontSize: 12,
                              color: '#1f6bff',
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}>
                              <FaImage size={12} /> Image
                            </a>
                          )}
                          {res.reportUrl && (
                            <a href={res.reportUrl} download style={{
                              fontSize: 12,
                              color: '#1f6bff',
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}>
                              <FaFilePdf size={12} /> PDF
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
