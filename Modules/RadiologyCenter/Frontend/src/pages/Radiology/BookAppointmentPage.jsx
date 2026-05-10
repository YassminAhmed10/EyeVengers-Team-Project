// src/pages/Radiology/BookAppointmentPage.jsx
// Patient page to book radiology appointments

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCalendar, FaClock, FaStethoscope, FaCheckCircle, FaArrowRight, FaUser, FaEnvelope, FaPhone, FaIdCard } from 'react-icons/fa';
import { appointmentService } from '../../services/appointmentService';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function BookAppointmentPage() {
  const [services, setServices] = useState([
    { id: 1, name: 'Chest X-Ray', description: 'X-ray imaging of the chest' },
    { id: 2, name: 'CT Scan', description: 'Computed tomography scan' },
    { id: 3, name: 'MRI Scan', description: 'Magnetic resonance imaging' },
    { id: 4, name: 'Ultrasound', description: 'Ultrasound imaging' },
    { id: 5, name: 'Mammography', description: 'Breast imaging' },
    { id: 6, name: 'Dental X-Ray', description: 'Dental radiography' }
  ]);

  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState(1); // 1: Service, 2: DateTime, 3: Confirmation
  const [loading, setLoading] = useState(false);
  const [appointmentId, setAppointmentId] = useState(null);

  // Get patient info from localStorage - with proper fallbacks
  const patientId = localStorage.getItem('radiologyPatientId') || '';
  const patientFirstName = localStorage.getItem('radiologyPatientFirstName') || '';
  const patientLastName = localStorage.getItem('radiologyPatientLastName') || '';
  const patientName = patientFirstName && patientLastName ? `${patientFirstName} ${patientLastName}` : (localStorage.getItem('radiologyPatientName') || 'Guest Patient');
  const patientEmail = localStorage.getItem('radiologyPatientEmail') || 'Not provided';
  const patientPhone = localStorage.getItem('radiologyPatientPhone') || 'Not provided';
  const patientGender = localStorage.getItem('radiologyPatientGender') || 'Not specified';
  const patientAddress = localStorage.getItem('radiologyPatientAddress') || 'Not provided';
  const patientAge = localStorage.getItem('patientDateOfBirth') ? new Date().getFullYear() - new Date(localStorage.getItem('patientDateOfBirth')).getFullYear() : (localStorage.getItem('radiologyPatientAge') || 'N/A');

  // Generate available time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleBookAppointment = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !patientId) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    const slotDateTime = new Date(`${selectedDate}T${selectedTime}`);

    // Save/Update patient data to localStorage for profile page
    localStorage.setItem('radiologyPatientFirstName', patientFirstName);
    localStorage.setItem('radiologyPatientLastName', patientLastName);
    localStorage.setItem('radiologyPatientEmail', patientEmail);
    localStorage.setItem('radiologyPatientPhone', patientPhone);
    localStorage.setItem('radiologyPatientGender', patientGender);
    localStorage.setItem('radiologyPatientAddress', patientAddress);
    
    // Convert age to birthDate if available (use patientAge if it's already a number)
    if (typeof patientAge === 'number' && patientAge > 0) {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - patientAge);
      localStorage.setItem('patientDateOfBirth', birthDate.toISOString().split('T')[0]);
    }

    const result = await appointmentService.createAppointment({
      patientId,
      patientName,
      patientEmail,
      patientPhone,
      patientAge: typeof patientAge === 'number' ? patientAge : (patientAge !== 'N/A' ? parseInt(patientAge) : null),
      patientGender,
      radiologyServiceId: selectedService.id,
      slotDateTime: slotDateTime.toISOString(),
      priority: 'Normal',
      requestingDoctor: 'Self-Referral',
      notes: notes || 'No additional notes',
      status: 'Pending'
    });

    if (result.success) {
      if (result.data?.id) setAppointmentId(result.data.id);
      setStep(4); // Show success
      setTimeout(() => {
        setStep(1);
        setSelectedService(null);
        setSelectedDate('');
        setSelectedTime('');
        setNotes('');
        setAppointmentId(null);
      }, 3000);
    } else {
      alert('Failed to book appointment. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px', background: '#f5f7fa', minHeight: '100vh' }}>
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>
          Book a Radiology Appointment
        </h1>
        <p style={{ color: '#6f86a3', marginBottom: 32 }}>
          Select a service and choose your preferred date and time
        </p>
      </motion.div>

      {/* Step Indicator */}
      {step < 4 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.1 }}
          style={{
            display: 'flex',
            gap: 16,
            marginBottom: 32,
            justifyContent: 'center'
          }}
        >
          {[1, 2, 3].map((s) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: s <= step ? '#1f6bff' : '#e5e7eb',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 16
              }}>
                {s < step ? '✓' : s}
              </div>
              <span style={{
                fontSize: 13,
                fontWeight: 600,
                color: s <= step ? '#1f6bff' : '#9ca3af'
              }}>
                {s === 1 ? 'Service' : s === 2 ? 'Date & Time' : 'Confirm'}
              </span>
              {s < 3 && (
                <div style={{
                  width: 40,
                  height: 2,
                  background: s < step ? '#1f6bff' : '#e5e7eb'
                }} />
              )}
            </div>
          ))}
        </motion.div>
      )}

      {/* Step 1: Service Selection */}
      {step === 1 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.2 }}
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
            marginBottom: 32
          }}>
            {services.map((service) => (
              <motion.div
                key={service.id}
                onClick={() => {
                  setSelectedService(service);
                  setStep(2);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: 24,
                  background: 'white',
                  border: '2px solid #e2e8f0',
                  borderRadius: 12,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'center'
                }}
              >
                <FaStethoscope size={32} style={{ margin: '0 auto 16px', color: '#1f6bff' }} />
                <h3 style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#1a1a2e',
                  margin: 0,
                  marginBottom: 8
                }}>
                  {service.name}
                </h3>
                <p style={{
                  fontSize: 13,
                  color: '#6f86a3',
                  margin: 0
                }}>
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Step 2: Date & Time Selection */}
      {step === 2 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.2 }}
        >
          <div style={{
            maxWidth: 600,
            margin: '0 auto'
          }}>
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 32,
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              marginBottom: 32
            }}>
              <h2 style={{
                fontSize: 20,
                fontWeight: 700,
                color: '#1a1a2e',
                marginBottom: 8
              }}>
                {selectedService?.name}
              </h2>
              <p style={{
                fontSize: 13,
                color: '#6f86a3',
                marginBottom: 24
              }}>
                Choose your preferred date and time
              </p>

              {/* Date Input */}
              <div style={{ marginBottom: 24 }}>
                <label style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#6f86a3',
                  display: 'block',
                  marginBottom: 8
                }}>
                  <FaCalendar size={12} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={getMinDate()}
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

              {/* Time Slots */}
              {selectedDate && (
                <div style={{ marginBottom: 24 }}>
                  <label style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#6f86a3',
                    display: 'block',
                    marginBottom: 8
                  }}>
                    <FaClock size={12} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Select Time
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 8
                  }}>
                    {timeSlots.map((time) => (
                      <motion.button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          padding: 10,
                          background: selectedTime === time ? '#1f6bff' : '#f8fafc',
                          border: selectedTime === time ? 'none' : '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 600,
                          color: selectedTime === time ? 'white' : '#1a1a2e',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {time}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div style={{ marginBottom: 24 }}>
                <label style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#6f86a3',
                  display: 'block',
                  marginBottom: 8
                }}>
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional information for the radiologist..."
                  style={{
                    width: '100%',
                    minHeight: 80,
                    padding: 12,
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    fontSize: 13,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12
              }}>
                <motion.button
                  onClick={() => setStep(1)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: '12px 24px',
                    background: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#666',
                    cursor: 'pointer'
                  }}
                >
                  Back
                </motion.button>
                <motion.button
                  onClick={() => selectedDate && selectedTime ? setStep(3) : alert('Please select date and time')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: '12px 24px',
                    background: '#1f6bff',
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
                  <FaArrowRight size={12} /> Continue
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.2 }}
        >
          <div style={{
            maxWidth: 800,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 24
          }}>
            {/* Left Panel: Appointment Details */}
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
            }}>
              <h3 style={{
                fontSize: 16,
                fontWeight: 700,
                color: '#0070b8',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <FaStethoscope /> Appointment Details
              </h3>

              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ paddingBottom: 12, borderBottom: '1px solid rgba(0,112,184,0.1)' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Service</span>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#0070b8', margin: '4px 0 0' }}>
                    {selectedService?.name}
                  </p>
                </div>

                <div style={{ paddingBottom: 12, borderBottom: '1px solid rgba(0,112,184,0.1)' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Date</span>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', margin: '4px 0 0' }}>
                    {new Date(`${selectedDate}T${selectedTime}`).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>

                <div style={{ paddingBottom: 12, borderBottom: '1px solid rgba(0,112,184,0.1)' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Time</span>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', margin: '4px 0 0' }}>
                    {selectedTime}
                  </p>
                </div>

                {notes && (
                  <div style={{ paddingBottom: 12, borderBottom: '1px solid rgba(0,112,184,0.1)' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Notes</span>
                    <p style={{ fontSize: 13, color: '#1a1a2e', margin: '4px 0 0', lineHeight: 1.5 }}>
                      {notes}
                    </p>
                  </div>
                )}

                <div style={{ background: '#e8f1ff', borderRadius: 8, padding: 12, marginTop: 8 }}>
                  <p style={{ fontSize: 12, color: '#0070b8', fontWeight: 600, margin: 0 }}>
                    Status: Pending Admin Approval
                  </p>
                </div>
              </div>
            </div>

            {/* Right Panel: Patient Information */}
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
            }}>
              <h3 style={{
                fontSize: 16,
                fontWeight: 700,
                color: '#0070b8',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <FaUser /> Patient Information
              </h3>

              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ paddingBottom: 12, borderBottom: '1px solid rgba(0,112,184,0.1)' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Full Name</span>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FaUser size={12} style={{ color: '#0070b8' }} />
                    {patientName}
                  </p>
                </div>

                <div style={{ paddingBottom: 12, borderBottom: '1px solid rgba(0,112,184,0.1)' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Email</span>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FaEnvelope size={12} style={{ color: '#0070b8' }} />
                    {patientEmail}
                  </p>
                </div>

                <div style={{ paddingBottom: 12, borderBottom: '1px solid rgba(0,112,184,0.1)' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Phone</span>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FaPhone size={12} style={{ color: '#0070b8' }} />
                    {patientPhone}
                  </p>
                </div>

                <div style={{ paddingBottom: 12, borderBottom: '1px solid rgba(0,112,184,0.1)' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Patient ID</span>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FaIdCard size={12} style={{ color: '#0070b8' }} />
                    {patientId}
                  </p>
                </div>

                <div style={{ paddingBottom: 12, borderBottom: '1px solid rgba(0,112,184,0.1)' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Age</span>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', margin: '4px 0 0' }}>
                    {typeof patientAge === 'number' ? `${patientAge} years` : patientAge}
                  </p>
                </div>

                <div style={{ paddingBottom: 12, borderBottom: '1px solid rgba(0,112,184,0.1)' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Gender</span>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', margin: '4px 0 0' }}>
                    {patientGender}
                  </p>
                </div>

                <div style={{ paddingBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Address</span>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', margin: '4px 0 0' }}>
                    {patientAddress}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            maxWidth: 800,
            margin: '24px auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12
          }}>
            <motion.button
              onClick={() => setStep(2)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: '12px 24px',
                background: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                color: '#666',
                cursor: 'pointer'
              }}
            >
              Back
            </motion.button>
            <motion.button
              onClick={handleBookAppointment}
              disabled={loading}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              style={{
                padding: '12px 24px',
                background: loading ? '#ccc' : '#0070b8',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.2 }}
        >
          <div style={{
            maxWidth: 600,
            margin: '0 auto'
          }}>
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 60,
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              textAlign: 'center'
            }}>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5 }}
              >
                <FaCheckCircle size={64} style={{ color: '#10b981', margin: '0 auto 24px' }} />
              </motion.div>
              <h2 style={{
                fontSize: 24,
                fontWeight: 700,
                color: '#1a1a2e',
                margin: 0,
                marginBottom: 12
              }}>
                Appointment Booked Successfully!
              </h2>
              <p style={{
                fontSize: 14,
                color: '#6b7280',
                margin: 0,
                marginBottom: 24,
                lineHeight: 1.6
              }}>
                Your appointment request has been submitted to the admin. You'll receive a notification when the admin accepts or rejects your request.
              </p>
              
              {appointmentId && (
                <div style={{
                  background: '#e8f1ff',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 16
                }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', margin: 0, marginBottom: 4 }}>Appointment ID</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#0070b8', margin: 0 }}>
                    {appointmentId}
                  </p>
                </div>
              )}

              <p style={{
                fontSize: 12,
                color: '#9ca3af',
                margin: 0
              }}>
                Redirecting you back in a moment...
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
