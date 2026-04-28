import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';
export function DeclineModal({ isOpen, onConfirm, onClose }) {
    const [reason, setReason] = useState('');
    if (!isOpen) {
        return null;
    }
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4", children: _jsxs("div", { className: "w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-6 shadow-xl", dir: "rtl", children: [_jsxs("div", { className: "mb-4 flex items-center gap-3 text-red-600", children: [_jsx(AlertTriangle, { size: 24 }), _jsx("h3", { className: "section-title text-xl font-bold", children: "\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F \u0645\u0646 \u0631\u0641\u0636 \u0647\u0630\u0627 \u0627\u0644\u0637\u0644\u0628\u061F" })] }), _jsx("p", { className: "mb-4 text-sm text-slate-600", children: "\u0633\u064A\u062A\u0645 \u0625\u062E\u0637\u0627\u0631 \u0627\u0644\u062F\u0643\u062A\u0648\u0631 \u0628\u0631\u0641\u0636\u0643" }), _jsx("label", { className: "mb-1 block text-sm font-medium text-slate-700", children: "\u0633\u0628\u0628 \u0627\u0644\u0631\u0641\u0636 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)" }), _jsx("textarea", { value: reason, onChange: (event) => setReason(event.target.value), rows: 4, className: "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-red-400", placeholder: "\u0627\u0643\u062A\u0628 \u0633\u0628\u0628 \u0627\u0644\u0631\u0641\u0636 \u0625\u0646 \u0648\u062C\u062F" }), _jsxs("div", { className: "mt-5 flex items-center justify-end gap-3", children: [_jsx("button", { type: "button", onClick: onClose, className: "rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 active:scale-95", children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx("button", { type: "button", onClick: () => {
                                onConfirm(reason);
                                setReason('');
                            }, className: "rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-95", children: "\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0631\u0641\u0636" })] })] }) }));
}
