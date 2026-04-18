import { axiosInstance } from './axiosInstance';
export async function fetchAvailableSlots(date) {
    const response = await axiosInstance.get('/appointments/slots', {
        params: { date },
    });
    return response.data;
}
export async function bookAppointment(payload) {
    const response = await axiosInstance.post('/appointments/book', payload);
    return response.data;
}
export async function fetchPatientAppointments(patientId) {
    const response = await axiosInstance.get(`/appointments/patient/${patientId}`);
    return response.data;
}
