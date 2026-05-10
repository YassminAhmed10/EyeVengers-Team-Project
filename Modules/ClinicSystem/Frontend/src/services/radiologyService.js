import axios from 'axios';

// Radiology Center backend runs on port 5201
const RADIOLOGY_API_BASE_URL = 'http://localhost:5201/api';

const axiosInstance = axios.create({
  baseURL: RADIOLOGY_API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const radiologyService = {
  /**
   * Fetch all radiology investigations for a patient
   * @param {string|number} patientId - Patient ID (numeric or formatted like "P-012")
   * @returns {Promise<Array>} Array of radiology investigations
   */
  getPatientInvestigations: async (patientId) => {
    try {
      const response = await axiosInstance.get(`/investigations/patient/${patientId}`);
      return response.data || [];
    } catch (error) {
      console.warn(`[WARNING] Could not fetch radiology investigations for patient ${patientId}:`, error);
      return [];
    }
  },

  /**
   * Fetch a specific radiology investigation by ID
   * @param {string} investigationId - Investigation ID
   * @returns {Promise<Object>} Investigation details
   */
  getInvestigationDetails: async (investigationId) => {
    try {
      const response = await axiosInstance.get(`/investigations/${investigationId}`);
      return response.data;
    } catch (error) {
      console.warn(`[WARNING] Could not fetch investigation ${investigationId}:`, error);
      return null;
    }
  },

  /**
   * Fetch all radiology reports for a patient
   * @param {string|number} patientId - Patient ID
   * @returns {Promise<Array>} Array of radiology reports
   */
  getPatientReports: async (patientId) => {
    try {
      const response = await axiosInstance.get(`/reports/patient/${patientId}`);
      return response.data || [];
    } catch (error) {
      console.warn(`[WARNING] Could not fetch radiology reports for patient ${patientId}:`, error);
      return [];
    }
  },

  /**
   * Fetch radiology center statistics/data summary
   * @returns {Promise<Object>} Radiology center data
   */
  getRadiologyCenterStats: async () => {
    try {
      const response = await axiosInstance.get(`/radiology/stats`);
      return response.data;
    } catch (error) {
      console.warn(`[WARNING] Could not fetch radiology stats:`, error);
      return null;
    }
  },

  /**
   * Format radiology data for display in EMR
   * @param {Array} investigations - Array of investigation objects from API
   * @returns {Array} Formatted investigations
   */
  formatInvestigations: (investigations) => {
    if (!Array.isArray(investigations)) return [];
    
    return investigations.map(inv => ({
      id: inv.id || inv.Id || "",
      type: inv.investigationType || inv.InvestigationType || "Radiology Investigation",
      description: inv.description || inv.Description || "",
      date: inv.createdAt || inv.CreatedAt || new Date().toISOString(),
      status: inv.status || inv.Status || "Completed",
      findings: inv.findings || inv.Findings || "",
      reportUrl: inv.reportUrl || inv.ReportUrl || null,
      radiologist: inv.radiologist || inv.Radiologist || "Radiology Center",
    }));
  },
};

export default radiologyService;
