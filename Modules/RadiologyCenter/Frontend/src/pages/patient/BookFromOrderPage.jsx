// src/pages/patient/BookFromOrderPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const RADIOLOGY_API = 'http://localhost:5301/api';
const CLINIC_API = 'http://localhost:5201/api';

export function BookFromOrderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state || {};

  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pre-filled from order
  const [orderId] = useState(orderData.orderId || null);
  const [patientId] = useState(orderData.patientId || localStorage.getItem('patientId'));
  const [patientName] = useState(orderData.patientName || localStorage.getItem('userName') || '');
  const [patientEmail] = useState(orderData.patientEmail || localStorage.getItem('userEmail') || '');
  const [testName] = useState(orderData.testName || '');
  const [testCode] = useState(orderData.testCode || '');

  // Auto-filled from database
  const [patientData, setPatientData] = useState({
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    insuranceCompany: '',
    insuranceId: ''
  });

  // Form fields
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [bookingNotes, setBookingNotes] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch services and patient data on mount
  useEffect(() => {
    fetchInitialData();
  }, [patientId]);

  // Auto-select service if testName is provided
  useEffect(() => {
    if (services.length > 0 && testName && !selectedService) {
      const matchedService = services.find(
        s => s.display?.toLowerCase().includes(testName.toLowerCase()) ||
             s.modality?.toLowerCase().includes(testName.toLowerCase())
      );
      if (matchedService) {
        setSelectedService(matchedService);
      }
    }
  }, [services, testName, selectedService]);

  // Fetch slots when service and date are selected
  useEffect(() => {
    if (selectedService && selectedDate) {
      fetchSlots();
    }
  }, [selectedService, selectedDate]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch radiology services
      const servicesRes = await axios.get(`${RADIOLOGY_API}/radiologyservices`);
      setServices(servicesRes.data || []);

      // Fetch patient details from clinic to auto-fill
      if (patientId) {
        const patientRes = await axios.get(`${CLINIC_API}/Patient/${patientId}`, {
          headers: { 'Accept': 'application/fhir+json' }
        }).catch(() => null);

        if (patientRes?.data) {
          const p = patientRes.data;
          setPatientData({
            phone: p.phone || '',
            address: p.address || '',
            dateOfBirth: p.dateOfBirth || '',
            gender: p.gender || '',
            insuranceCompany: p.insuranceCompany || '',
            insuranceId: p.insuranceId || ''
          });
        }
      }

      setError('');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load services. Please ensure the Radiology Center is running.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async () => {
    try {
      setLoadingSlots(true);
      // FIXED: Call /radiology/slots with correct parameter name 'service'
      const res = await axios.get(`${RADIOLOGY_API}/radiology/slots`, {
        params: {
          service: selectedService.id,
          date: selectedDate
        }
      });
      setSlots(res.data || []);
    } catch (err) {
      console.error('Error fetching slots:', err);
      setError('Failed to load available slots. Please try another date.');
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedService || !selectedDate || !selectedSlot || !agreedToTerms) {
      setError('Please complete all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare booking payload - matches BookAppointmentRequest model in backend
      const bookingPayload = {
        patientId: patientId,
        patientFirstName: patientName.split(' ')[0],
        patientLastName: patientName.split(' ').slice(1).join(' ') || patientName,
        patientEmail: patientEmail,
        patientPhone: patientData.phone,
        serviceCode: selectedService.code || selectedService.id,
        serviceDisplay: selectedService.display,
        appointmentDate: selectedDate,
        appointmentTime: selectedSlot.start,
        paymentMethod: paymentMethod,
        notes: bookingNotes,
        priority: 'routine'
      };

      // FIXED: Call /radiology/book instead of /radiologycontroller/bookappointment
      const res = await axios.post(
        `${RADIOLOGY_API}/radiology/book`,
        bookingPayload
      );

      if (res.data?.success || res.status === 200) {
        setSuccess('🎉 Appointment booked successfully!');
        
        // Update order status in clinic
        if (orderId) {
          try {
            await axios.patch(`${CLINIC_API}/DoctorOrders/${orderId}/Book`, {
              externalSystemConfirmationId: res.data?.appointmentId || res.data?.id,
              status: 'Booked'
            });
          } catch (err) {
            console.warn('Could not update order status:', err);
          }
        }

        // Redirect after 2.5 seconds
        setTimeout(() => {
          navigate('/patient/orders');
        }, 2500);
      }
    } catch (err) {
      console.error('Booking error:', err);
      const errorMsg = err.response?.data?.error || 
                       err.response?.data?.details || 
                       'Failed to book appointment. Please try again.';
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ animation: 'spin 2s linear infinite', fontSize: '48px', marginBottom: '16px' }}>🏥</div>
          <p style={{ fontSize: '16px' }}>Loading radiology services...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f8fafc, #e0e7ff)', paddingTop: '32px', paddingBottom: '40px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', paddingX: '24px' }}>
        {/* Header Section */}
        <div style={{ marginBottom: '40px' }}>
          <button
            onClick={() => navigate('/patient/orders')}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0'
            }}
          >
            ← Back to Requests
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <div style={{ fontSize: '40px' }}>🏥</div>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 4px 0' }}>
                Radiology Appointment Booking
              </h1>
              <p style={{ color: '#666', fontSize: '15px', margin: '0' }}>
                Medical imaging: <span style={{ fontWeight: '600', color: '#667eea' }}>{testName}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Error & Success Messages */}
        {error && (
          <div style={{
            background: '#fee2e2',
            border: '2px solid #dc2626',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            animation: 'slideDown 0.3s ease-out'
          }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <div>
              <p style={{ color: '#7f1d1d', fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' }}>Error</p>
              <p style={{ color: '#9f1239', fontSize: '13px', margin: '0' }}>{error}</p>
            </div>
          </div>
        )}
        {success && (
          <div style={{
            background: '#dcfce7',
            border: '2px solid #16a34a',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            animation: 'slideDown 0.3s ease-out'
          }}>
            <span style={{ fontSize: '20px' }}>✅</span>
            <div>
              <p style={{ color: '#166534', fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' }}>Success</p>
              <p style={{ color: '#15803d', fontSize: '13px', margin: '0' }}>{success}</p>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px' }}>
          {/* Left Column - Booking Form */}
          <div>
            {/* STEP 1: Test Type (Auto-selected) */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', marginBottom: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.07)', border: '2px solid #e0e7ff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold' }}>1</div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', margin: '0' }}>Imaging Type</h2>
                <span style={{ marginLeft: 'auto', background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>✓ Auto-Selected</span>
              </div>

              {selectedService ? (
                <div style={{ background: '#f0f9ff', border: '2px solid #bfdbfe', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '28px' }}>🔬</span>
                  <div>
                    <p style={{ fontWeight: '600', color: '#1e40af', fontSize: '16px', margin: '0 0 4px 0' }}>
                      {selectedService.display}
                    </p>
                    {selectedService.modality && (
                      <p style={{ fontSize: '13px', color: '#0c4a6e', margin: '0' }}>
                        Modality: {selectedService.modality} • Duration: ~{selectedService.durationMin || 30} min
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p style={{ color: '#dc2626', textAlign: 'center', padding: '20px', margin: '0' }}>
                  ⚠️ Could not match test type. Please select manually.
                </p>
              )}
            </div>

            {/* STEP 2: Patient Information (Auto-filled) */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', marginBottom: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.07)', border: '2px solid #f3f4f6' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', marginBottom: '20px', margin: '0 0 20px 0' }}>
                👤 Patient Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px' }}>
                <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                  <label style={{ color: '#666', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Full Name</label>
                  <p style={{ color: '#1a1a1a', fontWeight: '500', margin: '0' }}>{patientName || 'N/A'}</p>
                </div>
                <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                  <label style={{ color: '#666', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Email</label>
                  <p style={{ color: '#1a1a1a', fontWeight: '500', margin: '0' }}>{patientEmail || 'N/A'}</p>
                </div>
                <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                  <label style={{ color: '#666', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Phone</label>
                  <p style={{ color: '#1a1a1a', fontWeight: '500', margin: '0' }}>{patientData.phone || 'Not provided'}</p>
                </div>
                <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                  <label style={{ color: '#666', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Date of Birth</label>
                  <p style={{ color: '#1a1a1a', fontWeight: '500', margin: '0' }}>
                    {patientData.dateOfBirth ? new Date(patientData.dateOfBirth).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                  <label style={{ color: '#666', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Gender</label>
                  <p style={{ color: '#1a1a1a', fontWeight: '500', margin: '0' }}>{patientData.gender || 'N/A'}</p>
                </div>
                <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                  <label style={{ color: '#666', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Address</label>
                  <p style={{ color: '#1a1a1a', fontWeight: '500', margin: '0', fontSize: '13px' }}>{patientData.address || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* STEP 3: Appointment Date Selection */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', marginBottom: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.07)', border: '2px solid #f3f4f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '36px', height: '36px', background: selectedDate ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e5e7eb', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold' }}>2</div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', margin: '0' }}>Select Appointment Date</h2>
              </div>

              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>📅 Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlot(null);
                }}
                min={new Date().toISOString().split('T')[0]}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  color: '#1a1a1a',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
              <p style={{ fontSize: '12px', color: '#666', marginTop: '8px', margin: '8px 0 0 0' }}>
                Available from today onwards
              </p>
            </div>

            {/* STEP 4: Time Slot Selection */}
            {selectedDate && (
              <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', marginBottom: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.07)', border: '2px solid #f3f4f6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ width: '36px', height: '36px', background: selectedSlot ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e5e7eb', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold' }}>3</div>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', margin: '0' }}>Select Time Slot</h2>
                </div>

                {loadingSlots ? (
                  <p style={{ textAlign: 'center', color: '#667eea', padding: '20px' }}>⏳ Loading available times...</p>
                ) : slots.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#666', padding: '20px', background: '#f9fafb', borderRadius: '8px' }}>
                    ℹ️ No available slots for this date. Please select another date.
                  </p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {slots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        style={{
                          padding: '14px',
                          border: selectedSlot?.id === slot.id ? '2px solid #667eea' : '2px solid #e5e7eb',
                          background: selectedSlot?.id === slot.id ? 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)' : '#fff',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: selectedSlot?.id === slot.id ? '700' : '500',
                          color: selectedSlot?.id === slot.id ? '#667eea' : '#1a1a1a',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          if (selectedSlot?.id !== slot.id) {
                            e.target.style.borderColor = '#bfdbfe';
                            e.target.style.background = '#f0f9ff';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (selectedSlot?.id !== slot.id) {
                            e.target.style.borderColor = '#e5e7eb';
                            e.target.style.background = '#fff';
                          }
                        }}
                      >
                        {new Date(`2000-01-01T${slot.start}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 5: Payment & Notes */}
            {selectedSlot && (
              <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', marginBottom: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.07)', border: '2px solid #f3f4f6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold' }}>4</div>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', margin: '0' }}>Payment & Confirmation</h2>
                </div>

                {/* Insurance Info */}
                {patientData.insuranceCompany && (
                  <div style={{ background: '#e0e7ff', border: '2px solid #c7d2fe', borderRadius: '12px', padding: '14px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '20px' }}>💳</span>
                    <div style={{ fontSize: '13px', color: '#3730a3' }}>
                      <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>Insurance Coverage Available</p>
                      <p style={{ margin: '0', fontSize: '12px' }}>{patientData.insuranceCompany} (ID: {patientData.insuranceId})</p>
                    </div>
                  </div>
                )}

                {/* Payment Method */}
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>💰 Payment Method</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                  {[
                    { value: 'cash', label: '💵 Cash', icon: '💵' },
                    { value: 'insurance', label: '🏥 Insurance', icon: '🏥', disabled: !patientData.insuranceCompany },
                    { value: 'card', label: '💳 Card', icon: '💳' }
                  ].map(method => (
                    <button
                      key={method.value}
                      onClick={() => setPaymentMethod(method.value)}
                      disabled={method.disabled}
                      style={{
                        padding: '14px 12px',
                        border: paymentMethod === method.value ? '2px solid #667eea' : '2px solid #e5e7eb',
                        background: paymentMethod === method.value ? 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)' : '#fff',
                        borderRadius: '10px',
                        cursor: method.disabled ? 'not-allowed' : 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: paymentMethod === method.value ? '#667eea' : '#1a1a1a',
                        opacity: method.disabled ? 0.5 : 1,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span style={{ fontSize: '18px', display: 'block', marginBottom: '4px' }}>{method.icon}</span>
                      {method.label}
                    </button>
                  ))}
                </div>

                {/* Notes */}
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>📝 Special Instructions (Optional)</p>
                <textarea
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="Medical history, allergies, or special instructions for the radiology team..."
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    color: '#1a1a1a',
                    resize: 'vertical'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />

                {/* Terms & Conditions */}
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '24px', marginBottom: '24px', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    style={{ marginTop: '3px', cursor: 'pointer', width: '18px', height: '18px', accentColor: '#667eea' }}
                  />
                  <span style={{ color: '#666', lineHeight: '1.5' }}>
                    <span style={{ fontWeight: '600', color: '#1a1a1a' }}>I confirm:</span> Patient information is accurate. I understand imaging procedures and potential risks. I will arrive 15 minutes early. Terms accepted.
                  </span>
                </label>

                {/* Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                  <button
                    onClick={() => navigate('/patient/orders')}
                    style={{
                      padding: '14px 24px',
                      background: '#f3f4f6',
                      color: '#374151',
                      border: '2px solid #d1d5db',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = '#e5e7eb';
                      e.target.style.borderColor = '#9ca3af';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = '#f3f4f6';
                      e.target.style.borderColor = '#d1d5db';
                    }}
                  >
                    ← Cancel
                  </button>
                  <button
                    onClick={handleBookAppointment}
                    disabled={!agreedToTerms || isSubmitting || !selectedService || !selectedDate || !selectedSlot}
                    style={{
                      padding: '14px 24px',
                      background: agreedToTerms && !isSubmitting && selectedService && selectedDate && selectedSlot ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#cbd5e1',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: agreedToTerms && !isSubmitting && selectedService && selectedDate && selectedSlot ? 'pointer' : 'not-allowed',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      if (agreedToTerms && !isSubmitting && selectedService && selectedDate && selectedSlot) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 10px 20px rgba(102, 126, 234, 0.3)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (agreedToTerms && !isSubmitting && selectedService && selectedDate && selectedSlot) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                  >
                    {isSubmitting ? '⏳ Processing...' : '✓ Confirm Booking'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Booking Summary */}
          <div style={{ position: 'sticky', top: '32px', height: 'fit-content' }}>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '2px solid #f3f4f6' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a', marginBottom: '20px', margin: '0 0 20px 0' }}>
                📋 Booking Summary
              </h3>

              {/* Summary Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Test */}
                <div style={{ paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: '#999', textTransform: 'uppercase', margin: '0 0 6px 0' }}>Imaging Type</p>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', margin: '0' }}>
                    {selectedService?.display || '—'}
                  </p>
                </div>

                {/* Date */}
                <div style={{ paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: '#999', textTransform: 'uppercase', margin: '0 0 6px 0' }}>📅 Date</p>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', margin: '0' }}>
                    {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '—'}
                  </p>
                </div>

                {/* Time */}
                {selectedSlot && (
                  <div style={{ paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
                    <p style={{ fontSize: '11px', fontWeight: '700', color: '#999', textTransform: 'uppercase', margin: '0 0 6px 0' }}>🕐 Time</p>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', margin: '0' }}>
                      {new Date(`2000-01-01T${selectedSlot.start}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}

                {/* Payment */}
                {selectedSlot && (
                  <div style={{ paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
                    <p style={{ fontSize: '11px', fontWeight: '700', color: '#999', textTransform: 'uppercase', margin: '0 0 6px 0' }}>💳 Payment</p>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', margin: '0', textTransform: 'capitalize' }}>
                      {paymentMethod}
                    </p>
                  </div>
                )}

                {/* Status */}
                <div style={{ padding: '12px', background: 'linear-gradient(135deg, #e0e7ff 0%, #f0f9ff 100%)', borderRadius: '8px', border: '1px solid #c7d2fe' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#4f46e5', margin: '0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>ℹ️</span>
                    {selectedSlot ? '✓ Ready to confirm' : 'Select all details'}
                  </p>
                </div>
              </div>

              {/* Help Section */}
              <div style={{ marginTop: '24px', padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                <p style={{ fontSize: '12px', fontWeight: '600', color: '#1a1a1a', margin: '0 0 8px 0' }}>❓ Need Help?</p>
                <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
                  <li>Arrive 15 minutes early</li>
                  <li>Bring ID & insurance card</li>
                  <li>Remove metal items</li>
                  <li>Contact: +20-XXXX-XXXX</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
