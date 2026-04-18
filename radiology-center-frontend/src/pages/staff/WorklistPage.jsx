import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { WorklistTable } from '../../components/staff/WorklistTable';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { useWorklist } from '../../hooks/useScanOrders';
export function WorklistPage() {
    const { data: orders = [], isLoading, isError, error } = useWorklist();
    if (isLoading) {
        return _jsx(LoadingSpinner, {});
    }
    if (isError) {
        return _jsx("p", { className: "text-sm text-rose-600", children: error.message });
    }
    return (_jsxs("section", { className: "space-y-4", children: [_jsx("h2", { className: "section-title text-2xl font-bold", children: "Live Worklist" }), _jsx(WorklistTable, { orders: orders })] }));
}
