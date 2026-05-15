import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaUser,
  FaCalendar,
  FaStethoscope,
  FaPhone,
  FaEnvelope,
  FaClipboardList,
  FaChevronRight,
  FaSpinner
} from 'react-icons/fa';
import axios from 'axios';

const RADIOLOGY_API = 'http://localhost:5301/api';

export default function PendingAppointmentRequestsPage() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch pending requests
  const fetchPendingRequests = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`${RADIOLOGY_API}/appointments/pending-requests?pageNumber=${pageNumber}&pageSize=10`);

      if (response.data.success) {
        setPendingRequests(response.data.data || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        setError(response.data.message || 'Failed to fetch pending requests');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching pending requests');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, [pageNumber]);

  // Approve appointment
  const handleApprove = async (appointmentId) => {
    setActionInProgress(true);

    try {
      const response = await axios.post(`${RADIOLOGY_API}/appointments/${appointmentId}/approve`, {
        adminNotes: selectedAppointment?.adminNotes || ''
      });

      if (response.data.success) {
        // Show success message
        alert('Appointment approved successfully');
        
        // Refresh the list
        setSelectedAppointment(null);
        fetchPendingRequests();
      } else {
        setError(response.data.message || 'Failed to approve appointment');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error approving appointment');
      console.error('Error:', err);
    } finally {
      setActionInProgress(false);
    }
  };

  // Reject appointment
  const handleReject = async (appointmentId, rejectionReason) => {
    setActionInProgress(true);

    try {
      const response = await axios.post(`${RADIOLOGY_API}/appointments/${appointmentId}/reject`, {
        rejectionReason: rejectionReason || 'No reason provided'
      });

      if (response.data.success) {
        alert('Appointment rejected successfully');
        setSelectedAppointment(null);
        fetchPendingRequests();
      } else {
        setError(response.data.message || 'Failed to reject appointment');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error rejecting appointment');
      console.error('Error:', err);
    } finally {
      setActionInProgress(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Pending':
        return { bg: '#FEF3C7', text: '#92400E', icon: FaClock };
      case 'Requested by Doctor':
        return { bg: '#DBEAFE', text: '#1E40AF', icon: FaStethoscope };
      default:
        return { bg: '#F3F4F6', text: '#374151', icon: FaClock };
    }
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
            <FaClipboardList size={32} />
            Pending Appointment Requests
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Review and manage appointment requests from patients
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

        {/* Requests List */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <FaSpinner size={48} color="#1e3a5f" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : pendingRequests.length === 0 ? (
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
            <FaClock size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>
              No Pending Requests
            </h2>
            <p style={{ color: '#94a3b8' }}>All appointment requests have been processed</p>
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {pendingRequests.map((appointment, index) => {
              const statusColor = getStatusBadgeColor(appointment.status);
              const StatusIcon = statusColor.icon;

              return (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedAppointment(appointment)}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    border: selectedAppointment?.id === appointment.id ? '2px solid #1e3a5f' : '1px solid #e2e8f0',
                    transition: 'all 0.3s ease'
                  }}
                  whileHover={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '16px', alignItems: 'center' }}>
                    {/* Patient Info */}
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>
                        Patient
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaUser size={14} color="#1e3a5f" />
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                            {appointment.patient?.firstName} {appointment.patient?.lastName}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            ID: {appointment.patient?.id}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Service Info */}
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>
                        Service
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                        {appointment.radiologyService?.name || 'N/A'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {appointment.slot?.date && new Date(appointment.slot.date).toLocaleDateString()} {appointment.slot?.time}
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>
                        Status
                      </div>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: statusColor.bg,
                        color: statusColor.text,
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 600
                      }}>
                        <StatusIcon size={12} />
                        {appointment.status}
                      </div>
                    </div>

                    {/* Request Date */}
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>
                        Requested
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                        {new Date(appointment.createdAt).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {new Date(appointment.createdAt).toLocaleTimeString()}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAppointment(appointment);
                      }}
                      style={{
                        background: '#1e3a5f',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#152847'}
                      onMouseLeave={(e) => e.target.style.background = '#1e3a5f'}
                    >
                      Review <FaChevronRight size={10} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '32px'
          }}>
            <button
              onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
              disabled={pageNumber === 1}
              style={{
                padding: '8px 16px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                cursor: pageNumber === 1 ? 'not-allowed' : 'pointer',
                background: pageNumber === 1 ? '#f1f5f9' : 'white',
                opacity: pageNumber === 1 ? 0.5 : 1
              }}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setPageNumber(page)}
                style={{
                  padding: '8px 12px',
                  border: page === pageNumber ? '2px solid #1e3a5f' : '1px solid #cbd5e1',
                  borderRadius: '8px',
                  background: page === pageNumber ? '#1e3a5f' : 'white',
                  color: page === pageNumber ? 'white' : '#1e3a5f',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setPageNumber(Math.min(totalPages, pageNumber + 1))}
              disabled={pageNumber === totalPages}
              style={{
                padding: '8px 16px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                cursor: pageNumber === totalPages ? 'not-allowed' : 'pointer',
                background: pageNumber === totalPages ? '#f1f5f9' : 'white',
                opacity: pageNumber === totalPages ? 0.5 : 1
              }}
            >
              Next
            </button>
          </div>
        )}

        {/* Review Modal */}
        <AnimatePresence>
          {selectedAppointment && (
            <AppointmentReviewModal
              appointment={selectedAppointment}
              onClose={() => setSelectedAppointment(null)}
              onApprove={() => handleApprove(selectedAppointment.id)}
              onReject={(reason) => handleReject(selectedAppointment.id, reason)}
              isLoading={actionInProgress}
            />
          )}
        </AnimatePresence>
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

// Appointment Review Modal Component
function AppointmentReviewModal({ appointment, onClose, onApprove, onReject, isLoading }) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '24px'
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '20px',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}
      >
        {/* Modal Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a5f, #2d5a8c)',
          color: 'white',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
            Review Appointment Request
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc',
          padding: '0 24px'
        }}>
          {['details', 'patient', 'notes'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '16px 24px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                color: activeTab === tab ? '#1e3a5f' : '#64748b',
                borderBottom: activeTab === tab ? '2px solid #1e3a5f' : 'none',
                fontSize: '14px',
                textTransform: 'capitalize'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Modal Content */}
        <div style={{ padding: '24px' }}>
          {activeTab === 'details' && (
            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <DetailField label="Appointment ID" value={appointment.id} />
                <DetailField label="Status" value={appointment.status} />
                <DetailField label="Service" value={appointment.radiologyService?.name || 'N/A'} />
                <DetailField label="Date" value={new Date(appointment.slot?.date).toLocaleDateString()} />
                <DetailField label="Time" value={appointment.slot?.time || 'N/A'} />
                <DetailField label="Investigation Status" value={appointment.investigationStatus} />
              </div>
            </div>
          )}

          {activeTab === 'patient' && (
            <div style={{ display: 'grid', gap: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e3a5f', margin: '0 0 16px 0' }}>
                Patient Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <DetailField label="Name" value={`${appointment.patient?.firstName} ${appointment.patient?.lastName}`} />
                <DetailField label="National ID" value={appointment.patient?.nationalId || 'N/A'} />
                <DetailField label="Date of Birth" value={appointment.patient?.dateOfBirth ? new Date(appointment.patient.dateOfBirth).toLocaleDateString() : 'N/A'} />
                <DetailField label="Gender" value={appointment.patient?.gender || 'N/A'} />
                <DetailField label="Phone" value={appointment.patient?.phone || 'N/A'} />
                <DetailField label="Email" value={appointment.patient?.email || 'N/A'} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Address
                </label>
                <div style={{ fontSize: '14px', color: '#1e293b', padding: '12px', background: '#f1f5f9', borderRadius: '8px' }}>
                  {appointment.patient?.address || 'N/A'}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '8px' }}>
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes for approval..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '8px' }}>
                  Rejection Reason (if rejecting)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '24px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            disabled={isLoading}
            style={{
              padding: '12px 24px',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              background: 'white',
              color: '#1e3a5f',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              opacity: isLoading ? 0.5 : 1
            }}
          >
            Close
          </button>
          <button
            onClick={() => onReject(rejectionReason)}
            disabled={isLoading}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              background: '#EF4444',
              color: 'white',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading && <FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} />}
            Reject
          </button>
          <button
            onClick={() => onApprove()}
            disabled={isLoading}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              background: '#10B981',
              color: 'white',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading && <FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} />}
            Approve
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Detail Field Component
function DetailField({ label, value }) {
  return (
    <div>
      <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
        {label}
      </label>
      <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', padding: '12px', background: '#f1f5f9', borderRadius: '8px' }}>
        {value || 'N/A'}
      </div>
    </div>
  );
}
