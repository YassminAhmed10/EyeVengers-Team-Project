import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { format } from 'date-fns';
import { StatusBadge } from '../shared/StatusBadge';
export function ScanOrderCard({ order }) {
    return (_jsxs("article", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-panel", children: [_jsxs("div", { className: "mb-3 flex items-center justify-between", children: [_jsx("h3", { className: "section-title text-lg font-semibold", children: order.investigation.name }), _jsx(StatusBadge, { status: order.status })] }), _jsxs("dl", { className: "space-y-1 text-sm text-slate-700", children: [_jsxs("div", { children: [_jsx("dt", { className: "inline font-semibold", children: "Patient: " }), _jsx("dd", { className: "inline", children: order.patient.fullName })] }), _jsxs("div", { children: [_jsx("dt", { className: "inline font-semibold", children: "Accession: " }), _jsx("dd", { className: "inline", children: order.accessionNumber })] }), _jsxs("div", { children: [_jsx("dt", { className: "inline font-semibold", children: "Requested: " }), _jsx("dd", { className: "inline", children: format(new Date(order.requestedAt), 'PPpp') })] })] })] }));
}
