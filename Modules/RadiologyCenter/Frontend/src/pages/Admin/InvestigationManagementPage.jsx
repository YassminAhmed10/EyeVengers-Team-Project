// src/pages/Admin/InvestigationManagementPage.jsx
// Admin page to manage investigation status

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaHourglassStart, FaClock, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import { appointmentService } from '../../services/appointmentService';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function InvestigationManagementPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('Upcoming');

  const statusStages = [
    { value: 'Upcoming', label: 'Upcoming', icon: FaHourglassStart, color: '#3b82f6' },
    { value: 'In Progress', label: 'In Progress', icon: FaClock, color: '#f59e0b' },
    { value: 'Done', label: 'Done', icon: FaCheckCircle, color: '#10b981' }
  ];

  useEffect(() => {
    loadAppointments();
  }, [selectedStatus]);

  const loadAppointments = async () => {
    setLoading(true);
    const result = await appointmentService.getAppointments('Accepted', selectedStatus);
    if (result.success) {
      setAppointments(result.data);
    }
    setLoading(false);
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    const result = await appointmentService.updateInvestigationStatus(appointmentId, newStatus);
    if (result.success) {
      await loadAppointments();
      alert(`Status updated to ${newStatus}`);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading investigations...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', background: '#f5f7fa', minHeight: '100vh' }}>
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>
          Investigation Management
        </h1>
        <p style={{ color: '#6f86a3', marginBottom: 32 }}>
          Track and update investigation statuses
        </p>
      </motion.div>

      {/* Status Tabs */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ delay: 0.1 }}
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 32,
          overflowX: 'auto'
        }}
      >
        {statusStages.map((stage) => {
          const Icon = stage.icon;
          return (
            <motion.button
              key={stage.value}
              onClick={() => setSelectedStatus(stage.value)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '12px 24px',
                background: selectedStatus === stage.value ? stage.color : 'white',
                border: selectedStatus === stage.value ? 'none' : `1px solid ${stage.color}`,
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                color: selectedStatus === stage.value ? 'white' : stage.color,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} /> {stage.label}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Investigations Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
        {appointments.map((apt, idx) => (
          <motion.div
            key={apt.id}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ delay: idx * 0.05 }}
            style={{
              background: 'white',
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              borderLeft: `4px solid ${statusStages.find(s => s.value === apt.investigationStatus)?.color || '#ccc'}`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
                  {apt.patientName}
                </h3>
                <p style={{ fontSize: 13, color: '#6f86a3', margin: '4px 0 0' }}>
                  {apt.serviceName}
                </p>
              </div>
              <span style={{
                fontSize: 12,
                fontWeight: 600,
                background: '#f0f0f0',
                color: '#666',
                padding: '4px 12px',
                borderRadius: 20
              }}>
                ID: {apt.id}
              </span>
            </div>

            <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#6f86a3', fontWeight: 500 }}>Current Status:</span>
                <span style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: statusStages.find(s => s.value === apt.investigationStatus)?.color,
                  background: statusStages.find(s => s.value === apt.investigationStatus)?.color ? `${statusStages.find(s => s.value === apt.investigationStatus)?.color}15` : '#f0f0f0',
                  padding: '4px 12px',
                  borderRadius: 6
                }}>
                  {apt.investigationStatus}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#6f86a3' }}>
                <strong>Date:</strong> {new Date(apt.slotDateTime).toLocaleDateString()}
              </div>
              <div style={{ fontSize: 12, color: '#6f86a3' }}>
                <strong>Results:</strong> {apt.resultCount} uploaded
              </div>
            </div>

            {/* Status Progression */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 20,
              padding: '12px',
              background: '#f8fafc',
              borderRadius: 8
            }}>
              {statusStages.map((stage, idx) => (
                <div key={stage.value} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: apt.investigationStatus === stage.value || 
                                 (apt.investigationStatus === 'Done' && stage.value !== 'Done') ? stage.color : '#e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'white'
                  }}>
                    {idx + 1}
                  </div>
                  {idx < statusStages.length - 1 && (
                    <div style={{
                      flex: 1,
                      height: 2,
                      background: apt.investigationStatus === 'Done' || 
                                  (apt.investigationStatus === 'In Progress' && idx < 1) ? stage.color : '#e5e7eb'
                    }} />
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'grid', gap: 8 }}>
              {apt.investigationStatus !== 'Done' && (
                <motion.button
                  onClick={() => {
                    const nextStatus = apt.investigationStatus === 'Upcoming' ? 'In Progress' : 'Done';
                    handleStatusChange(apt.id, nextStatus);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: '10px',
                    background: '#1f6bff',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <FaArrowRight size={12} />
                  {apt.investigationStatus === 'Upcoming' ? 'Start Investigation' : 'Complete Investigation'}
                </motion.button>
              )}

              {apt.investigationStatus === 'In Progress' && (
                <motion.button
                  onClick={() => handleStatusChange(apt.id, 'Upcoming')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: '10px',
                    background: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#666',
                    cursor: 'pointer'
                  }}
                >
                  Revert to Upcoming
                </motion.button>
              )}

              {apt.investigationStatus === 'Done' && (
                <div style={{
                  padding: '10px',
                  background: '#d1fae5',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#065f46',
                  textAlign: 'center'
                }}>
                  ✓ Investigation Complete
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {appointments.length === 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '60px 40px',
              background: 'white',
              borderRadius: 16,
              color: '#6f86a3'
            }}
          >
            <p style={{ fontSize: 16 }}>No investigations with status: {selectedStatus}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
