import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchScanOrderById, fetchWorklist, updateScanOrderStatus, } from '../api/scanOrders.api';
export function useWorklist() {
    return useQuery({
        queryKey: ['worklist'],
        queryFn: fetchWorklist,
    });
}
export function useScanOrderDetail(scanOrderId) {
    return useQuery({
        queryKey: ['scan-order', scanOrderId],
        queryFn: () => fetchScanOrderById(scanOrderId),
        enabled: Boolean(scanOrderId),
    });
}
export function useUpdateScanOrderStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ scanOrderId, status }) => updateScanOrderStatus(scanOrderId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['worklist'] });
        },
    });
}
