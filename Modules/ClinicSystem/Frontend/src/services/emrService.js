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
    const response = await api.get(`${EMR_BASE_URL}/check/${encodeURIComponent(patientId)}`);
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
    const response = await api.get(`${EMR_BASE_URL}/patient/${encodeURIComponent(patientId)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching patient EMR records:', error);
    throw error;
  }
};

export const getPatientMedicalHistory = async (patientId) => {
  try {
    const response = await api.get(`${EMR_BASE_URL}/patient/${encodeURIComponent(patientId)}/history`);
    return response.data;
  } catch (error) {
    console.error('Error fetching patient medical history:', error);
    return [];
  }
};

export const getMedicalRecordById = async (recordId) => {
  try {
    const response = await api.get(`${EMR_BASE_URL}/${recordId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching medical record by ID:', error);
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

export const createMedicalRecord = async (patientIdentifier) => {
  try {
    const identifier = patientIdentifier?.toString()?.trim();
    if (!identifier) throw new Error("Patient identifier is required");
    
    const body = { PatientIdentifier: identifier };
    console.log('Creating medical record:', body);
    
    const response = await api.post(`${EMR_BASE_URL}`, body);
    const data = response.data;
    
    console.log('Create response:', data);
    
    return {
      success: true,
      recordId: data.id || data.recordId,
      id: data.id || data.recordId,
      ...data
    };
  } catch (error) {
    console.error('Error creating medical record:', error);
    throw error;
  }
};

export const getOrCreateMedicalRecord = async (patientId) => {
  try {
    const response = await api.get(`${EMR_BASE_URL}/get-or-create/${encodeURIComponent(patientId)}`);
    return response.data;
  } catch (error) {
    console.error('Error in getOrCreateMedicalRecord:', error);
    throw error;
  }
};

export const createMedicalRecordForPatient = async (patientId) => {
  try {
    const response = await api.post(`${EMR_BASE_URL}/create-for-patient`, { patientId });
    return response.data;
  } catch (error) {
    console.error('Error creating medical record:', error);
    throw error;
  }
};

export const getPatientMedicalRecord = async (patientId) => {
  try {
    const response = await api.get(`${EMR_BASE_URL}/patient/${encodeURIComponent(patientId)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching patient medical record:', error);
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

export const getPatientInfoFromAppointments = async (patientId) => {
  try {
    const response = await api.get(`${EMR_BASE_URL}/appointment-info/${patientId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching patient info from appointments:', error);
    throw error;
  }
};

export const createMedicalRecordFromAppointment = async (appointmentId) => {
  try {
    const response = await api.post(`${EMR_BASE_URL}/from-appointment`, { appointmentId });
    const data = response.data;
    return {
      success: true,
      recordId: data.recordId || data.id,
      id: data.recordId || data.id,
      ...data
    };
  } catch (error) {
    console.error('Error creating medical record from appointment:', error);
    throw error;
  }
};

export const saveComplaint = async (medicalRecordId, complaintData) => {
  try {
    const response = await api.post(`/PatientComplaint`, {
      medicalRecordId,
      originalText: complaintData.complaint || complaintData.originalText || "",
      translatedText: complaintData.translatedText || ""
    });
    return response.data;
  } catch (error) {
    console.error('Error saving complaint:', error);
    throw error;
  }
};

export const saveMedicalHistory = async (medicalRecordId, historyData) => {
  try {
    const response = await api.post(`/MedicalHistory`, {
      medicalRecordId,
      previousEye: historyData.previousEye || "",
      familyHistory: historyData.familyHistory || "",
      allergies: historyData.allergies || "",
      chronicDiseases: historyData.chronicDiseases || "",
      currentMedications: historyData.currentMedications || ""
    });
    return response.data;
  } catch (error) {
    console.error('Error saving medical history:', error);
    throw error;
  }
};

export const saveInvestigation = async (medicalRecordId, investigationData) => {
  try {
    const response = await api.post(`/Investigation`, {
      medicalRecordId,
      selectedInvestigations: Array.isArray(investigationData.selectedInvestigations) 
        ? JSON.stringify(investigationData.selectedInvestigations)
        : investigationData.selectedInvestigations,
      notes: investigationData.notes || ""
    });
    return response.data;
  } catch (error) {
    console.error('Error saving investigation:', error);
    throw error;
  }
};

export const saveEyeExamination = async (medicalRecordId, examData) => {
  try {
    const response = await api.post(`/EyeExamination`, {
      medicalRecordId,
      rightEye: examData.rightEye || "",
      leftEye: examData.leftEye || "",
      eyePressure: examData.eyePressure || "",
      pupilReaction: examData.pupilReaction || "",
      anteriorSegment: examData.anteriorSegment || "",
      fundusObservation: examData.fundusObservation || ""
    });
    return response.data;
  } catch (error) {
    console.error('Error saving eye examination:', error);
    throw error;
  }
};

export const saveOperation = async (medicalRecordId, operationData) => {
  try {
    const response = await api.post(`/Operations`, {
      medicalRecordId,
      name: operationData.name || "",
      date: operationData.date || new Date().toISOString(),
      notes: operationData.notes || ""
    });
    return response.data;
  } catch (error) {
    console.error('Error saving operation:', error);
    throw error;
  }
};

export const saveDiagnosis = async (medicalRecordId, diagnosisData) => {
  try {
    const response = await api.post(`/Diagnosis`, {
      medicalRecordId,
      diagnosisName: diagnosisData.diagnosisName || "",
      severity: diagnosisData.severity || "",
      notes: diagnosisData.notes || ""
    });
    return response.data;
  } catch (error) {
    console.error('Error saving diagnosis:', error);
    throw error;
  }
};

export const savePrescription = async (medicalRecordId, prescriptionData) => {
  try {
    const response = await api.post(`/Prescription`, {
      medicalRecordId,
      notes: prescriptionData.notes || "",
      items: prescriptionData.items || []
    });
    return response.data;
  } catch (error) {
    console.error('Error saving prescription:', error);
    throw error;
  }
};

export const saveFile = async (medicalRecordId, file) => {
  try {
    const formData = new FormData();
    formData.append('MedicalRecordId', medicalRecordId);
    formData.append('File', file);
    const response = await api.post(`/MedicalTestFiles/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const getPatientFiles = async (medicalRecordId) => {
  try {
    const response = await api.get(`/MedicalTestFiles/${medicalRecordId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching files:', error);
    return [];
  }
};

export const deleteFile = async (fileId) => {
  try {
    const response = await api.delete(`/MedicalTestFiles/${fileId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

export default {
  getAllEMRRecords,
  checkMedicalRecordExists,
  getEMRById,
  getEMRByPatientId,
  getPatientMedicalHistory,
  getMedicalRecordById,
  createEMR,
  createMedicalRecord,
  getOrCreateMedicalRecord,
  createMedicalRecordForPatient,
  getPatientMedicalRecord,
  updateEMR,
  deleteEMR,
  getPatientInfoFromAppointments,
  createMedicalRecordFromAppointment,
  saveComplaint,
  saveMedicalHistory,
  saveInvestigation,
  saveEyeExamination,
  saveOperation,
  saveDiagnosis,
  savePrescription,
  saveFile,
  getPatientFiles,
  deleteFile,
};