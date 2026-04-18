import { axiosInstance } from './axiosInstance';
export async function fetchPatientReports(patientId) {
    const response = await axiosInstance.get(`/reports/patient/${patientId}`);
    return response.data;
}
export async function uploadReport(scanOrderId, reportFile, notes) {
    const payload = new FormData();
    payload.append('scanOrderId', scanOrderId);
    payload.append('reportFile', reportFile);
    payload.append('notes', notes);
    await axiosInstance.post('/reports/upload', payload, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
}
