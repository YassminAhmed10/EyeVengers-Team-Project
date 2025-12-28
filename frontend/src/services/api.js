// services/api.js
import axios from 'axios';

// Base URL للـ Backend
const API_BASE_URL = 'http://localhost:5201/api';

// إنشاء axios instance مع الإعدادات الافتراضية
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Dashboard APIs
export const dashboardApi = {
    // جلب الإحصائيات العامة
    getStats: async () => {
        try {
            const response = await apiClient.get('/Dashboard/Stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching stats:', error);
            throw error;
        }
    },

    // جلب مواعيد اليوم
    getTodayAppointments: async () => {
        try {
            const response = await apiClient.get('/Dashboard/TodayAppointments');
            return response.data;
        } catch (error) {
            console.error('Error fetching today appointments:', error);
            throw error;
        }
    },

    // جلب توزيع الجنس
    getGenderDistribution: async () => {
        try {
            const response = await apiClient.get('/Dashboard/GenderDistribution');
            return response.data;
        } catch (error) {
            console.error('Error fetching gender distribution:', error);
            throw error;
        }
    },

    // جلب اتجاهات الأسبوع
    getWeeklyTrends: async () => {
        try {
            const response = await apiClient.get('/Dashboard/WeeklyTrends');
            return response.data;
        } catch (error) {
            console.error('Error fetching weekly trends:', error);
            throw error;
        }
    },

    // جلب رسم بياني للمرضى
    getPatientsChart: async () => {
        try {
            const response = await apiClient.get('/Dashboard/PatientsChart');
            return response.data;
        } catch (error) {
            console.error('Error fetching patients chart:', error);
            throw error;
        }
    },
};

