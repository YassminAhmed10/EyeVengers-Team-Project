// src/services/appointmentService.js
// Unified appointment service — works with backend API + localStorage fallback

import { appointmentAPI } from './api';

const RADIOLOGY_API = import.meta.env.VITE_RADIOLOGY_API || 'http://localhost:5202/api';

// ── localStorage helpers ──────────────────────────────────────────────────────
function readLocalAppointments() {
  const keys = ['radiologyAllAppointments', 'radiologyAdminPendingRequests'];
  const seen = new Set();
  const all  = [];
  for (const key of keys) {
    try {
      const arr = JSON.parse(localStorage.getItem(key) || '[]');
      if (!Array.isArray(arr)) continue;
      for (const item of arr) {
        const uid = item.appointmentId || item.id || item.bookingReference;
        if (uid && seen.has(uid)) continue;
        if (uid) seen.add(uid);
        all.push(normalise(item));
      }
    } catch { /* skip corrupt */ }
  }
  return all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function normalise(item) {
  return {
    id:                  item.appointmentId || item.id || '',
    appointmentId:       item.appointmentId || item.id || '',
    bookingReference:    item.bookingReference || '—',
    radiologyPatientId:  item.radiologyPatientId || item.patientId || '—',
    externalPatientId:   item.externalPatientId || null,
    patientId:           item.radiologyPatientId || item.patientId || '',
    patientName:         item.patientName  || item.name  || '—',
    patientPhone:        item.patientPhone || item.phone || '—',
    patientEmail:        item.patientEmail || item.email || '—',
    patientGender:       item.patientGender || item.gender || '—',
    patientDateOfBirth:  item.patientDateOfBirth || item.dateOfBirth || '',
    patientNationalId:   item.patientNationalId || item.nationalId || '',
    patientAddress:      item.patientAddress || item.address || '',
    serviceName:         item.serviceName || item.service || item.test || '—',
    servicePrice:        item.servicePrice || item.price || '—',
    serviceDuration:     item.serviceDuration || item.duration || null,
    appointmentDate:     item.appointmentDate || item.date || '',
    appointmentTime:     item.appointmentTime || item.time || '',
    status:              item.status || 'Pending',
    investigationStatus: item.investigationStatus || 'Pending',
    source:              item.source || item.appointmentType || 'DirectWalkIn',
    referralSource:      item.referralSource || item.clinicName || null,
    isDoctorOrder:       item.isDoctorOrder || false,
    doctorName:          item.doctorName || null,
    orderNotes:          item.orderNotes || null,
    uploadedFiles:       item.uploadedFiles || [],
    results:             item.results || [],
    rejectionReason:     item.rejectionReason || null,
    approvedAt:          item.approvedAt || null,
    completedAt:         item.completedAt || null,
    createdAt:           item.createdAt || new Date().toISOString(),
    updatedAt:           item.updatedAt || item.createdAt || new Date().toISOString(),
  };
}

// Match a patient's appointments by their various IDs or name/email
function matchesPatient(apt, patientId, email, name) {
  if (!patientId && !email && !name) return true; // return all if no filter

  if (patientId) {
    const pid = String(patientId).toLowerCase();
    if (
      (apt.radiologyPatientId || '').toLowerCase() === pid ||
      (apt.externalPatientId  || '').toLowerCase() === pid ||
      (apt.patientId          || '').toLowerCase() === pid ||
      (apt.radiologyPatientId || '').toLowerCase().includes(pid) ||
      pid.includes((apt.radiologyPatientId || '').toLowerCase())
    ) return true;
  }
  if (email && (apt.patientEmail || '').toLowerCase() === email.toLowerCase()) return true;
  if (name  && (apt.patientName  || '').toLowerCase().includes(name.toLowerCase())) return true;
  return false;
}

// ── EXPORTED SERVICE ──────────────────────────────────────────────────────────
export const appointmentService = {

  // Get all appointments (admin)
  getAppointments: async (status = null, investigationStatus = null, limit = null) => {
    try {
      // Try backend
      try {
        const result = await appointmentAPI.getAll(status, investigationStatus);
        let data = result?.data || result;
        if (Array.isArray(data) && data.length > 0) {
          if (status) data = data.filter(a => a.status === status);
          if (investigationStatus) data = data.filter(a => a.investigationStatus === investigationStatus);
          if (limit) data = data.slice(0, limit);
          return { success: true, data: data.map(normalise) };
        }
      } catch { /* fallback */ }

      // localStorage fallback
      let data = readLocalAppointments();
      if (status)              data = data.filter(a => a.status === status);
      if (investigationStatus) data = data.filter(a => a.investigationStatus === investigationStatus);
      if (limit)               data = data.slice(0, limit);
      return { success: true, data };
    } catch (error) {
      return { success: false, data: [], error: error.message };
    }
  },

  // Get appointments for a specific patient — supports patientId, email, or name
  getPatientAppointments: async (patientId = null, email = null, name = null) => {
    try {
      // Always read RAD- ID from localStorage — NEVER send Firebase UID to backend
      const radId = localStorage.getItem('radiologyPatientId') || '';
      const resolvedEmail = email
        || localStorage.getItem('radiologyPatientEmail')
        || localStorage.getItem('userEmail')
        || localStorage.getItem('patientEmail')
        || '';
      const resolvedName = name
        || localStorage.getItem('radiologyPatientName')
        || localStorage.getItem('patientName')
        || '';

      // Only hit backend if we have a proper RAD-XXXX ID
      if (radId && radId.startsWith('RAD-')) {
        try {
          const result = await appointmentAPI.getByPatient(radId);
          const data = result?.data || result;
          if (Array.isArray(data) && data.length > 0) {
            return { success: true, data: data.map(normalise) };
          }
        } catch { /* fallback */ }
      }

      // localStorage fallback — match by RAD ID, email, or name
      const all = readLocalAppointments();
      const filtered = all.filter(a => matchesPatient(a, radId || null, resolvedEmail, resolvedName));
      return { success: true, data: filtered };
    } catch (error) {
      return { success: false, data: [], error: error.message };
    }
  },

  // Get single appointment
  getById: async (appointmentId) => {
    try {
      try {
        const result = await appointmentAPI.getById(appointmentId);
        if (result) return { success: true, data: normalise(result?.data || result) };
      } catch { /* fallback */ }

      const all = readLocalAppointments();
      const found = all.find(a => a.appointmentId === appointmentId || a.id === appointmentId);
      return found
        ? { success: true, data: found }
        : { success: false, data: null, error: 'Not found' };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  },

  // Accept / approve appointment
  acceptAppointment: async (appointmentId, adminNotes = '') => {
    try {
      try { await appointmentAPI.accept(appointmentId, adminNotes); } catch { /* fallback */ }

      const all = readLocalAppointments();
      const now = new Date().toISOString();
      const next = all.map(a =>
        a.appointmentId === appointmentId
          ? { ...a, status:'Approved', investigationStatus:'Active', approvedAt:now, updatedAt:now }
          : a
      );
      localStorage.setItem('radiologyAllAppointments', JSON.stringify(next));
      return { success: true, message: 'Appointment approved' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Reject appointment
  rejectAppointment: async (appointmentId, reason = '') => {
    try {
      try { await appointmentAPI.reject(appointmentId, reason); } catch { /* fallback */ }

      const all = readLocalAppointments();
      const now = new Date().toISOString();
      const next = all.map(a =>
        a.appointmentId === appointmentId
          ? { ...a, status:'Rejected', rejectionReason:reason, updatedAt:now }
          : a
      );
      localStorage.setItem('radiologyAllAppointments', JSON.stringify(next));
      return { success: true, message: 'Appointment rejected' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Update investigation status
  updateInvestigationStatus: async (appointmentId, newStatus) => {
    try {
      try { await appointmentAPI.updateInvestigationStatus(appointmentId, newStatus); } catch { /* fallback */ }

      const all = readLocalAppointments();
      const now = new Date().toISOString();
      const next = all.map(a =>
        a.appointmentId === appointmentId
          ? { ...a, investigationStatus:newStatus, updatedAt:now }
          : a
      );
      localStorage.setItem('radiologyAllAppointments', JSON.stringify(next));
      return { success: true, message: `Status updated to ${newStatus}` };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Get pending count (for admin badge)
  getPendingCount: async () => {
    try {
      const { data } = await appointmentService.getAppointments('Pending');
      return Array.isArray(data) ? data.length : 0;
    } catch { return 0; }
  },

  // Get stats summary
  getStats: async () => {
    try {
      const { data } = await appointmentService.getAppointments();
      if (!Array.isArray(data)) return {};
      return {
        total:     data.length,
        pending:   data.filter(a => a.status === 'Pending').length,
        approved:  data.filter(a => a.status === 'Approved').length,
        completed: data.filter(a => a.status === 'Completed').length,
        rejected:  data.filter(a => a.status === 'Rejected').length,
        inProgress:data.filter(a => a.investigationStatus === 'In Progress').length,
      };
    } catch { return {}; }
  },
};

export default appointmentService;