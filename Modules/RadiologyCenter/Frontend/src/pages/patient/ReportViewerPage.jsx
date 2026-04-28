import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ImagePreviewPanel } from '../../components/patient/ImagePreviewPanel';
import { ReportDetailsCard } from '../../components/patient/ReportDetailsCard';
const octImageUrl = new URL('../../assets/OCT-normal-retina-macula (1).jpg', import.meta.url).href;
const mockReports = [
    {
        id: 'R-101',
        scanOrderId: 'SO-11',
        patientId: 'P-1001',
        investigationName: 'OCT Retina',
        radiologistName: 'Dr. Mariam Khaled',
        createdAt: new Date().toISOString(),
        findings: 'Mild retinal layer thinning with early signs of limited fluid leakage.',
        impression: 'Periodic follow-up in 3 months is required for comparison.',
        reportUrl: '#',
        dicomImageUrl: octImageUrl,
    },
    {
        id: 'R-102',
        scanOrderId: 'SO-12',
        patientId: 'P-1001',
        investigationName: 'X-Ray Orbit',
        radiologistName: 'Dr. Ahmed Samy',
        createdAt: new Date().toISOString(),
        findings: 'No obvious fractures, and the orbital field appears within normal limits.',
        impression: 'Normal result.',
        reportUrl: '#',
    },
];
export function ReportViewerPage() {
    const { reportId } = useParams();
    const navigate = useNavigate();
    const report = useMemo(() => mockReports.find((item) => item.id === reportId) ?? mockReports[0], [reportId]);
    return (_jsxs("section", { className: "space-y-4 px-4", dir: "ltr", children: [_jsx("div", { className: "flex justify-start", children: _jsx("button", { type: "button", onClick: () => navigate('/patient/reports'), className: "rounded-xl border border-white/45 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 active:scale-95", children: "Back to Reports" }) }), _jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [_jsx(ReportDetailsCard, { report: report }), _jsx(ImagePreviewPanel, { imageUrl: report.dicomImageUrl })] })] }));
}
