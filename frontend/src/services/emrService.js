import api from './api';

const EMR_BASE_URL = '/MedicalRecord';
export const getAllEMRRecords = async () => {
    try {
        const response = await api.get(`${EMR_BASE_URL}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching EMR records:', error);
        throw error;
    }
};
export const checkMedicalRecordExists = async (patientId) => {
    try {
        const response = await api.get(`${EMR_BASE_URL}/check/${patientId}`);
        return response.data;
    } catch (error) {
        console.error('Error checking medical record:', error);
        return { exists: false };
    }
};

export const getEMRById = async (id) => {
    try {
        const response = await api.get(`${EMR_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching EMR record:', error);
        throw error;
    }
};

export const getEMRByPatientId = async (patientId) => {
    try {
        const response = await api.get(`${EMR_BASE_URL}/patient/${patientId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching patient EMR records:', error);
        throw error;
    }
};

export const createEMR = async (emrData) => {
    try {
        const response = await api.post(`${EMR_BASE_URL}`, emrData);
        return response.data;
    } catch (error) {
        console.error('Error creating EMR record:', error);
        throw error;
    }
};

export const updateEMR = async (id, emrData) => {
    try {
        const response = await api.put(`${EMR_BASE_URL}/${id}`, emrData);
        return response.data;
    } catch (error) {
        console.error('Error updating EMR record:', error);
        throw error;
    }
};

export const deleteEMR = async (id) => {
    try {
        const response = await api.delete(`${EMR_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting EMR record:', error);
        throw error;
    }
};

export const getPatientMedicalRecord = async (patientId) => {
    try {
        const response = await api.get(`${EMR_BASE_URL}/patient/${patientId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching patient medical record:', error);
        throw error;
    }
};

export const getPatientInfoFromAppointments = async (patientId) => {
    try {
        const response = await api.get(`${EMR_BASE_URL}/appointment-info/${patientId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching patient info from appointments:', error);
        throw error;
    }
};

export const createMedicalRecordFromAppointment = async (patientId, patientName, appointmentDate) => {
    try {
        const response = await api.post(`${EMR_BASE_URL}/from-appointment`, {
            patientId,
            patientName,
            appointmentDate: appointmentDate || new Date().toISOString()
        });
        return response.data;
    } catch (error) {
        console.error('Error creating medical record from appointment:', error);
        throw error;
    }
};

export default {
    getAllEMRRecords,
    getEMRById,
    getEMRByPatientId,
    createEMR,
    updateEMR,
    deleteEMR,
    checkMedicalRecordExists,
    getPatientMedicalRecord,
    getPatientInfoFromAppointments,
    createMedicalRecordFromAppointment
};