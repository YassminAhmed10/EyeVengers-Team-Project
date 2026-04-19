import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Activity, Eye, Radiation, ScanLine } from 'lucide-react';
import { format } from 'date-fns';
import { StatusBadge } from '../shared/StatusBadge';
function ScanTypeIcon({ iconType }) {
    if (iconType === 'oct') {
        return _jsx(Eye, { className: "text-blue-600", size: 22 });
    }
    if (iconType === 'xray') {
        return _jsx(Radiation, { className: "text-blue-600", size: 22 });
    }
    if (iconType === 'ct') {
        return _jsx(ScanLine, { className: "text-blue-600", size: 22 });
    }
    if (iconType === 'mri') {
        return _jsx(Activity, { className: "text-blue-600", size: 22 });
    }
    return _jsx(ScanLine, { className: "text-blue-600", size: 22 });
}
export function InvestigationCard({ investigation, onApprove, onDecline, onBookAppointment, onViewReport, onViewAppointment, }) {
    return (_jsxs("article", { dir: "rtl", className: `rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 ${investigation.status === 'PatientDeclined' ? 'border-red-200 bg-red-50/30' : ''}`, children: [_jsxs("div", { className: "mb-3 flex items-start justify-between gap-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "rounded-xl bg-blue-50 p-2", children: _jsx(ScanTypeIcon, { iconType: investigation.iconType }) }), _jsxs("div", { children: [_jsx("h3", { className: "section-title text-xl font-bold text-slate-800", children: investigation.scanType }), _jsxs("p", { className: "text-xs text-slate-500", children: ["\u0637\u0644\u0628\u0647 \u062F. ", investigation.doctorName] })] })] }), _jsx("span", { className: `rounded-full px-2.5 py-1 text-xs font-semibold ${investigation.priority === 'Urgent'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'}`, children: investigation.priority === 'Urgent' ? 'عاجل' : 'روتيني' })] }), _jsx("p", { className: "mb-3 text-sm text-slate-500", children: investigation.clinicalReason }), _jsxs("div", { className: "mb-4 flex flex-wrap items-center justify-between gap-2", children: [_jsxs("p", { className: "text-xs text-slate-500", children: ["\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0637\u0644\u0628: ", format(new Date(investigation.requestedAt), 'PPP')] }), _jsx(StatusBadge, { status: investigation.status })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [investigation.status === 'PendingPatientApproval' && (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", onClick: () => onApprove(investigation.id), className: "rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 active:scale-95", children: "\u0645\u0648\u0627\u0641\u0642" }), _jsx("button", { type: "button", onClick: () => onDecline(investigation.id), className: "rounded-xl border border-red-600 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 active:scale-95", children: "\u0631\u0641\u0636" })] })), investigation.status === 'PatientApproved' && (_jsx("button", { type: "button", onClick: () => onBookAppointment(investigation.id), className: "rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95", children: "\u0627\u062D\u062C\u0632 \u0645\u0648\u0639\u062F" })), investigation.status === 'AppointmentScheduled' && (_jsxs(_Fragment, { children: [_jsxs("p", { className: "text-xs text-slate-600", children: ["\u0627\u0644\u0645\u0648\u0639\u062F: ", investigation.appointmentDate, " - ", investigation.appointmentTime] }), _jsx("button", { type: "button", onClick: () => onViewAppointment(investigation.id), className: "rounded-xl border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 active:scale-95", children: "\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0645\u0648\u0639\u062F" })] })), investigation.status === 'InProgress' && (_jsxs("div", { className: "flex items-center gap-2 text-sm text-orange-700", children: [_jsx("span", { className: "h-3 w-3 animate-pulse rounded-full bg-orange-500" }), "\u062C\u0627\u0631\u064A \u062A\u062C\u0647\u064A\u0632 \u0627\u0644\u062A\u0642\u0631\u064A\u0631"] })), (investigation.status === 'ReportReady' || investigation.status === 'ReviewedByDoctor') && (_jsx("button", { type: "button", onClick: () => onViewReport(investigation.id), className: `rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-95 ${investigation.status === 'ReportReady'
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'border border-slate-500 text-slate-700 hover:bg-slate-100'}`, children: "\u0639\u0631\u0636 \u0627\u0644\u062A\u0642\u0631\u064A\u0631" }))] })] }));
}
