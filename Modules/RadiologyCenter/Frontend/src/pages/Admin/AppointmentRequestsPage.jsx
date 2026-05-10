// src/pages/Admin/AppointmentRequestsPage.jsx
// Admin page to manage pending appointment requests

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaComments, FaClock, FaPhone, FaEnvelope } from 'react-icons/fa';
import { appointmentService } from '../../services/appointmentService';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function AppointmentRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    const result = await appointmentService.getAppointments('Pending');
    if (result.success) {
      setRequests(result.data);
    }
    setLoading(false);
  };

  const handleAccept = async (appointmentId) => {
    const result = await appointmentService.acceptAppointment(appointmentId, adminNotes);
    if (result.success) {
      await loadRequests();
      setAdminNotes('');
      setSelectedRequest(null);
      alert('Appointment accepted!');
    }
  };

  const handleReject = async (appointmentId) => {
    const result = await appointmentService.rejectAppointment(appointmentId, rejectReason);
    if (result.success) {
      await loadRequests();
      setRejectReason('');
      setShowRejectModal(false);
      alert('Appointment rejected!');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading requests...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', background: '#f5f7fa', minHeight: '100vh' }}>
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>
          Appointment Requests
        </h1>
        <p style={{ color: '#6f86a3', marginBottom: 32 }}>
          {requests.length} pending requests
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: requests.length > 0 ? '1fr 1fr' : '1fr', gap: 32 }}>
        {/* Requests List */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.1 }}>
          <div style={{ display: 'grid', gap: 16 }}>
            {requests.map((request) => (
              <motion.div
                key={request.id}
                onClick={() => setSelectedRequest(request)}
                whileHover={{ scale: 1.02 }}
                style={{
                  background: selectedRequest?.id === request.id ? '#1f6bff' : 'white',
                  borderRadius: 16,
                  padding: 20,
                  cursor: 'pointer',
                  border: selectedRequest?.id === request.id ? 'none' : '1px solid #e2e8f0',
                  boxShadow: selectedRequest?.id === request.id ? '0 10px 30px rgba(31,107,255,0.3)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: selectedRequest?.id === request.id ? 'white' : '#1a1a2e',
                      margin: 0
                    }}>
                      {request.patientName}
                    </h3>
                    <p style={{
                      fontSize: 13,
                      color: selectedRequest?.id === request.id ? 'rgba(255,255,255,0.7)' : '#6f86a3',
                      margin: '4px 0 0'
                    }}>
                      {request.serviceName}
                    </p>
                  </div>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    background: selectedRequest?.id === request.id ? 'rgba(255,255,255,0.2)' : '#fff3cd',
                    color: selectedRequest?.id === request.id ? 'white' : '#856404',
                    padding: '4px 12px',
                    borderRadius: 20
                  }}>
                    {request.priority}
                  </span>
                </div>

                <div style={{ display: 'grid', gap: 8, fontSize: 13 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: selectedRequest?.id === request.id ? 'rgba(255,255,255,0.8)' : '#6f86a3' }}>
                    <FaPhone size={12} />
                    {request.patientPhone}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: selectedRequest?.id === request.id ? 'rgba(255,255,255,0.8)' : '#6f86a3' }}>
                    <FaEnvelope size={12} />
                    {request.patientEmail}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: selectedRequest?.id === request.id ? 'rgba(255,255,255,0.8)' : '#6f86a3' }}>
                    <FaClock size={12} />
                    {new Date(request.slotDateTime).toLocaleDateString()} {new Date(request.slotDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))}
            {requests.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                background: 'white',
                borderRadius: 16,
                color: '#6f86a3'
              }}>
                No pending requests
              </div>
            )}
          </div>
        </motion.div>

        {/* Details & Actions */}
        {selectedRequest && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.2 }}>
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 32,
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
            }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', marginBottom: 24 }}>
                Request Details
              </h2>

              <div style={{ display: 'grid', gap: 16, marginBottom: 32 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#6f86a3' }}>Patient Name</label>
                  <p style={{ fontSize: 16, color: '#1a1a2e', marginTop: 4 }}>{selectedRequest.patientName}</p>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#6f86a3' }}>Service</label>
                  <p style={{ fontSize: 16, color: '#1a1a2e', marginTop: 4 }}>{selectedRequest.serviceName}</p>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#6f86a3' }}>Appointment Date & Time</label>
                  <p style={{ fontSize: 16, color: '#1a1a2e', marginTop: 4 }}>
                    {new Date(selectedRequest.slotDateTime).toLocaleDateString()} at {new Date(selectedRequest.slotDateTime).toLocaleTimeString()}
                  </p>
                </div>
                {selectedRequest.notes && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#6f86a3' }}>Patient Notes</label>
                    <p style={{ fontSize: 14, color: '#1a1a2e', marginTop: 4, background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                      {selectedRequest.notes}
                    </p>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6f86a3', display: 'block', marginBottom: 8 }}>
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes for the patient (e.g., special instructions)"
                  style={{
                    width: '100%',
                    minHeight: 100,
                    padding: 12,
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <motion.button
                  onClick={() => handleAccept(selectedRequest.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '12px 24px',
                    background: '#10b981',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  <FaCheckCircle size={16} /> Accept
                </motion.button>
                <motion.button
                  onClick={() => setShowRejectModal(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '12px 24px',
                    background: '#ef4444',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  <FaTimesCircle size={16} /> Reject
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              background: 'white',
              borderRadius: 16,
              padding: 32,
              maxWidth: 400,
              width: '90%'
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', marginBottom: 16 }}>
              Reject Appointment
            </h2>
            <p style={{ color: '#6f86a3', marginBottom: 16 }}>
              Please provide a reason for rejecting this appointment.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              style={{
                width: '100%',
                minHeight: 100,
                padding: 12,
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 14,
                marginBottom: 16,
                boxSizing: 'border-box'
              }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button
                onClick={() => setShowRejectModal(false)}
                style={{
                  padding: '12px',
                  background: '#f0f0f0',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedRequest.id)}
                style={{
                  padding: '12px',
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: 'white'
                }}
              >
                Confirm Rejection
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
