// src/services/api.js
const API_URL = import.meta.env.VITE_RADIOLOGY_API_URL || 'http://localhost:5301/api';

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
    
    // Handle empty responses
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    
    if (!response.ok) {
      // Handle token expiration
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
      throw new Error(data.message || data.error || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// Patient APIs
export const patientAPI = {
  getAll: () => apiRequest('/Patient'),
  getById: (id) => apiRequest(`/Patient/${id}`),
  getByIdentifier: (identifier) => apiRequest(`/Patient/by-identifier/${encodeURIComponent(identifier)}`),
  getByEmail: (email) => apiRequest(`/Patient/by-email/${encodeURIComponent(email)}`),
  create: (patientData) => apiRequest('/Patient/register', {
    method: 'POST',
    body: JSON.stringify(patientData)
  }),
  update: (id, patientData) => apiRequest(`/Patient/${id}`, {
    method: 'PUT',
    body: JSON.stringify(patientData)
  }),
  updatePhone: (id, phone) => apiRequest(`/Patient/${id}/phone`, {
    method: 'PUT',
    body: JSON.stringify({ phone })
  })
};

// Appointment APIs
export const appointmentAPI = {
  getAll: (status = null, investigationStatus = null) => {
    let url = '/Appointment';
    const params = [];
    if (status) params.push(`status=${status}`);
    if (investigationStatus) params.push(`investigationStatus=${investigationStatus}`);
    if (params.length) url += `?${params.join('&')}`;
    return apiRequest(url);
  },
  getById: (id) => apiRequest(`/Appointment/${id}`),
  getByPatient: (patientId, status = null) => {
    let url = `/Appointment/patient/${patientId}`;
    if (status) url += `?status=${status}`;
    return apiRequest(url);
  },
  create: (appointmentData) => apiRequest('/Appointment', {
    method: 'POST',
    body: JSON.stringify(appointmentData)
  }),
  accept: (id, adminNotes = '') => apiRequest(`/Appointment/${id}/accept`, {
    method: 'POST',
    body: JSON.stringify({ adminNotes })
  }),
  reject: (id, reason = '') => apiRequest(`/Appointment/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason })
  }),
  updateInvestigationStatus: (id, status) => apiRequest(`/Appointment/${id}/investigation-status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  })
};

// Investigation APIs
export const investigationAPI = {
  getByAppointment: (appointmentId) => apiRequest(`/Investigation/appointment/${appointmentId}`),
  getByPatient: (patientId) => apiRequest(`/Investigation/patient/${patientId}`),
  start: (data) => apiRequest('/Investigation/start', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  complete: (id) => apiRequest(`/Investigation/${id}/complete`, {
    method: 'POST'
  }),
  uploadFile: async (investigationId, file, fileType) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = getAuthToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    const response = await fetch(`${API_URL}/Investigation/${investigationId}/upload?fileType=${fileType}`, {
      method: 'POST',
      body: formData,
      headers
    });
    
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    
    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }
    
    return data;
  },
  deleteFile: (fileId) => apiRequest(`/Investigation/file/${fileId}`, {
    method: 'DELETE'
  })
};

// Radiology Service APIs
export const radiologyServiceAPI = {
  getAll: () => apiRequest('/RadiologyService'),
  getById: (id) => apiRequest(`/RadiologyService/${id}`),
  getAvailableSlots: (serviceId, date) => apiRequest(`/Slot/available?serviceId=${serviceId}&date=${date}`)
};

// Radiology Result APIs
export const radiologyResultAPI = {
  getByPatient: (patientId) => apiRequest(`/RadiologyResult/patient/${patientId}`),
  getByPatientIdentifier: (identifier) => apiRequest(`/RadiologyResult/patient/by-identifier/${encodeURIComponent(identifier)}`),
  getByAppointment: (appointmentId) => apiRequest(`/RadiologyResult/appointment/${appointmentId}`),
  create: (resultData) => apiRequest('/RadiologyResult', {
    method: 'POST',
    body: JSON.stringify(resultData)
  }),
  update: (id, resultData) => apiRequest(`/RadiologyResult/${id}`, {
    method: 'PUT',
    body: JSON.stringify(resultData)
  }),
  delete: (id) => apiRequest(`/RadiologyResult/${id}`, {
    method: 'DELETE'
  })
};

// Notification APIs
export const notificationAPI = {
  getByPatient: (patientId) => apiRequest(`/Notification/patient/${patientId}`),
  markAsRead: (id) => apiRequest(`/Notification/${id}/read`, {
    method: 'PUT'
  }),
  markAllAsRead: (patientId) => apiRequest(`/Notification/patient/${patientId}/read-all`, {
    method: 'PUT'
  })
};

// Admin Auth API
export const adminAuthAPI = {
  login: (email, password) => apiRequest('/AdminAuth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
};

export default apiRequest;