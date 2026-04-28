import axios from 'axios';

export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_RADIOLOGY_API_URL ?? 'http://localhost:5001/api',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to inject Firebase token
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor for error handling
axiosInstance.interceptors.response.use((response) => response, (error) => {
    const message = error?.response?.data?.message;
    
    // Handle 401 Unauthorized (token expired or invalid)
    if (error?.response?.status === 401) {
        // Clear stored token and redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userId');
        
        // Optionally redirect to login page
        // window.location.href = '/login';
    }
    
    return Promise.reject(new Error(message ?? 'An unexpected API error occurred.'));
});
