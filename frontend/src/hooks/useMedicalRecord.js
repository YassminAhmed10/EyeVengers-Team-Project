import { useState } from 'react';
import api from '../services/api';
export const useMedicalRecord = (patientId) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const saveData = async (data) => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.post(`/api/medical-records/${patientId}`, data);
            setLoading(false);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save data');
            setLoading(false);
            throw err;
        }
    };

    const getData = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.get(`/api/medical-records/${patientId}`);
            setLoading(false);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch data');
            setLoading(false);
            throw err;
        }
    };

    return { saveData, getData, loading, error };
};

export default useMedicalRecord;
