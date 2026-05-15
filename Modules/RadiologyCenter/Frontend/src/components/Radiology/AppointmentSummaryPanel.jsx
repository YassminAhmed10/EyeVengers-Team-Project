/**
 * AppointmentSummaryPanel Component
 * ==================================
 * CRITICAL COMPONENT - Dynamically displays appointment details
 * Works for BOTH user flows:
 * - Shows manually entered patient data for Direct Radiology Patients
 * - Shows auto-filled patient data for Clinic System Patients
 * 
 * Features:
 * - Real-time updates
 * - Data source badge (imported vs manual)
 * - Complete patient info display
 * - Service details with pricing
 * - Date/time confirmation
 * - Booking reference
 * - Validation status
 */

import { motion } from 'framer-motion';
import { 
  FaRegCalendarCheck, FaPhone, FaEnvelope, FaVenusMars, FaBirthdayCake, 
  FaIdCard, FaHome, FaCheckCircle, FaCloudDownloadAlt, FaUser, 
  FaExclamationTriangle, FaLock
} from 'react-icons/fa';

const AppointmentSummaryPanel = ({ 
  patientInfo, 
  selectedService, 
  selectedDate, 
  selectedTime, 
  bookingReference, 
  isFromClinic = false,
  isMissingRequired = false,
  formatTime,
  lang = 'en'
}) => {
  const dataSourceBadge = isFromClinic ? {
    icon: FaCloudDownloadAlt,
    text: 'Data Imported from Clinic System',
    color: '#0ea5e9',
    bgColor: '#e0f2fe',
    borderColor: '#bae6fd'
  } : {
    icon: FaUser,
    text: 'Manually Entered',
    color: '#8b5cf6',
    bgColor: '#f3e8ff',
    borderColor: '#e9d5ff'
  };

  const calculateAge = (dob) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age > 0 ? age : null;
  };

  const age = patientInfo.age || calculateAge(patientInfo.dateOfBirth);
  const SourceIcon = dataSourceBadge.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      style={{ 
        background: 'white', 
        borderRadius: 24, 
        padding: 28, 
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative'
      }}
    >
      {/* Data Source Badge */}
      <div style={{
        background: dataSourceBadge.bgColor,
        border: `2px solid ${dataSourceBadge.borderColor}`,
        borderRadius: '12px',
        padding: '10px 14px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '12px',
        fontWeight: 500,
        color: dataSourceBadge.color
      }}>
        <SourceIcon size={14} />
        {dataSourceBadge.text}
        {isFromClinic && <FaLock size={12} style={{ marginLeft: 'auto' }} title="Data locked - read-only" />}
      </div>

      <h2 style={{ 
        fontSize: 20, 
        fontWeight: 700, 
        color: '#1e3a5f', 
        marginBottom: 24, 
        paddingBottom: 16, 
        borderBottom: '2px solid #e2e8f0', 
        display: 'flex', 
        alignItems: 'center', 
        gap: 8 
      }}>
        <FaRegCalendarCheck /> Appointment Summary
      </h2>

      {/* ===== PATIENT INFORMATION SECTION ===== */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ 
          fontSize: 11, 
          fontWeight: 700, 
          color: '#64748b', 
          textTransform: 'uppercase', 
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <FaUser size={12} />
          Patient Information {isFromClinic && '(from Clinic System)'}
        </div>
        <motion.div 
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          style={{ 
            background: isFromClinic ? '#e0f2fe' : '#f8fafc', 
            borderRadius: 16, 
            padding: 16, 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '10px 16px',
            border: isFromClinic ? '1px solid #bae6fd' : '1px solid #e2e8f0'
          }}
        >
          {/* Name */}
          <div>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: '4px' }}>Full Name</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
              {patientInfo.name || '—'}
              {!patientInfo.name && <span style={{ color: '#dc2626' }}> (required)</span>}
            </div>
          </div>

          {/* Patient ID */}
          <div>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: '4px' }}>Patient ID</div>
            <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#1e293b' }}>
              {patientInfo.id || '—'}
            </div>
          </div>

          {/* Phone */}
          <div>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FaPhone size={9} /> Phone
            </div>
            <div style={{ fontSize: 12, color: '#1e293b' }}>
              {patientInfo.phone || '—'}
              {!patientInfo.phone && <span style={{ color: '#dc2626' }}> (required)</span>}
            </div>
          </div>

          {/* Email */}
          <div>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FaEnvelope size={9} /> Email
            </div>
            <div style={{ fontSize: 12, color: '#1e293b' }}>
              {patientInfo.email || '—'}
              {!patientInfo.email && <span style={{ color: '#dc2626' }}> (required)</span>}
            </div>
          </div>

          {/* Gender */}
          <div>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FaVenusMars size={9} /> Gender
            </div>
            <div style={{ fontSize: 12, color: '#1e293b' }}>
              {patientInfo.gender || '—'}
              {!patientInfo.gender && <span style={{ color: '#dc2626' }}> (required)</span>}
            </div>
          </div>

          {/* Age */}
          <div>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FaBirthdayCake size={9} /> Age
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
              {age ? `${age} years` : '—'}
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: '4px' }}>Date of Birth</div>
            <div style={{ fontSize: 12, color: '#1e293b' }}>
              {patientInfo.dateOfBirth ? new Date(patientInfo.dateOfBirth).toLocaleDateString() : '—'}
              {!patientInfo.dateOfBirth && <span style={{ color: '#dc2626' }}> (required)</span>}
            </div>
          </div>

          {/* National ID */}
          <div>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FaIdCard size={9} /> National ID
            </div>
            <div style={{ fontSize: 12, color: '#1e293b' }}>
              {patientInfo.nationalId || '—'}
              {!patientInfo.nationalId && <span style={{ color: '#dc2626' }}> (required)</span>}
            </div>
          </div>

          {/* Address */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FaHome size={9} /> Address
            </div>
            <div style={{ fontSize: 12, color: '#1e293b', wordBreak: 'break-word' }}>
              {patientInfo.address || '—'}
              {!patientInfo.address && <span style={{ color: '#dc2626' }}> (required)</span>}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ===== RADIOLOGY SERVICE SECTION ===== */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 12 }}>
          Radiology Service
        </div>
        <motion.div 
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          style={{ 
            background: selectedService ? `${selectedService.color}10` : '#f8fafc', 
            borderRadius: 16, 
            padding: 16, 
            textAlign: 'center',
            border: selectedService ? `1px solid ${selectedService.color}30` : '1px solid #e2e8f0'
          }}
        >
          <div style={{ 
            fontSize: 18, 
            fontWeight: 700, 
            color: selectedService?.color || '#64748b', 
            marginBottom: 4 
          }}>
            {selectedService?.name || 'No test selected'}
            {!selectedService && <span style={{ color: '#dc2626' }}> (required)</span>}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
            {selectedService?.specialty || 'Please select a test from above'}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: selectedService?.color || '#64748b' }}>
            {selectedService?.range || '—'}
          </div>
          {selectedService && (
            <div style={{ fontSize: 11, color: '#64748b', marginTop: '8px' }}>
              ⏱ Duration: {selectedService.duration} minutes
            </div>
          )}
        </motion.div>
      </div>

      {/* ===== APPOINTMENT DETAILS SECTION ===== */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 12 }}>
          Appointment Details
        </div>
        <motion.div 
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          style={{ background: '#f0fdf4', borderRadius: 16, padding: 16, textAlign: 'center', border: '1px solid #bbf7d0' }}
        >
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
            {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
            {!selectedDate && <span style={{ color: '#dc2626' }}> (required)</span>}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1e3a5f', marginBottom: 8 }}>
            {selectedTime ? formatTime(selectedTime) : '— —'}
            {!selectedTime && <span style={{ color: '#dc2626', fontSize: '14px' }}> (required)</span>}
          </div>
          {selectedService && (
            <div style={{ fontSize: 11, color: '#10b981' }}>
              Duration: {selectedService.duration} minutes
            </div>
          )}
        </motion.div>
      </div>

      {/* Booking Reference */}
      <div style={{ background: '#1e3a5f', borderRadius: 10, padding: 12, textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>Booking Reference</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'white', fontFamily: 'monospace', letterSpacing: '2px' }}>
          {bookingReference}
        </div>
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
          Use this reference for all future inquiries
        </div>
      </div>

      {/* Validation Warning */}
      {isMissingRequired && (
        <div style={{
          background: '#fef3c7',
          border: '1px solid #fde68a',
          borderRadius: '10px',
          padding: '12px',
          fontSize: '12px',
          color: '#b45309',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px'
        }}>
          <FaExclamationTriangle size={14} />
          Please complete all required fields to proceed
        </div>
      )}

      {/* Data Import Indicator for Clinic Patients */}
      {isFromClinic && (
        <div style={{
          background: '#dbeafe',
          borderRadius: '8px',
          padding: '10px',
          fontSize: '11px',
          color: '#0369a1',
          textAlign: 'center'
        }}>
          ✓ Patient data successfully imported from Clinic System via FHIR/HL7
        </div>
      )}
    </motion.div>
  );
};

export default AppointmentSummaryPanel;
