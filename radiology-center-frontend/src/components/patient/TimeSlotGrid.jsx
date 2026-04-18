import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function TimeSlotGrid({ slots, selectedSlotId, onSelectSlot }) {
    return (_jsx("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2", dir: "ltr", children: slots.map((slot) => {
            const isSelected = selectedSlotId === slot.id;
            return (_jsxs("button", { type: "button", disabled: slot.isBooked, onClick: () => onSelectSlot(slot.id), className: `rounded-2xl border p-3 text-left transition-all duration-200 ${slot.isBooked
                    ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 line-through'
                    : isSelected
                        ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                        : 'border-blue-300 bg-white text-blue-700 hover:bg-blue-50 active:scale-95'}`, children: [_jsx("p", { className: "section-title text-base font-bold", children: slot.time }), _jsx("p", { className: "text-xs opacity-80", children: slot.duration })] }, slot.id));
        }) }));
}
