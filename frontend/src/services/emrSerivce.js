import api from './api';

// Base URL for EMR endpoints
const EMR_BASE_URL = '/api/emr';

// Get all EMR records
export const getAllEMRRecords = async () => {
    try {
        const response = await api.get(`${EMR_BASE_URL}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching EMR records:', error);
        throw error;
    }
};

// Get EMR record by ID
export const getEMRById = async (id) => {
    try {
        const response = await api.get(`${EMR_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching EMR record ${id}:`, error);
        throw error;
    }
};

// Get EMR records by patient ID
export const getEMRByPatientId = async (patientId) => {
    try {
        const response = await api.get(`${EMR_BASE_URL}/patient/${patientId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching EMR records for patient ${patientId}:`, error);
        throw error;
    }
};

// Create new EMR record
export const createEMR = async (emrData) => {
    try {
        const response = await api.post(`${EMR_BASE_URL}`, emrData);
        return response.data;
    } catch (error) {
        console.error('Error creating EMR record:', error);
        throw error;
    }
};

// Update EMR record
export const updateEMR = async (id, emrData) => {
    try {
        const response = await api.put(`${EMR_BASE_URL}/${id}`, emrData);
        return response.data;
    } catch (error) {
        console.error(`Error updating EMR record ${id}:`, error);
        throw error;
    }
};

// Delete EMR record
export const deleteEMR = async (id) => {
    try {
        const response = await api.delete(`${EMR_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting EMR record ${id}:`, error);
        throw error;
    }
};

// Search EMR records
export const searchEMRRecords = async (searchParams) => {
    try {
        const response = await api.get(`${EMR_BASE_URL}/search`, {
            params: searchParams
        });
        return response.data;
    } catch (error) {
        console.error('Error searching EMR records:', error);
        throw error;
    }
};

// Get EMR statistics/summary
export const getEMRStatistics = async () => {
    try {
        const response = await api.get(`${EMR_BASE_URL}/statistics`);
        return response.data;
    } catch (error) {
        console.error('Error fetching EMR statistics:', error);
        throw error;
    }
};

// Export all functions as default object
export default {
    getAllEMRRecords,
    getEMRById,
    getEMRByPatientId,
    createEMR,
    updateEMR,
    deleteEMR,
    searchEMRRecords,
    getEMRStatistics
};