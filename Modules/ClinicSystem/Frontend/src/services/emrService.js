import api from './api';

const EMR_BASE_URL = '/MedicalRecord';

// ===== دوال السجل الطبي الرئيسي =====
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

// ===== جلب تاريخ السجلات الطبية للمريض =====
export const getPatientMedicalHistory = async (patientId) => {
  try {
    const response = await api.get(`${EMR_BASE_URL}/patient/${patientId}/history`);
    return response.data;
  } catch (error) {
    console.error('Error fetching patient medical history:', error);
    return [];
  }
};

// ===== جلب سجل طبي محدد بالـ ID =====
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
    const body = typeof patientIdentifier === "string"
      ? { patientIdentifier }
      : patientIdentifier;
    const response = await api.post(`${EMR_BASE_URL}`, body);
    return response.data;
  } catch (error) {
    console.error('Error creating medical record:', error);
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

// ===== دوال حفظ الكيانات الفرعية (تستقبل medicalRecordId) =====
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
      ...historyData
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
      ...investigationData
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
      ...examData
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
      ...operationData
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
      ...diagnosisData
    });
    return response.data;
  } catch (error) {
    console.error('Error saving diagnosis:', error);
    throw error;
  }
};

export const savePrescription = async (medicalRecordId, prescriptionData) => {
  try {
    // prescriptionData should be { notes, items: [{drug, form, dose, customDose, frequency, customFrequency, notes}] }
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

// ===== التصدير الموحد =====
export default {
  getAllEMRRecords,
  checkMedicalRecordExists,
  getEMRById,
  getEMRByPatientId,
  getPatientMedicalHistory,
  getMedicalRecordById,
  createEMR,
  createMedicalRecord,
  updateEMR,
  deleteEMR,
  getPatientMedicalRecord,
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