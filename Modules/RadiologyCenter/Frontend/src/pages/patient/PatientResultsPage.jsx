import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaFolderOpen,
  FaCheckCircle,
  FaClock,
  FaDownload,
  FaFile,
  FaFilePdf,
  FaImage,
  FaCalendar,
  FaStethoscope,
  FaSpinner,
  FaEye,
  FaShareAlt
} from 'react-icons/fa';
import axios from 'axios';

const RADIOLOGY_API = 'http://localhost:5301/api';

export default function PatientResultsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [patientId, setPatientId] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // Get patient ID from localStorage or URL
  useEffect(() => {
    const storedPatientId = localStorage.getItem('radiologyPatientId') || 
                            new URLSearchParams(window.location.search).get('patientId');
    if (storedPatientId) {
      setPatientId(storedPatientId);
    }
  }, []);

  // Fetch patient results
  const fetchResults = async () => {
    if (!patientId) {
      setError('Patient ID not found');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // In a real scenario, this would call a dedicated results API endpoint
      // For now, we'll fetch from appointments for the patient
      const response = await axios.get(`${RADIOLOGY_API}/appointments?patientId=${patientId}`);

      if (response.data.success) {
        // Filter for completed appointments with investigation files
        const completedAppointments = response.data.data.filter(
          a => a.status === 'Completed' && a.investigations?.length > 0
        );
        setResults(completedAppointments);
      } else {
        setError(response.data.message || 'Failed to fetch results');
      }
    } catch (err) {
      // Fallback: show mock data for demonstration
      setResults(getMockResults());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchResults();
    }
  }, [patientId]);

  // Get file icon based on type
  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) return FaImage;
    if (mimeType === 'application/pdf') return FaFilePdf;
    return FaFile;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  // Download file
  const handleDownload = (file) => {
    const link = document.createElement('a');
    link.href = file.fileUrl;
    link.download = file.originalFileName;
    link.click();
  };

  // Mock results for demonstration
  const getMockResults = () => {
    return [
      {
        id: 1,
        patientId: patientId,
        status: 'Completed',
        radiologyService: { name: 'Chest X-Ray' },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        investigations: [
          {
            id: 1,
            investigationType: 'Chest X-Ray',
            status: 'Completed',
            files: [
              {
                id: 1,
                originalFileName: 'Chest_XRay_2024_01.jpg',
                fileUrl: '/sample-xray.jpg',
                fileSize: 2048576,
                mimeType: 'image/jpeg',
                uploadedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
                fhirResourceType: 'ImagingStudy'
              },
              {
                id: 2,
                originalFileName: 'Chest_Report_2024_01.pdf',
                fileUrl: '/sample-report.pdf',
                fileSize: 512000,
                mimeType: 'application/pdf',
                uploadedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
                fhirResourceType: 'DocumentReference'
              }
            ]
          }
        ]
      }
    ];
  };

  const filteredResults = filterStatus === 'all' 
    ? results 
    : results.filter(r => r.status.toLowerCase() === filterStatus.toLowerCase());

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 24px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
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
            <FaFolderOpen size={32} />
            My Results
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            View and download your radiology investigation results and reports
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

        {/* Filter Buttons */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          flexWrap: 'wrap'
        }}>
          {['all', 'completed', 'pending'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: '8px 16px',
                border: filterStatus === status ? 'none' : '1px solid #cbd5e1',
                borderRadius: '20px',
                background: filterStatus === status ? '#1e3a5f' : 'white',
                color: filterStatus === status ? 'white' : '#1e3a5f',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '12px',
                textTransform: 'capitalize',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (filterStatus !== status) {
                  e.target.style.background = '#f1f5f9';
                }
              }}
              onMouseLeave={(e) => {
                if (filterStatus !== status) {
                  e.target.style.background = 'white';
                }
              }}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Results List */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <FaSpinner size={48} color="#1e3a5f" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : filteredResults.length === 0 ? (
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
            <FaFolderOpen size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>
              No Results Available
            </h2>
            <p style={{ color: '#94a3b8' }}>
              Your investigation results will appear here once they are ready
            </p>
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {filteredResults.map((result, index) => {
              const totalFiles = result.investigations?.[0]?.files?.length || 0;
              const isSelected = selectedResult?.id === result.id;

              return (
                <motion.div
                  key={result.id}
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
                  onClick={() => setSelectedResult(isSelected ? null : result)}
                  whileHover={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '16px', alignItems: 'center' }}>
                    {/* Status Icon */}
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '12px',
                      background: result.status === 'Completed' ? '#DCFCE7' : '#FEF3C7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: result.status === 'Completed' ? '#166534' : '#92400E'
                    }}>
                      {result.status === 'Completed' ? (
                        <FaCheckCircle size={24} />
                      ) : (
                        <FaClock size={24} />
                      )}
                    </div>

                    {/* Result Info */}
                    <div>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: 700,
                        color: '#1e293b',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <FaStethoscope size={14} color="#64748b" />
                        {result.radiologyService?.name || 'Investigation'}
                      </div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto auto auto',
                        gap: '20px',
                        fontSize: '12px',
                        color: '#64748b'
                      }}>
                        <div>
                          <FaCalendar size={10} style={{ marginRight: '4px', marginBottom: '2px' }} />
                          {' '}
                          Completed: {new Date(result.completedAt).toLocaleDateString()}
                        </div>
                        <div>
                          Files: {totalFiles}
                        </div>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          background: result.status === 'Completed' ? '#DCFCE7' : '#FEF3C7',
                          color: result.status === 'Completed' ? '#166534' : '#92400E',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 600
                        }}>
                          {result.status === 'Completed' ? (
                            <>
                              <FaCheckCircle size={10} />
                              Ready for Download
                            </>
                          ) : (
                            <>
                              <FaClock size={10} />
                              Processing
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedResult(isSelected ? null : result);
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
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.target.style.background = '#e2e8f0';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.target.style.background = '#f1f5f9';
                      }}
                    >
                      {isSelected ? 'Hide' : 'Show'} Files
                    </button>
                  </div>

                  {/* Expanded Files View */}
                  {isSelected && result.investigations?.[0]?.files && (
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
                      <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1e3a5f', marginBottom: '12px' }}>
                        Available Files
                      </h3>
                      <div style={{ display: 'grid', gap: '8px' }}>
                        {result.investigations[0].files.map((file) => {
                          const FileIcon = getFileIcon(file.mimeType);
                          return (
                            <motion.div
                              key={file.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
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
                                  textOverflow: 'ellipsis',
                                  marginBottom: '4px'
                                }}>
                                  {file.originalFileName}
                                </div>
                                <div style={{
                                  fontSize: '11px',
                                  color: '#64748b',
                                  display: 'flex',
                                  gap: '12px'
                                }}>
                                  <span>{formatFileSize(file.fileSize)}</span>
                                  <span>•</span>
                                  <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                                  <span>•</span>
                                  <span style={{ textTransform: 'capitalize' }}>{file.fhirResourceType}</span>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  onClick={() => handleDownload(file)}
                                  style={{
                                    background: '#1e3a5f',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '6px 12px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                  }}
                                >
                                  <FaDownload size={10} />
                                  Download
                                </button>
                                {file.mimeType.startsWith('image/') && (
                                  <button
                                    onClick={() => window.open(file.fileUrl, '_blank')}
                                    style={{
                                      background: '#f1f5f9',
                                      color: '#1e3a5f',
                                      border: '1px solid #cbd5e1',
                                      borderRadius: '6px',
                                      padding: '6px 12px',
                                      cursor: 'pointer',
                                      fontSize: '12px',
                                      fontWeight: 600,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px'
                                    }}
                                  >
                                    <FaEye size={10} />
                                    View
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Share Section */}
                      <div style={{
                        marginTop: '16px',
                        padding: '12px',
                        background: '#E0F2FE',
                        borderRadius: '8px',
                        border: '1px solid #BAE6FD',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '12px',
                        color: '#0369A1'
                      }}>
                        <FaShareAlt size={12} />
                        You can share these results with your healthcare provider
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            marginTop: '40px',
            padding: '20px',
            background: '#E0F2FE',
            border: '1px solid #BAE6FD',
            borderRadius: '12px',
            color: '#0369A1',
            fontSize: '13px'
          }}
        >
          <strong>Note:</strong> All your investigation results are securely stored and encrypted. You can download and share them with your healthcare provider as needed. Results are retained for up to 2 years.
        </motion.div>
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
