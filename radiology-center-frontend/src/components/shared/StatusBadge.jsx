import { jsx as _jsx } from "react/jsx-runtime";
const statusMap = {
    Pending: 'bg-slate-100 text-slate-700',
    Scheduled: 'bg-sky-100 text-sky-700',
    InProgress: 'bg-amber-100 text-amber-700',
    Completed: 'bg-emerald-100 text-emerald-700',
    Reported: 'bg-indigo-100 text-indigo-700',
    Cancelled: 'bg-rose-100 text-rose-700',
};
const patientStatusMap = {
    PendingPatientApproval: {
        label: 'Awaiting your approval',
        className: 'bg-amber-100 text-amber-700',
    },
    PatientApproved: {
        label: 'Approved',
        className: 'bg-blue-100 text-blue-700',
    },
    PatientDeclined: {
        label: 'Declined',
        className: 'bg-red-100 text-red-700',
    },
    AppointmentScheduled: {
        label: 'Appointment booked',
        className: 'bg-violet-100 text-violet-700',
    },
    InProgress: {
        label: 'In progress',
        className: 'bg-orange-100 text-orange-700',
    },
    ReportReady: {
        label: 'Report ready',
        className: 'bg-green-100 text-green-700',
    },
    ReviewedByDoctor: {
        label: 'Reviewed by doctor',
        className: 'bg-slate-100 text-slate-600',
    },
};
function isPatientStatus(status) {
    return status in patientStatusMap;
}
export function StatusBadge({ status, }) {
    if (isPatientStatus(status)) {
        const state = patientStatusMap[status];
        return (_jsx("span", { className: `rounded-full px-3 py-1 text-xs font-semibold transition-all duration-300 ${state.className}`, children: state.label }));
    }
    return (_jsx("span", { className: `rounded-full px-3 py-1 text-xs font-semibold ${statusMap[status]}`, children: status }));
}
