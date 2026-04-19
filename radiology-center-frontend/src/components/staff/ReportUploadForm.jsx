import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { uploadReport } from '../../api/reports.api';
const reportSchema = z.object({
    scanOrderId: z.string().min(1, 'Scan order ID is required'),
    notes: z.string().min(10, 'Notes must be at least 10 characters'),
    reportFile: z
        .custom((fileList) => fileList instanceof FileList)
        .refine((fileList) => fileList.length > 0, 'Please select a report file'),
});
export function ReportUploadForm({ onUploaded }) {
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, } = useForm({
        resolver: zodResolver(reportSchema),
    });
    const submitHandler = async (data) => {
        await uploadReport(data.scanOrderId, data.reportFile[0], data.notes);
        reset();
        onUploaded?.();
    };
    return (_jsxs("form", { className: "space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-panel", onSubmit: handleSubmit(submitHandler), children: [_jsx("h2", { className: "section-title text-xl font-semibold", children: "Upload Radiology Report" }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-medium", children: "Scan Order ID" }), _jsx("input", { ...register('scanOrderId'), className: "w-full rounded-lg border border-slate-300 px-3 py-2", placeholder: "SO-20341" }), errors.scanOrderId && (_jsx("p", { className: "mt-1 text-xs text-rose-600", children: errors.scanOrderId.message }))] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-medium", children: "Clinical Notes" }), _jsx("textarea", { ...register('notes'), rows: 4, className: "w-full rounded-lg border border-slate-300 px-3 py-2", placeholder: "Summarize findings and impression context" }), errors.notes && _jsx("p", { className: "mt-1 text-xs text-rose-600", children: errors.notes.message })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-medium", children: "Report File (PDF/Image)" }), _jsx("input", { ...register('reportFile'), type: "file", className: "w-full rounded-lg border border-slate-300 p-2" }), errors.reportFile && (_jsx("p", { className: "mt-1 text-xs text-rose-600", children: errors.reportFile.message }))] }), _jsx("button", { disabled: isSubmitting, className: "rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60", children: isSubmitting ? 'Uploading...' : 'Upload Report' })] }));
}
