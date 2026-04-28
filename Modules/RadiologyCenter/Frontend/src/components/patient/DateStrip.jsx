import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { addDays, format, isSameDay } from 'date-fns';
export function DateStrip({ selectedDate, unavailableDates, onSelectDate }) {
    const days = Array.from({ length: 14 }, (_, index) => addDays(new Date(), index));
    return (_jsx("div", { className: "flex gap-2 overflow-x-auto pb-1", dir: "ltr", children: days.map((day) => {
            const isUnavailable = unavailableDates.includes(format(day, 'yyyy-MM-dd'));
            const isActive = selectedDate ? isSameDay(selectedDate, day) : false;
            return (_jsxs("button", { type: "button", disabled: isUnavailable, onClick: () => onSelectDate(day), className: `min-w-20 rounded-2xl border px-3 py-2 text-center transition-all duration-300 ${isUnavailable
                    ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                    : isActive
                        ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                        : 'border-blue-200 bg-white text-blue-700 hover:border-blue-400 hover:bg-blue-50 active:scale-95'}`, children: [_jsx("p", { className: "text-xs font-semibold", children: format(day, 'EEE') }), _jsx("p", { className: "section-title text-lg font-bold", children: format(day, 'd') })] }, day.toISOString()));
        }) }));
}
