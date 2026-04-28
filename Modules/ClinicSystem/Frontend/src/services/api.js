import axios from 'axios';

const API_BASE_URL = 'http://localhost:5201/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Interceptor لإضافة التوكن
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor لمعالجة الأخطاء
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const requestUrl = error.config?.url || '';
            const isAuthLoginRequest = requestUrl.includes('/Auth/login');
            switch (error.response.status) {
                case 401:
                    // A 401 on login is expected for invalid credentials; avoid forced redirect loop.
                    if (!isAuthLoginRequest) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('userRole');
                        window.location.href = '/login';
                    }
                    break;
                case 403:
                    console.error('Access forbidden');
                    break;
                case 500:
                    console.error('Server error:', error.response.data);
                    break;
                default:
                    console.error('API Error:', error.response.status);
            }
        } else if (error.request) {
            console.error('No response from server');
        } else {
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

// ========== دوال EMR ==========
export const emrApi = {
    checkMedicalRecordExists: (patientId) =>
        apiClient.get(`/MedicalRecord/check/${patientId}`).then(res => res.data),

    getMedicalRecord: (patientId) =>
        apiClient.get(`/MedicalRecord/patient/${patientId}`).then(res => res.data),

    createMedicalRecord: (patientIdentifier) =>
        apiClient.post('/MedicalRecord', { patientIdentifier }).then(res => res.data),

    // دوال حفظ الكيانات الفرعية (تستقبل medicalRecordId)
    saveComplaint: (medicalRecordId, data) =>
        apiClient.post('/PatientComplaint', { medicalRecordId, ...data }).then(res => res.data),

    saveMedicalHistory: (medicalRecordId, data) =>
        apiClient.post('/MedicalHistory', { medicalRecordId, ...data }).then(res => res.data),

    saveInvestigation: (medicalRecordId, data) =>
        apiClient.post('/Investigation', { medicalRecordId, ...data }).then(res => res.data),

    saveEyeExamination: (medicalRecordId, data) =>
        apiClient.post('/EyeExamination', { medicalRecordId, ...data }).then(res => res.data),

    saveOperation: (medicalRecordId, data) =>
        apiClient.post('/Operation', { medicalRecordId, ...data }).then(res => res.data),

    saveDiagnosis: (medicalRecordId, data) =>
        apiClient.post('/Diagnosis', { medicalRecordId, ...data }).then(res => res.data),

    savePrescription: (medicalRecordId, data) =>
        apiClient.post('/Prescription', { medicalRecordId, ...data }).then(res => res.data),

    saveFile: (medicalRecordId, formData) => {
        formData.append('medicalRecordId', medicalRecordId);
        return apiClient.post('/File/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => res.data);
    },
};

// ========== دوال المواعيد ==========
export const appointmentsApi = {
    getAll: () => apiClient.get('/Appointments').then(res => res.data),
    getById: (id) => apiClient.get(`/Appointments/${id}`).then(res => res.data),
    create: (data) => apiClient.post('/Appointments', data).then(res => res.data),
    update: (id, data) => apiClient.put(`/Appointments/${id}`, data).then(res => res.data),
    delete: (id) => apiClient.delete(`/Appointments/${id}`).then(res => res.data),
};

// ========== دوال الأطباء والمرضى ==========
export const doctorsApi = {
    getAll: () => apiClient.get('/Doctors').then(res => res.data),
    getById: (id) => apiClient.get(`/Doctors/${id}`).then(res => res.data),
    create: (data) => apiClient.post('/Doctors', data).then(res => res.data),
    update: (id, data) => apiClient.put(`/Doctors/${id}`, data).then(res => res.data),
    delete: (id) => apiClient.delete(`/Doctors/${id}`).then(res => res.data),
};

export const patientsApi = {
    getAll: () => apiClient.get('/Patient').then(res => res.data),
    getById: (id) => apiClient.get(`/Patient/${id}`).then(res => res.data),
    create: (data) => apiClient.post('/Patient', data).then(res => res.data),
    update: (id, data) => apiClient.put(`/Patient/${id}`, data).then(res => res.data),
    delete: (id) => apiClient.delete(`/Patient/${id}`).then(res => res.data),
    search: (query) => apiClient.get(`/Patient/search?query=${encodeURIComponent(query)}`).then(res => res.data),
    getByEmail: (email) => apiClient.get(`/Patient/by-email/${encodeURIComponent(email)}`).then(res => res.data),
};

// ========== دوال Dashboard ==========
export const dashboardApi = {
    getStats: () => apiClient.get('/Dashboard/Stats').then(res => res.data),
    getTodayAppointments: () => apiClient.get('/Dashboard/TodayAppointments').then(res => res.data),
    getGenderDistribution: () => apiClient.get('/Dashboard/GenderDistribution').then(res => res.data),
    getWeeklyTrends: () => apiClient.get('/Dashboard/WeeklyTrends').then(res => res.data),
    getPatientsChart: () => apiClient.get('/Dashboard/PatientsChart').then(res => res.data),
};

// ========== دوال Auth ==========
export const authApi = {
    login: (credentials) => apiClient.post('/Auth/login', credentials).then(res => res.data),
    register: (userData) => {
        // Ensure the data is properly formatted for the backend
        const registerData = {
            username: userData.username,
            email: userData.email,
            password: userData.password,
            role: userData.role,
            // Patient fields
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            phone: userData.phone || '',
            dateOfBirth: userData.dateOfBirth || null,
            address: userData.address || '',
            nationalId: userData.nationalId || '',
            insuranceCompany: userData.insuranceCompany || '',
            insuranceId: userData.insuranceId || '',
            emergencyContactName: userData.emergencyContactName || '',
            emergencyContactPhone: userData.emergencyContactPhone || '',
            gender: userData.gender || ''
        };
        return apiClient.post('/Auth/register', registerData).then(res => res.data);
    },
    logout: () => apiClient.post('/Auth/logout').then(res => res.data),
};

// تصدير apiClient نفسه للاستخدامات النادرة
export default apiClient;