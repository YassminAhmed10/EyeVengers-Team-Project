// src/pages/patient/MyDoctorRequestsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CLINIC_API = 'http://localhost:5201/api';

export function MyDoctorRequestsPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All Requests');

  // Get patient ID from localStorage - ensure correct format
  const getPatientId = () => {
    let pid = localStorage.getItem('patientId') || localStorage.getItem('PatientIdentifier') || 'P-000035';
    // Ensure P- prefix
    if (!pid.startsWith('P-')) {
      pid = `P-${pid}`;
    }
    console.log('[MyDoctorRequestsPage] Patient ID:', pid);
    return pid;
  };

  const patientId = getPatientId();
  const patientName = localStorage.getItem('userName') || localStorage.getItem('patientName') || 'Patient';
  const patientEmail = localStorage.getItem('userEmail') || '';

  useEffect(() => {
    fetchDoctorOrders();
  }, [patientId]);

  const fetchDoctorOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${CLINIC_API}/DoctorOrders/MyOrders?patientId=${patientId}`);
      const data = Array.isArray(response.data) ? response.data : [];
      console.log('[MyDoctorRequestsPage] Orders fetched:', data.length);
      setOrders(data);
    } catch (err) {
      console.error('Error fetching doctor orders:', err);
      setError('Failed to load doctor requests. Please ensure the Eye Clinic service is running.');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredOrders = () => {
    if (filter === 'All Requests') return orders;
    if (filter === 'Action Required') return orders.filter(o => o.status === 'PendingPatientApproval');
    if (filter === 'Accepted') return orders.filter(o => o.status === 'Accepted');
    if (filter === 'Booked') return orders.filter(o => o.status === 'Booked');
    if (filter === 'Declined') return orders.filter(o => o.status === 'Rejected');
    return orders;
  };

  // Fetch complete patient details from the clinic system
  const fetchCompletePatientDetails = async () => {
    try {
      console.log('[MyDoctorRequestsPage] Fetching complete patient details for ID:', patientId);
      
      // Try multiple endpoints to get patient data
      let patientData = {};
      
      // Try by identifier first (P-XXXXX format)
      try {
        const response = await axios.get(`${CLINIC_API}/Patient/by-identifier/${patientId}`);
        if (response.data) {
          patientData = response.data;
          console.log('[MyDoctorRequestsPage] Patient data via identifier:', patientData);
        }
      } catch (err) {
        console.warn('[MyDoctorRequestsPage] Could not fetch by identifier, trying by ID');
      }
      
      // Try by numeric ID (extract numbers)
      if (!patientData || Object.keys(patientData).length === 0) {
        const numericId = patientId.replace('P-', '');
        try {
          const response = await axios.get(`${CLINIC_API}/Patient/${numericId}`);
          if (response.data) {
            patientData = response.data;
            console.log('[MyDoctorRequestsPage] Patient data via numeric ID:', patientData);
          }
        } catch (err) {
          console.warn('[MyDoctorRequestsPage] Could not fetch by numeric ID');
        }
      }
      
      // Try appointments endpoint as fallback
      if (!patientData || Object.keys(patientData).length === 0) {
        try {
          const response = await axios.get(`${CLINIC_API}/MedicalRecord/appointment-info/${patientId}`);
          if (response.data) {
            patientData = response.data;
            console.log('[MyDoctorRequestsPage] Patient data via appointment-info:', patientData);
          }
        } catch (err) {
          console.warn('[MyDoctorRequestsPage] Could not fetch via appointment-info');
        }
      }
      
      return patientData;
    } catch (err) {
      console.error('[MyDoctorRequestsPage] Error fetching patient details:', err);
      return {};
    }
  };

  const handleBookAtRadiology = async (order) => {
    try {
      console.log('[MyDoctorRequestsPage] Starting booking process for order:', order.id);
      
      // Fetch complete patient details
      const patientDetails = await fetchCompletePatientDetails();
      
      // Parse order data
      const orderData = order.dataJson ? JSON.parse(order.dataJson) : {};
      
      // Build complete patient information with fallbacks
      const fullName = patientDetails.name || 
                       patientDetails.patientName || 
                       `${patientDetails.firstName || ''} ${patientDetails.lastName || ''}`.trim() || 
                       patientName;
      
      const phone = patientDetails.phone || 
                    patientDetails.patientPhone || 
                    patientDetails.contactNumber || 
                    localStorage.getItem('patientPhone') || 
                    '';
      
      const email = patientDetails.email || 
                    patientDetails.patientEmail || 
                    patientEmail;
      
      const gender = patientDetails.gender || 
                     patientDetails.patientGender || 
                     patientDetails.sex || 
                     'Not specified';
      
      const dateOfBirth = patientDetails.dateOfBirth || 
                          patientDetails.birthDate || 
                          patientDetails.dob || 
                          '';
      
      const nationalId = patientDetails.nationalId || 
                         patientDetails.nationalID || 
                         patientDetails.ssn || 
                         '';
      
      const address = patientDetails.address || 
                      patientDetails.patientAddress || 
                      patientDetails.residentialAddress || 
                      '';
      
      // Get doctor info
      const doctorName = orderData.doctorName || 'Dr. Referring Physician';
      const doctorSpecialty = orderData.doctorSpecialty || 'General Medicine';
      const doctorId = orderData.doctorId || '1';
      
      // Get test info
      const requestedTest = orderData.testName || orderData.serviceName || 'Radiology Test';
      const orderNotes = orderData.description || orderData.notes || `Referral for ${requestedTest} examination`;
      const priority = orderData.priority || orderData.urgency || 'Routine';
      
      console.log('[MyDoctorRequestsPage] Mapped patient data:', {
        fullName, phone, email, gender, dateOfBirth, nationalId, address
      });
      
      // Build URL parameters - include ALL fields
      const params = new URLSearchParams();
      
      // Doctor order fields
      params.append('doctorOrder', 'true');
      params.append('orderId', order.id);
      params.append('doctorId', doctorId);
      params.append('doctorName', doctorName);
      params.append('doctorSpecialty', doctorSpecialty);
      params.append('requestedTest', requestedTest);
      params.append('orderDate', new Date().toISOString().split('T')[0]);
      params.append('orderNotes', orderNotes);
      params.append('orderPriority', priority);
      
      // Patient fields - CRITICAL: Include all fields
      params.append('patientId', patientId);
      params.append('patientName', fullName);
      params.append('patientPhone', phone);
      params.append('patientEmail', email);
      params.append('patientGender', gender);
      params.append('patientDateOfBirth', dateOfBirth);
      params.append('patientNationalId', nationalId);
      params.append('patientAddress', address);
      
      // Additional fields for FHIR compliance
      params.append('externalPatientId', patientId);
      params.append('referralSource', 'Eye Clinic');
      params.append('clinicName', 'Eye Clinic');
      params.append('fromClinic', 'true');
      params.append('clinicBackUrl', window.location.href);
      
      // Insurance fields if available
      if (patientDetails.insuranceCompany) params.append('insuranceCompany', patientDetails.insuranceCompany);
      if (patientDetails.insuranceId) params.append('insuranceId', patientDetails.insuranceId);
      if (patientDetails.policyNumber) params.append('policyNumber', patientDetails.policyNumber);
      
      // Emergency contact if available
      if (patientDetails.emergencyContactName) params.append('emergencyContactName', patientDetails.emergencyContactName);
      if (patientDetails.emergencyContactPhone) params.append('emergencyContactPhone', patientDetails.emergencyContactPhone);
      
      // Open Radiology Center
      const radiologyURL = `http://localhost:5174/#/patient/book/appointment?${params.toString()}`;
      console.log('[MyDoctorRequestsPage] Opening Radiology URL with complete data');
      console.log('[MyDoctorRequestsPage] URL:', radiologyURL);
      
      // Open in new tab
      window.open(radiologyURL, '_blank');
      
    } catch (err) {
      console.error('[MyDoctorRequestsPage] Error:', err);
      alert('Failed to prepare booking. Please try again.');
    }
  };

  const handleRespondToOrder = async (orderId, action) => {
    try {
      await axios.patch(
        `${CLINIC_API}/DoctorOrders/${orderId}/Respond`,
        {
          action: action,
          rejectionReason: action === 'Rejected' ? 'Declined at patient portal' : null
        }
      );
      fetchDoctorOrders();
    } catch (err) {
      console.error('Error responding to order:', err);
      setError('Failed to respond to order');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ animation: 'spin 1s linear infinite', fontSize: '32px', marginBottom: '16px' }}>⚙️</div>
          <p style={{ color: '#666' }}>Loading doctor requests...</p>
        </div>
      </div>
    );
  }

  const filteredOrders = getFilteredOrders();

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '24px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '8px' }}>
            My Doctor Requests
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Review requests from your doctor and book your appointments at the Radiology Center
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fee',
            border: '1px solid #fcc',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            color: '#c33'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Filter buttons */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          flexWrap: 'wrap'
        }}>
          {['All Requests', 'Action Required', 'Accepted', 'Booked', 'Declined'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid',
                background: filter === f ? '#2563eb' : '#fff',
                color: filter === f ? '#fff' : '#666',
                borderColor: filter === f ? '#2563eb' : '#ddd',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: filter === f ? '600' : '500',
                transition: 'all 0.3s ease'
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {filteredOrders.length === 0 ? (
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '48px 24px',
            textAlign: 'center',
            color: '#999'
          }}>
            <p style={{ fontSize: '16px' }}>No doctor requests found</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredOrders.map((order) => {
              const orderData = order.dataJson ? JSON.parse(order.dataJson) : {};
              const statusColors = {
                'PendingPatientApproval': { bg: '#fef3c7', text: '#d97706', label: 'Action Required' },
                'Accepted': { bg: '#dbeafe', text: '#2563eb', label: 'Accepted' },
                'Booked': { bg: '#dcfce7', text: '#16a34a', label: 'Booked' },
                'Rejected': { bg: '#fee2e2', text: '#dc2626', label: 'Declined' }
              };
              const statusStyle = statusColors[order.status] || statusColors['PendingPatientApproval'];

              return (
                <div
                  key={order.id}
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    gap: '20px',
                    alignItems: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1a1a1a',
                      marginBottom: '8px'
                    }}>
                      Doctor's Request — {orderData.testName || orderData.serviceName || 'Radiology Investigation'}
                    </h3>

                    <div style={{
                      fontSize: '13px',
                      color: '#666',
                      marginBottom: '12px',
                      display: 'flex',
                      gap: '16px',
                      flexWrap: 'wrap'
                    }}>
                      <span>📅 {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>🏥 {orderData.doctorName || 'Eye Clinic'}</span>
                      {orderData.testCode && <span>📊 Code: {orderData.testCode}</span>}
                    </div>

                    {orderData.description && (
                      <p style={{
                        fontSize: '13px',
                        color: '#666',
                        lineHeight: '1.5',
                        marginBottom: '12px',
                        padding: '12px',
                        background: '#f9fafb',
                        borderRadius: '8px',
                        borderLeft: '3px solid #2563eb'
                      }}>
                        {orderData.description}
                      </p>
                    )}

                    <div style={{
                      display: 'flex',
                      gap: '24px',
                      fontSize: '12px',
                      marginTop: '12px',
                      color: '#999'
                    }}>
                      <span style={{ opacity: order.status !== 'PendingPatientApproval' ? 1 : 0.5 }}>✓ Doctor Request</span>
                      <span style={{ opacity: order.status !== 'PendingPatientApproval' ? 1 : 0.5 }}>✓ Your Decision</span>
                      <span style={{ opacity: order.status === 'Booked' ? 1 : 0.5 }}>{order.status === 'Booked' ? '✓' : '○'} Book Appointment</span>
                      <span style={{ opacity: order.status === 'Booked' ? 1 : 0.5 }}>{order.status === 'Booked' ? '✓' : '○'} Visit Radiology Center</span>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    alignItems: 'flex-end'
                  }}>
                    <div style={{
                      background: statusStyle.bg,
                      color: statusStyle.text,
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {statusStyle.label}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', width: '100%' }}>
                      {order.status === 'PendingPatientApproval' && (
                        <>
                          <button
                            onClick={() => handleRespondToOrder(order.id, 'Accepted')}
                            style={{
                              padding: '8px 16px',
                              background: '#2563eb',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRespondToOrder(order.id, 'Rejected')}
                            style={{
                              padding: '8px 16px',
                              background: '#f3f4f6',
                              color: '#666',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {order.status === 'Accepted' && (
                        <button
                          onClick={() => handleBookAtRadiology(order)}
                          style={{
                            padding: '10px 18px',
                            background: '#16a34a',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}
                        >
                          📅 BOOK AT RADIOLOGY CENTER
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}