import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { useWorklist } from '../../hooks/useScanOrders';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { WorklistTable } from '../../components/staff/WorklistTable';
export function StaffDashboard() {
    const { data: orders = [], isLoading } = useWorklist();
    return (_jsxs("section", { className: "space-y-6", children: [_jsxs("div", { className: "grid gap-4 sm:grid-cols-3", children: [_jsxs("article", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-panel", children: [_jsx("p", { className: "text-sm text-slate-600", children: "Total Active Orders" }), _jsx("p", { className: "section-title text-3xl font-bold text-ink", children: orders.length })] }), _jsxs("article", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-panel", children: [_jsx("p", { className: "text-sm text-slate-600", children: "Pending Reports" }), _jsx("p", { className: "section-title text-3xl font-bold text-ink", children: orders.filter((o) => o.status === 'Completed').length })] }), _jsxs("article", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-panel", children: [_jsx("p", { className: "text-sm text-slate-600", children: "Quick Action" }), _jsx(Link, { to: "/staff/reports", className: "mt-2 inline-block rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white", children: "Upload New Report" })] })] }), isLoading ? _jsx(LoadingSpinner, {}) : _jsx(WorklistTable, { orders: orders.slice(0, 6) })] }));
}
