// src/services/radiologyResultService.js
// Service to manage radiology results and uploads

const baseUrl = import.meta.env.VITE_RADIOLOGY_BASE_URL || 'http://localhost:5301';

export const radiologyResultService = {
  // Get all results for an appointment
  async getResultsByAppointment(appointmentId) {
    try {
      const response = await fetch(`${baseUrl}/api/RadiologyResult/appointment/${appointmentId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching results:', error);
      return { success: false, data: [] };
    }
  },

  // Get specific result
  async getResult(id) {
    try {
      const response = await fetch(`${baseUrl}/api/RadiologyResult/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching result:', error);
      return { success: false, data: null };
    }
  },

  // Create result with report text
  async createResult(appointmentId, reportTitle, reportText, findings, conclusion) {
    try {
      const response = await fetch(`${baseUrl}/api/RadiologyResult`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId,
          reportTitle,
          reportText,
          findings,
          conclusion,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error creating result:', error);
      return { success: false };
    }
  },

  // Upload radiology image
  async uploadImage(resultId, file) {
    try {
      if (!file) throw new Error('No file provided');

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${baseUrl}/api/RadiologyResult/${resultId}/upload-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error uploading image:', error);
      return { success: false };
    }
  },

  // Upload PDF report
  async uploadReport(resultId, file) {
    try {
      if (!file) throw new Error('No file provided');

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${baseUrl}/api/RadiologyResult/${resultId}/upload-report`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error uploading report:', error);
      return { success: false };
    }
  },

  // Update result details
  async updateResult(id, reportTitle, reportText, findings, conclusion) {
    try {
      const response = await fetch(`${baseUrl}/api/RadiologyResult/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportTitle,
          reportText,
          findings,
          conclusion,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error updating result:', error);
      return { success: false };
    }
  },

  // Delete result
  async deleteResult(id) {
    try {
      const response = await fetch(`${baseUrl}/api/RadiologyResult/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error deleting result:', error);
      return { success: false };
    }
  },
};
