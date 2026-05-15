import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaMicrobe,
  FaCheckCircle,
  FaClock,
  FaUser,
  FaCalendar,
  FaStethoscope,
  FaSpinner,
  FaChevronRight,
  FaUpload,
  FaDownload,
  FaFile,
  FaImage,
  FaFilePdf,
  FaCheckDouble
} from 'react-icons/fa';
import axios from 'axios';
import FileUploadPanel from './FileUploadPanel';

const RADIOLOGY_API = 'http://localhost:5301/api';

export default function ActiveInvestigationsPage() {
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInvestigation, setSelectedInvestigation] = useState(null);
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [completingInvestigation, setCompletingInvestigation] = useState(null);
  const [completionNotes, setCompletionNotes] = useState('');

  // Fetch active investigations
  const fetchInvestigations = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`${RADIOLOGY_API}/appointments/active-investigations`);

      if (response.data.success) {
        setInvestigations(response.data.data || []);
      } else {
        setError(response.data.message || 'Failed to fetch investigations');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching investigations');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestigations();

    // Refresh every 30 seconds
    const interval = setInterval(fetchInvestigations, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCompleteInvestigation = async (investigationId) => {
    setCompletingInvestigation(investigationId);

    try {
      const investigation = selectedInvestigation;
      const appointmentId = investigation?.appointment?.id;

      const response = await axios.post(
        `${RADIOLOGY_API}/appointments/${appointmentId}/investigations/${investigationId}/complete`,
        {
          completionNotes: completionNotes
        }
      );

      if (response.data.success) {
        alert('Investigation completed successfully');
        setSelectedInvestigation(null);
        setCompletionNotes('');
        fetchInvestigations();
      } else {
        setError(response.data.message || 'Failed to complete investigation');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error completing investigation');
    } finally {
      setCompletingInvestigation(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return { bg: '#DBEAFE', text: '#1E40AF', icon: FaClock };
      case 'In Progress':
        return { bg: '#FEF3C7', text: '#92400E', icon: FaMicrobe };
      case 'Under Review':
        return { bg: '#DDD6FE', text: '#4F46E5', icon: FaCheckCircle };
      case 'Completed':
        return { bg: '#DCFCE7', text: '#166534', icon: FaCheckDouble };
      default:
        return { bg: '#F3F4F6', text: '#374151', icon: FaClock };
    }
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) return FaImage;
    if (mimeType === 'application/pdf') return FaFilePdf;
    return FaFile;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '32px' }}
        >
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#1e3a5f',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <FaMicrobe size={32} />
            Active Investigations
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Monitor ongoing investigations and upload results
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: '#FEE2E2',
              border: '1px solid #FECACA',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              color: '#DC2626'
            }}
          >
            {error}
          </motion.div>
        )}

        {/* Investigations List */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <FaSpinner size={48} color="#1e3a5f" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : investigations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '48px 24px',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <FaMicrobe size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>
              No Active Investigations
            </h2>
            <p style={{ color: '#94a3b8' }}>All investigations have been completed</p>
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {investigations.map((investigation, index) => {
              const statusBadge = getStatusBadge(investigation.status);
              const StatusIcon = statusBadge.icon;
              const appointment = investigation.appointment;
              const isSelected = selectedInvestigation?.id === investigation.id;

              return (
                <motion.div
                  key={investigation.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: isSelected ? '0 8px 24px rgba(30, 58, 95, 0.2)' : '0 1px 3px rgba(0,0,0,0.1)',
                    border: isSelected ? '2px solid #1e3a5f' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => setSelectedInvestigation(isSelected ? null : investigation)}
                  whileHover={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '16px', alignItems: 'center' }}>
                    {/* Investigation Info */}
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '12px',
                      background: statusBadge.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: statusBadge.text
                    }}>
                      <StatusIcon size={24} />
                    </div>

                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '12px' }}>
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>
                            Patient
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                            {appointment?.patient?.firstName} {appointment?.patient?.lastName}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>
                            Investigation Type
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                            {investigation.investigationType}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>
                            Status
                          </div>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: statusBadge.bg,
                            color: statusBadge.text,
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 600
                          }}>
                            <StatusIcon size={12} />
                            {investigation.status}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', fontSize: '12px', color: '#64748b' }}>
                        <div>Started: {new Date(investigation.startedAt).toLocaleDateString()}</div>
                        <div>Files: {investigation.files?.length || 0}</div>
                        <div>Appointment: {appointment?.id}</div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInvestigation(isSelected ? null : investigation);
                      }}
                      style={{
                        background: isSelected ? '#1e3a5f' : '#f1f5f9',
                        color: isSelected ? 'white' : '#1e3a5f',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.target.style.background = '#e2e8f0';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.target.style.background = '#f1f5f9';
                      }}
                    >
                      {isSelected ? 'Collapse' : 'Expand'} <FaChevronRight size={10} style={{ transform: isSelected ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
                    </button>
                  </div>

                  {/* Expanded View */}
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{
                        marginTop: '20px',
                        paddingTop: '20px',
                        borderTop: '1px solid #e2e8f0'
                      }}
                    >
                      {/* Tabs */}
                      <div style={{
                        display: 'flex',
                        gap: '12px',
                        marginBottom: '20px',
                        borderBottom: '1px solid #e2e8f0',
                        paddingBottom: '12px'
                      }}>
                        <button
                          onClick={() => setShowUploadPanel(false)}
                          style={{
                            background: !showUploadPanel ? '#1e3a5f' : 'transparent',
                            color: !showUploadPanel ? 'white' : '#64748b',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px 16px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '12px'
                          }}
                        >
                          Files ({investigation.files?.length || 0})
                        </button>
                        {investigation.status !== 'Completed' && (
                          <button
                            onClick={() => setShowUploadPanel(true)}
                            style={{
                              background: showUploadPanel ? '#1e3a5f' : 'transparent',
                              color: showUploadPanel ? 'white' : '#64748b',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '8px 16px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: '12px'
                            }}
                          >
                            <FaUpload size={10} style={{ marginRight: '4px' }} />
                            Upload
                          </button>
                        )}
                      </div>

                      {/* Files List */}
                      {!showUploadPanel && (
                        <div style={{ marginBottom: '20px' }}>
                          {investigation.files?.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                              No files uploaded yet
                            </div>
                          ) : (
                            <div style={{ display: 'grid', gap: '8px' }}>
                              {investigation.files?.map((file) => {
                                const FileIcon = getFileIcon(file.mimeType);
                                return (
                                  <div
                                    key={file.id}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '12px',
                                      padding: '12px',
                                      background: '#f8fafc',
                                      borderRadius: '8px',
                                      border: '1px solid #e2e8f0'
                                    }}
                                  >
                                    <FileIcon size={16} color="#64748b" />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        color: '#1e293b',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                      }}>
                                        {file.originalFileName}
                                      </div>
                                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                                        {(file.fileSize / 1024 / 1024).toFixed(2)} MB • {new Date(file.uploadedAt).toLocaleDateString()}
                                      </div>
                                    </div>
                                    <a
                                      href={file.fileUrl}
                                      download
                                      style={{
                                        color: '#1e3a5f',
                                        textDecoration: 'none',
                                        padding: '6px 12px',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                      }}
                                    >
                                      <FaDownload size={10} />
                                      Download
                                    </a>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Upload Panel */}
                      {showUploadPanel && (
                        <div style={{ marginBottom: '20px' }}>
                          <FileUploadPanel
                            appointmentId={appointment?.id}
                            investigationId={investigation.id}
                            onUploadComplete={() => {
                              setShowUploadPanel(false);
                              fetchInvestigations();
                            }}
                          />
                        </div>
                      )}

                      {/* Investigation Notes */}
                      {investigation.status !== 'Completed' && (
                        <div style={{
                          padding: '16px',
                          background: '#f8fafc',
                          borderRadius: '8px',
                          borderTop: '1px solid #e2e8f0',
                          marginTop: '20px'
                        }}>
                          <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '8px' }}>
                            Completion Notes (Optional)
                          </label>
                          <textarea
                            value={completionNotes}
                            onChange={(e) => setCompletionNotes(e.target.value)}
                            placeholder="Add notes before marking as completed..."
                            style={{
                              width: '100%',
                              padding: '12px',
                              border: '1px solid #cbd5e1',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontFamily: 'inherit',
                              minHeight: '80px',
                              resize: 'vertical',
                              marginBottom: '12px'
                            }}
                          />
                          <button
                            onClick={() => handleCompleteInvestigation(investigation.id)}
                            disabled={completingInvestigation === investigation.id}
                            style={{
                              padding: '10px 20px',
                              background: '#10B981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontWeight: 600,
                              fontSize: '13px',
                              cursor: completingInvestigation === investigation.id ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              opacity: completingInvestigation === investigation.id ? 0.7 : 1
                            }}
                          >
                            {completingInvestigation === investigation.id && (
                              <FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} />
                            )}
                            Mark as Complete
                          </button>
                        </div>
                      )}

                      {investigation.status === 'Completed' && (
                        <div style={{
                          padding: '12px 16px',
                          background: '#DCFCE7',
                          border: '1px solid #BBDE33',
                          borderRadius: '8px',
                          color: '#166534',
                          fontSize: '13px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginTop: '20px'
                        }}>
                          <FaCheckDouble size={14} />
                          Investigation completed on {new Date(investigation.completedAt).toLocaleDateString()}
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
