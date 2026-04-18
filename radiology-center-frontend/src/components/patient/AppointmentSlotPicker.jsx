import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
const slotSchema = z.object({
    slotId: z.string().min(1, 'Please choose one slot'),
});
export function AppointmentSlotPicker({ slots, onSubmit }) {
    const { register, handleSubmit, formState: { errors }, } = useForm({
        resolver: zodResolver(slotSchema),
    });
    return (_jsxs("form", { onSubmit: handleSubmit((values) => onSubmit(values.slotId)), className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-panel", children: [_jsx("h2", { className: "section-title mb-3 text-xl font-semibold", children: "Choose a Time Slot" }), _jsx("div", { className: "grid gap-2 sm:grid-cols-2", children: slots.map((slot) => (_jsxs("label", { className: `flex items-center gap-3 rounded-lg border p-3 ${slot.isAvailable
                        ? 'border-slate-300 text-slate-700'
                        : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'}`, children: [_jsx("input", { type: "radio", value: slot.id, disabled: !slot.isAvailable, ...register('slotId') }), _jsxs("span", { className: "text-sm", children: [format(new Date(slot.date), 'PPP'), " | ", slot.startTime, " - ", slot.endTime, " (", slot.scannerRoom, ")"] })] }, slot.id))) }), errors.slotId && _jsx("p", { className: "mt-2 text-xs text-rose-600", children: errors.slotId.message }), _jsx("button", { className: "mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white", children: "Confirm Slot" })] }));
}
