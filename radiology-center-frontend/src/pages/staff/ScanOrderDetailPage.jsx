import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ScanOrderCard } from '../../components/staff/ScanOrderCard';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { useScanOrderDetail, useUpdateScanOrderStatus } from '../../hooks/useScanOrders';
const statuses = [
    'Pending',
    'Scheduled',
    'InProgress',
    'Completed',
    'Reported',
    'Cancelled',
];
export function ScanOrderDetailPage() {
    const { scanOrderId } = useParams();
    const { data: order, isLoading, isError, error } = useScanOrderDetail(scanOrderId);
    const statusMutation = useUpdateScanOrderStatus();
    const canEdit = useMemo(() => Boolean(order?.id), [order?.id]);
    if (isLoading) {
        return _jsx(LoadingSpinner, {});
    }
    if (isError || !order) {
        return _jsx("p", { className: "text-sm text-rose-600", children: error?.message ?? 'Scan order not found.' });
    }
    return (_jsxs("section", { className: "space-y-4", children: [_jsx(ScanOrderCard, { order: order }), _jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-panel", children: [_jsx("h2", { className: "section-title mb-3 text-xl font-semibold", children: "Update Status" }), _jsx("div", { className: "flex flex-wrap gap-2", children: statuses.map((status) => (_jsxs("button", { type: "button", disabled: !canEdit || statusMutation.isPending, onClick: () => statusMutation.mutate({ scanOrderId: order.id, status }), className: "rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60", children: ["Mark ", status] }, status))) })] })] }));
}
