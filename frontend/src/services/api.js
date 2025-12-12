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
};

export default apiClient;