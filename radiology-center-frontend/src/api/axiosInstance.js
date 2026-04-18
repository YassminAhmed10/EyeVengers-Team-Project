import axios from 'axios';
export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_RADIOLOGY_API_URL ?? 'http://localhost:5001/api',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});
axiosInstance.interceptors.response.use((response) => response, (error) => {
    const message = error?.response?.data?.message;
    return Promise.reject(new Error(message ?? 'An unexpected API error occurred.'));
});
