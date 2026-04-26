// src/services/api.js
const API_URL = import.meta.env.VITE_RADIOLOGY_API_URL || 'http://localhost:5001/api';

// Helper to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Generic API request function with authentication
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers,
  };
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      // Handle token expiration
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// Patient APIs
export const patientAPI = {
  getAll: () => apiRequest('/patients'),
  getById: (id) => apiRequest(`/patients/${id}`),
  create: (patientData) => apiRequest('/patients', {
    method: 'POST',
    body: JSON.stringify(patientData)
  }),
  update: (id, patientData) => apiRequest(`/patients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(patientData)
  }),
  delete: (id) => apiRequest(`/patients/${id}`, {
    method: 'DELETE'
  })
};

// Appointment APIs
export const appointmentAPI = {
  getAll: () => apiRequest('/appointments'),
  getById: (id) => apiRequest(`/appointments/${id}`),
  getByPatient: (patientId) => apiRequest(`/appointments/patient/${patientId}`),
  create: (appointmentData) => apiRequest('/appointments', {
    method: 'POST',
    body: JSON.stringify(appointmentData)
  }),
  update: (id, appointmentData) => apiRequest(`/appointments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(appointmentData)
  }),
  delete: (id) => apiRequest(`/appointments/${id}`, {
    method: 'DELETE'
  }),
  getAvailableSlots: () => apiRequest('/appointments/slots/available')
};

// Scan Order APIs
export const scanOrderAPI = {
  getAll: () => apiRequest('/scan-orders'),
  getByPatient: (patientId) => apiRequest(`/scan-orders/patient/${patientId}`),
  create: (orderData) => apiRequest('/scan-orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  }),
  updateStatus: (id, status) => apiRequest(`/scan-orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  })
};

// Report APIs
export const reportAPI = {
  getAll: () => apiRequest('/reports'),
  getByPatient: (patientId) => apiRequest(`/reports/patient/${patientId}`),
  getByScanOrder: (scanOrderId) => apiRequest(`/reports/scan-order/${scanOrderId}`),
  create: (reportData) => apiRequest('/reports', {
    method: 'POST',
    body: JSON.stringify(reportData)
  })
};

export default apiRequest;