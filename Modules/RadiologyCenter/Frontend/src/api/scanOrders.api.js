import { axiosInstance } from './axiosInstance';
export async function fetchWorklist() {
    const response = await axiosInstance.get('/scan-orders/worklist');
    return response.data;
}
export async function fetchScanOrderById(scanOrderId) {
    const response = await axiosInstance.get(`/scan-orders/${scanOrderId}`);
    return response.data;
}
export async function updateScanOrderStatus(scanOrderId, status) {
    await axiosInstance.patch(`/scan-orders/${scanOrderId}/status`, { status });
}
