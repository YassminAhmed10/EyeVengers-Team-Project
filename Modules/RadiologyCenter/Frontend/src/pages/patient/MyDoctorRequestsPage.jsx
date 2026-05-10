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
  const [filter, setFilter] = useState('All Requests'); // All Requests, Action Required, Accepted, Booked, Declined

  const patientId = localStorage.getItem('patientId') || 'P-00412';
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

  const handleBookAtRadiology = (order) => {
    // Extract order details
    const orderData = order.dataJson ? JSON.parse(order.dataJson) : {};
    
    // Navigate to booking page with order data
    navigate('/patient/book-from-order', {
      state: {
        orderId: order.id,
        orderType: order.orderType,
        testName: orderData.testName || orderData.serviceName || 'Radiology Test',
        testCode: orderData.testCode || '',
        patientId: patientId,
        patientName: patientName,
        patientEmail: patientEmail,
        orderData: orderData,
      }
    });
  };

  const handleRespondToOrder = async (orderId, action) => {
    try {
      const response = await axios.patch(
        `${CLINIC_API}/DoctorOrders/${orderId}/Respond`,
        {
          action: action,
          rejectionReason: action === 'Rejected' ? 'Declined at patient portal' : null
        }
      );
      
      // Refresh orders
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

        {/* Error message */}
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
            {filteredOrders.map((order, idx) => {
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
                  {/* Left content */}
                  <div style={{ flex: 1 }}>
                    {/* Title */}
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1a1a1a',
                      marginBottom: '8px'
                    }}>
                      Doctor's Request — {orderData.testName || orderData.serviceName || 'Radiology Investigation'}
                    </h3>

                    {/* Metadata */}
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

                    {/* Description */}
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

                    {/* Progress steps */}
                    <div style={{
                      display: 'flex',
                      gap: '24px',
                      fontSize: '12px',
                      marginTop: '12px',
                      color: '#999'
                    }}>
                      <span style={{ opacity: order.status !== 'PendingPatientApproval' ? 1 : 0.5 }}>
                        ✓ Doctor Request
                      </span>
                      <span style={{ opacity: order.status !== 'PendingPatientApproval' ? 1 : 0.5 }}>
                        ✓ Your Decision
                      </span>
                      <span style={{ opacity: order.status === 'Booked' ? 1 : 0.5 }}>
                        {order.status === 'Booked' ? '✓' : '○'} Book Appointment
                      </span>
                      <span style={{ opacity: order.status === 'Booked' ? 1 : 0.5 }}>
                        {order.status === 'Booked' ? '✓' : '○'} Visit Radiology Center
                      </span>
                    </div>
                  </div>

                  {/* Right side - Status & Actions */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    alignItems: 'flex-end'
                  }}>
                    {/* Status badge */}
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

                    {/* Action buttons */}
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      flexDirection: 'column',
                      width: '100%'
                    }}>
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
                              fontWeight: '600',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#1d4ed8'}
                            onMouseOut={(e) => e.target.style.background = '#2563eb'}
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
                              fontWeight: '600',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#e5e7eb'}
                            onMouseOut={(e) => e.target.style.background = '#f3f4f6'}
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
                            fontWeight: '600',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseOver={(e) => e.target.style.background = '#15803d'}
                          onMouseOut={(e) => e.target.style.background = '#16a34a'}
                        >
                          📅 BOOK AT RADIOLOGY CENTER
                        </button>
                      )}

                      {order.status === 'Booked' && (
                        <button
                          disabled
                          style={{
                            padding: '10px 18px',
                            background: '#d1d5db',
                            color: '#666',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'not-allowed',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}
                        >
                          ✓ Appointment Booked
                        </button>
                      )}

                      {order.status === 'Rejected' && (
                        <button
                          disabled
                          style={{
                            padding: '10px 18px',
                            background: '#fecaca',
                            color: '#991b1b',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'not-allowed',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}
                        >
                          Declined
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
