// src/services/appointmentService.js
// Service to manage radiology appointments

const baseUrl = import.meta.env.VITE_RADIOLOGY_BASE_URL || 'http://localhost:5301';

export const appointmentService = {
  // Get all appointments with filters
  async getAppointments(status = null, investigationStatus = null) {
    try {
      let url = `${baseUrl}/api/Appointment`;
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (investigationStatus) params.append('investigationStatus', investigationStatus);
      if (params.toString()) url += '?' + params.toString();

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return { success: false, data: [] };
    }
  },

  // Get appointments for a specific patient
  async getPatientAppointments(patientId, status = null) {
    try {
      let url = `${baseUrl}/api/Appointment/patient/${patientId}`;
      if (status) url += `?status=${status}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      return { success: false, data: [] };
    }
  },

  // Get specific appointment
  async getAppointment(id) {
    try {
      const response = await fetch(`${baseUrl}/api/Appointment/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching appointment:', error);
      return { success: false, data: null };
    }
  },

  // Accept appointment request
  async acceptAppointment(id, adminNotes = '') {
    try {
      const response = await fetch(`${baseUrl}/api/Appointment/${id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error accepting appointment:', error);
      return { success: false };
    }
  },

  // Reject appointment request
  async rejectAppointment(id, reason = '') {
    try {
      const response = await fetch(`${baseUrl}/api/Appointment/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      return { success: false };
    }
  },

  // Update investigation status
  async updateInvestigationStatus(id, status) {
    try {
      const response = await fetch(`${baseUrl}/api/Appointment/${id}/investigation-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error updating investigation status:', error);
      return { success: false };
    }
  },

  // Create new appointment (booking)
  async createAppointment(appointmentData) {
    try {
      const response = await fetch(`${baseUrl}/api/Appointment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error creating appointment:', error);
      return { success: false };
    }
  },
};
