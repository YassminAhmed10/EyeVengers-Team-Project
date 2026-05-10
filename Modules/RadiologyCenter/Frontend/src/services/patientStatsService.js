// src/services/patientStatsService.js
// Service to manage patient statistics (Scans, Appointments, Reports)

const baseUrl = import.meta.env.VITE_RADIOLOGY_BASE_URL || 'http://localhost:5301';

export const patientStatsService = {
  // Get patient statistics
  async getStats(patientId) {
    try {
      const response = await fetch(
        `${baseUrl}/api/PatientStats/${patientId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✓ Patient stats retrieved:', data);
      return data;
    } catch (error) {
      console.error('Error fetching patient stats:', error);
      return null;
    }
  },

  // Increment scans count
  async incrementScans(patientId) {
    try {
      const response = await fetch(
        `${baseUrl}/api/PatientStats/${patientId}/increment-scans`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✓ Scans incremented:', data);
      return data;
    } catch (error) {
      console.error('Error incrementing scans:', error);
      return null;
    }
  },

  // Increment appointments count
  async incrementAppointments(patientId) {
    try {
      const response = await fetch(
        `${baseUrl}/api/PatientStats/${patientId}/increment-appointments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✓ Appointments incremented:', data);
      return data;
    } catch (error) {
      console.error('Error incrementing appointments:', error);
      return null;
    }
  },

  // Increment reports count
  async incrementReports(patientId) {
    try {
      const response = await fetch(
        `${baseUrl}/api/PatientStats/${patientId}/increment-reports`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✓ Reports incremented:', data);
      return data;
    } catch (error) {
      console.error('Error incrementing reports:', error);
      return null;
    }
  },

  // Set all statistics at once
  async setStats(patientId, scansCount, appointmentsCount, reportsCount) {
    try {
      const response = await fetch(
        `${baseUrl}/api/PatientStats/${patientId}/set-stats`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            scansCount,
            appointmentsCount,
            reportsCount,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✓ Stats set:', data);
      return data;
    } catch (error) {
      console.error('Error setting patient stats:', error);
      return null;
    }
  },

  // Save stats to localStorage for offline use
  saveToLocalStorage(patientId, stats) {
    localStorage.setItem(`patientStats_${patientId}`, JSON.stringify(stats));
    console.log('✓ Stats saved to localStorage for patient:', patientId);
  },

  // Load stats from localStorage
  loadFromLocalStorage(patientId) {
    const stored = localStorage.getItem(`patientStats_${patientId}`);
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  },

  // Clear stats from localStorage
  clearLocalStorage(patientId) {
    localStorage.removeItem(`patientStats_${patientId}`);
    console.log('✓ Stats cleared from localStorage for patient:', patientId);
  },
};