// Appointments APIs
export const appointmentsApi = {
    // جلب كل المواعيد
    getAll: async () => {
        try {
            const response = await apiClient.get('/Appointments');
            return response.data;
        } catch (error) {
            console.error('Error fetching appointments:', error);
            throw error;
        }
    },

    // جلب موعد معين بالـ ID
    getById: async (id) => {
        try {
            const response = await apiClient.get(`/Appointments/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching appointment:', error);
            throw error;
        }
    },

    // إنشاء موعد جديد
    create: async (appointmentData) => {
        try {
            const response = await apiClient.post('/Appointments', appointmentData);
            return response.data;
        } catch (error) {
            console.error('Error creating appointment:', error);
            throw error;
        }
    },

    // تعديل موعد
    update: async (id, appointmentData) => {
        try {
            const response = await apiClient.put(`/Appointments/${id}`, appointmentData);
            return response.data;
        } catch (error) {
            console.error('Error updating appointment:', error);
            throw error;
        }
    },

    // حذف موعد
    delete: async (id) => {
        try {
            await apiClient.delete(`/Appointments/${id}`);
        } catch (error) {
            console.error('Error deleting appointment:', error);
            throw error;
        }
    },

    // جلب مواعيد اليوم
    getToday: async () => {
        try {
            const response = await apiClient.get('/Appointments/Today');
            return response.data;
        } catch (error) {
            console.error('Error fetching today appointments:', error);
            throw error;
        }
    },

    // جلب المواعيد القادمة
    getUpcoming: async () => {
        try {
            const response = await apiClient.get('/Appointments/Upcoming');
            return response.data;
        } catch (error) {
            console.error('Error fetching upcoming appointments:', error);
            throw error;
        }
    },

    // NEW: جلب معلومات المريض من المواعيد
    getPatientInfo: async (patientId) => {
        try {
            const response = await apiClient.get(`/Appointments/PatientInfo/${patientId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching patient info from appointments:', error);
            throw error;
        }
    },

    // NEW: جلب معلومات المريض الكاملة
    getFullPatientInfo: async (patientId) => {
        try {
            const response = await apiClient.get(`/Appointments/FullPatientInfo/${patientId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching full patient info:', error);
            throw error;
        }
    },

    // NEW: جلب بيانات EMR من المواعيد
    getEMRData: async (patientId) => {
        try {
            const response = await apiClient.get(`/Appointments/EMRData/${patientId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching EMR data:', error);
            throw error;
        }
    },
};

// EMR APIs
export const emrApi = {
    // التحقق من وجود سجل طبي
    checkMedicalRecordExists: async (patientId) => {
        try {
            const response = await apiClient.get(`/MedicalRecord/check/${patientId}`);
            return response.data;
        } catch (error) {
            console.error('Error checking medical record:', error);
            return { exists: false };
        }
    },

    // الحصول على بيانات السجل الطبي
    getMedicalRecord: async (patientId) => {
        try {
            const response = await apiClient.get(`/MedicalRecord/patient/${patientId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching medical record:', error);
            throw error;
        }
    },

    // الحصول على بيانات المريض من المواعيد (backup)
    getPatientInfoFromAppointments: async (patientId) => {
        try {
            const response = await apiClient.get(`/MedicalRecord/appointment-info/${patientId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching appointment info:', error);
            throw error;
        }
    },

    // إنشاء سجل طبي جديد
    createMedicalRecord: async (patientIdentifier) => {
        try {
            const response = await apiClient.post('/MedicalRecord', {
                patientIdentifier
            });
            return response.data;
        } catch (error) {
            console.error('Error creating medical record:', error);
            throw error;
        }
    },

    // إنشاء سجل طبي من موعد
    createMedicalRecordFromAppointment: async (patientId, patientName, appointmentDate) => {
        try {
            const response = await apiClient.post('/MedicalRecord/from-appointment', {
                patientId,
                patientName,
                appointmentDate: appointmentDate || new Date().toISOString()
            });
            return response.data;
        } catch (error) {
            console.error('Error creating medical record from appointment:', error);
            throw error;
        }
    },

    // حفظ شكوى المريض
    savePatientComplaint: async (complaintData) => {
        try {
            const response = await apiClient.post('/PatientComplaint', complaintData);
            return response.data;
        } catch (error) {
            console.error('Error saving patient complaint:', error);
            throw error;
        }
    },

    // حفظ التاريخ الطبي
    saveMedicalHistory: async (historyData) => {
        try {
            const response = await apiClient.post('/MedicalHistory', historyData);
            return response.data;
        } catch (error) {
            console.error('Error saving medical history:', error);
            throw error;
        }
    },

    // حفظ فحص العين
    saveEyeExamination: async (examData) => {
        try {
            const response = await apiClient.post('/EyeExamination', examData);
            return response.data;
        } catch (error) {
            console.error('Error saving eye examination:', error);
            throw error;
        }
    },

    // حفظ الوصفة الطبية
    savePrescription: async (prescriptionData) => {
        try {
            const response = await apiClient.post('/Prescription', prescriptionData);
            return response.data;
        } catch (error) {
            console.error('Error saving prescription:', error);
            throw error;
        }
    },

    // حفظ التشخيص
    saveDiagnosis: async (diagnosisData) => {
        try {
            const response = await apiClient.post('/Diagnosis', diagnosisData);
            return response.data;
        } catch (error) {
            console.error('Error saving diagnosis:', error);
            throw error;
        }
    },

    // حفظ الفحوصات
    saveInvestigation: async (investigationData) => {
        try {
            const response = await apiClient.post('/Investigation', investigationData);
            return response.data;
        } catch (error) {
            console.error('Error saving investigation:', error);
            throw error;
        }
    },

    // حفظ العمليات
    saveOperation: async (operationData) => {
        try {
            const response = await apiClient.post('/Operation', operationData);
            return response.data;
        } catch (error) {
            console.error('Error saving operation:', error);
            throw error;
        }
    },

    // رفع ملفات الاختبارات
    uploadMedicalTestFile: async (fileData) => {
        try {
            const response = await apiClient.post('/MedicalTestFiles/upload', fileData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error uploading medical test file:', error);
            throw error;
        }
    }
};

// Auth APIs
export const authApi = {
    login: async (credentials) => {
        try {
            const response = await apiClient.post('/Auth/login', credentials);
            return response.data;
        } catch (error) {
            console.error('Error logging in:', error);
            throw error;
        }
    },

    register: async (userData) => {
        try {
            const response = await apiClient.post('/Auth/register', userData);
            return response.data;
        } catch (error) {
            console.error('Error registering:', error);
            throw error;
        }
    },

    logout: async () => {
        try {
            const response = await apiClient.post('/Auth/logout');
            return response.data;
        } catch (error) {
            console.error('Error logging out:', error);
            throw error;
        }
    },
};

// Doctors APIs
export const doctorsApi = {
    // جلب كل الدكاترة
    getAll: async () => {
        try {
            const response = await apiClient.get('/Doctors');
            return response.data;
        } catch (error) {
            console.error('Error fetching doctors:', error);
            throw error;
        }
    },

    // جلب دكتور معين بالـ ID
    getById: async (id) => {
        try {
            const response = await apiClient.get(`/Doctors/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching doctor:', error);
            throw error;
        }
    },

    // إنشاء دكتور جديد
    create: async (doctorData) => {
        try {
            const response = await apiClient.post('/Doctors', doctorData);
            return response.data;
        } catch (error) {
            console.error('Error creating doctor:', error);
            throw error;
        }
    },

    // تحديث بيانات دكتور
    update: async (id, doctorData) => {
        try {
            const response = await apiClient.put(`/Doctors/${id}`, doctorData);
            return response.data;
        } catch (error) {
            console.error('Error updating doctor:', error);
            throw error;
        }
    },

    // حذف دكتور
    delete: async (id) => {
        try {
            await apiClient.delete(`/Doctors/${id}`);
        } catch (error) {
            console.error('Error deleting doctor:', error);
            throw error;
        }
    }
};

// Patients APIs
export const patientsApi = {
    getAll: async () => {
        try {
            const response = await apiClient.get('/Patients');
            return response.data;
        } catch (error) {
            console.error('Error fetching patients:', error);
            throw error;
        }
    },

    getById: async (id) => {
        try {
            const response = await apiClient.get(`/Patients/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching patient:', error);
            throw error;
        }
    },

    create: async (patientData) => {
        try {
            const response = await apiClient.post('/Patients', patientData);
            return response.data;
        } catch (error) {
            console.error('Error creating patient:', error);
            throw error;
        }
    },

    update: async (id, patientData) => {
        try {
            const response = await apiClient.put(`/Patients/${id}`, patientData);
            return response.data;
        } catch (error) {
            console.error('Error updating patient:', error);
            throw error;
        }
    },

    delete: async (id) => {
        try {
            await apiClient.delete(`/Patients/${id}`);
        } catch (error) {
            console.error('Error deleting patient:', error);
            throw error;
        }
    },
};

// Utility functions
export const apiUtils = {
    // دالة لمعالجة الأخطاء
    handleApiError: (error) => {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('API Error Response:', error.response.data);
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
            return {
                success: false,
                message: error.response.data?.message || 'Server error occurred',
                status: error.response.status
            };
        } else if (error.request) {
            // The request was made but no response was received
            console.error('API Error Request:', error.request);
            return {
                success: false,
                message: 'No response received from server',
                status: 0
            };
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('API Error:', error.message);
            return {
                success: false,
                message: error.message,
                status: -1
            };
        }
    },

    // دالة لبناء query parameters
    buildQueryString: (params) => {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                queryParams.append(key, params[key]);
            }
        });
        return queryParams.toString();
    },

    // دالة لتحويل التاريخ إلى صيغة API
    formatDateForApi: (date) => {
        if (!date) return null;
        if (date instanceof Date) {
            return date.toISOString();
        }
        return new Date(date).toISOString();
    }
};

// إضافة interceptor لمعالجة الأخطاء العامة
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const errorInfo = apiUtils.handleApiError(error);

        // إذا كان الخطأ غير مصرح به (401)، قم بتسجيل الخروج
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            window.location.href = '/login';
        }

        return Promise.reject(errorInfo);
    }
);

// إضافة interceptor لإضافة التوكن للمصادقة
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;