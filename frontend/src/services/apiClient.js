import axios from 'axios';

const API_BASE_URL = 'http://localhost:5201/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Server responded with error status
            switch (error.response.status) {
                case 401:
                    // Unauthorized - clear auth and redirect to login
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('isAuthenticated');
                    localStorage.removeItem('userRole');
                    window.location.href = '/login';
                    break;
                case 403:
                    console.error('Access forbidden');
                    break;
                case 404:
                    console.error('Resource not found');
                    break;
                case 500:
                    console.error('Server error');
                    break;
                default:
                    console.error('API Error:', error.response.status);
            }
        } else if (error.request) {
            // Request made but no response
            console.error('No response from server. Please check your connection.');
        } else {
            // Error in request setup
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default apiClient;
export { API_BASE_URL };
