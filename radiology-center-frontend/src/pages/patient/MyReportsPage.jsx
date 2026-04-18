import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { format } from 'date-fns';
import { FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const completedReports = [
    {
        id: 'R-101',
        scanOrderId: 'SO-11',
        patientId: 'P-1001',
        investigationName: 'OCT Retina',
        radiologistName: 'Dr. Mariam Khaled',
        createdAt: new Date().toISOString(),
        findings: 'Mild thinning in retinal layers is observed.',
        impression: 'Follow-up after 3 months is recommended.',
        reportUrl: '#',
    },
    {
        id: 'R-102',
        scanOrderId: 'SO-12',
        patientId: 'P-1001',
        investigationName: 'X-Ray Orbit',
        radiologistName: 'Dr. Ahmed Samy',
        createdAt: new Date().toISOString(),
        findings: 'No obvious bone fractures detected.',
        impression: 'Normal result.',
        reportUrl: '#',
    },
];
export function MyReportsPage() {
    const navigate = useNavigate();
    return (_jsxs("section", { className: "space-y-4 px-4 text-white", dir: "ltr", children: [_jsx("h2", { className: "section-title text-center text-3xl font-bold text-white", children: "Completed Reports" }), _jsx("div", { className: "grid gap-3", children: completedReports.map((report) => (_jsx("article", { className: "rounded-2xl border border-white/35 bg-white/10 p-4 backdrop-blur-[2px]", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("h3", { className: "section-title text-xl font-bold text-white", children: report.investigationName }), _jsxs("p", { className: "text-xs text-sky-100", children: [format(new Date(report.createdAt), 'PPP'), " - ", report.radiologistName] })] }), _jsx("div", { className: "flex justify-center", children: _jsxs("button", { type: "button", onClick: () => navigate(`/patient/reports/${report.id}`), className: "inline-flex items-center gap-2 rounded-xl border border-white/45 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 active:scale-95", children: [_jsx(FileText, { size: 16 }), "View Report"] }) })] }) }, report.id))) })] }));
}
