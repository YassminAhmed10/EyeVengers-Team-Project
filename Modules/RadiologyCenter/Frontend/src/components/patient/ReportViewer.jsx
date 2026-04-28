import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { format } from 'date-fns';
export function ReportViewer({ reports }) {
    if (reports.length === 0) {
        return _jsx("p", { className: "text-sm text-slate-600", children: "No reports available yet." });
    }
    return (_jsx("div", { className: "space-y-3", children: reports.map((report) => (_jsxs("article", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-panel", children: [_jsxs("div", { className: "mb-1 flex flex-wrap items-center justify-between gap-2", children: [_jsx("h3", { className: "section-title text-lg font-semibold", children: report.investigationName }), _jsx("span", { className: "text-xs text-slate-500", children: format(new Date(report.createdAt), 'PPP p') })] }), _jsxs("p", { className: "text-sm text-slate-700", children: [_jsx("span", { className: "font-semibold", children: "Radiologist:" }), " ", report.radiologistName] }), _jsxs("p", { className: "mt-2 text-sm text-slate-700", children: [_jsx("span", { className: "font-semibold", children: "Findings:" }), " ", report.findings] }), _jsxs("p", { className: "mt-1 text-sm text-slate-700", children: [_jsx("span", { className: "font-semibold", children: "Impression:" }), " ", report.impression] }), report.reportUrl && (_jsx("a", { className: "mt-3 inline-block rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-white", href: report.reportUrl, target: "_blank", rel: "noreferrer", children: "Open Full Report" }))] }, report.id))) }));
}
