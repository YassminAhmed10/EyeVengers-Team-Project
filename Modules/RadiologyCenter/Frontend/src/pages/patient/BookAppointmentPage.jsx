import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CheckCircle2, ChevronLeft, ChevronRight, Mail, MapPin, Phone, UserRound } from 'lucide-react';
import { addDays, addMonths, endOfMonth, endOfWeek, format, isBefore, isSameDay, isSameMonth, startOfDay, startOfMonth, startOfWeek, subMonths, } from 'date-fns';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
const eyeScanTypes = [
    { id: 'oct-retina', label: 'OCT Retina', price: 850 },
    { id: 'oct-nerve', label: 'OCT Optic Nerve', price: 900 },
    { id: 'fundus-photo', label: 'Fundus Photography', price: 700 },
    { id: 'topography', label: 'Corneal Topography', price: 950 },
    { id: 'b-scan', label: 'B-Scan Ocular Ultrasound', price: 1100 },
    { id: 'ffa', label: 'Fluorescein Angiography', price: 1400 },
];
const slots = [
    { id: 'S1', time: '09:00 AM', duration: '30 min', isBooked: false },
    { id: 'S2', time: '09:30 AM', duration: '30 min', isBooked: true },
    { id: 'S3', time: '10:00 AM', duration: '30 min', isBooked: false },
    { id: 'S4', time: '10:30 AM', duration: '30 min', isBooked: false },
    { id: 'S5', time: '11:00 AM', duration: '30 min', isBooked: true },
    { id: 'S6', time: '11:30 AM', duration: '30 min', isBooked: false },
];
const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
export function BookAppointmentPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlotId, setSelectedSlotId] = useState(null);
    const [isBooked, setIsBooked] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
    const incomingScanType = String(location.state?.scanType ?? 'OCT Retina');
    const initialScanType = eyeScanTypes.find((item) => item.label.toLowerCase() === incomingScanType.toLowerCase())?.id ||
        'oct-retina';
    const [selectedScanType, setSelectedScanType] = useState(initialScanType);
    const selectedSlot = useMemo(() => slots.find((slot) => slot.id === selectedSlotId) ?? null, [selectedSlotId]);
    const selectedScan = eyeScanTypes.find((scan) => scan.id === selectedScanType) ?? eyeScanTypes[0];
    const selectedDateText = selectedDate ? format(selectedDate, 'PPP') : '';
    const price = selectedScan.price;
    const scanType = selectedScan.label;
    const patientName = localStorage.getItem('patientName') ||
        localStorage.getItem('userName') ||
        'Patient';
    const patientId = localStorage.getItem('patientId') || 'Not available';
    const patientEmail = localStorage.getItem('patientEmail') ||
        localStorage.getItem('userEmail') ||
        'Not available';
    const patientPhone = localStorage.getItem('patientPhone') || 'Not available';
    const patientDateOfBirth = localStorage.getItem('patientDateOfBirth') || 'Not available';
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const calendarDays = [];
    let dayCursor = calendarStart;
    while (dayCursor <= calendarEnd) {
        calendarDays.push(dayCursor);
        dayCursor = addDays(dayCursor, 1);
    }
    if (isBooked) {
        return (_jsx("section", { className: "flex min-h-[70vh] items-center justify-center", dir: "ltr", children: _jsxs("div", { className: "w-full max-w-2xl rounded-2xl border border-white/35 bg-white/10 p-8 text-center text-white backdrop-blur-[2px]", children: [_jsx("div", { className: "mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600", children: _jsx(CheckCircle2, { size: 46, className: "animate-bounce" }) }), _jsx("h2", { className: "section-title text-3xl font-bold text-green-700", children: "Booking Confirmed!" }), _jsx("p", { className: "mt-4 text-sm text-sky-100", children: scanType }), _jsxs("p", { className: "text-sm text-sky-100", children: ["Date: ", selectedDateText] }), _jsxs("p", { className: "text-sm text-sky-100", children: ["Time: ", selectedSlot?.time] }), _jsxs("p", { className: "text-sm text-sky-100", children: ["Patient: ", patientName, " (", patientId, ")"] }), _jsx("p", { className: "text-sm text-sky-100", children: "Location: Eye Radiology Center - Specialist Clinic" }), _jsx("button", { type: "button", onClick: () => navigate('/patient'), className: "mt-6 rounded-xl border border-white/55 bg-white/15 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/25 active:scale-95", children: "Back to Dashboard" })] }) }));
    }
    return (_jsxs("section", { className: "w-full space-y-6 pb-8 text-white", dir: "ltr", children: [_jsxs("div", { className: "p-4", children: [_jsx("h2", { className: "section-title text-2xl font-bold text-white", children: "Book Appointment" }), _jsx("p", { className: "mt-2 text-sm text-sky-100", children: "This booking is linked to the patient who opened the Radiology portal from Eye Clinic." }), _jsxs("div", { className: "mt-4 flex flex-wrap items-start gap-4 rounded-2xl border border-white/30 bg-white/10 p-4", children: [_jsx("div", { className: "flex h-16 w-16 items-center justify-center rounded-full border border-white/45 bg-white/15 text-white", children: _jsx(UserRound, { size: 28 }) }), _jsxs("div", { className: "grid flex-1 gap-2 text-sm text-sky-100 sm:grid-cols-2", children: [_jsxs("p", { children: [_jsx("span", { className: "font-semibold text-white", children: "Patient Name:" }), " ", patientName] }), _jsxs("p", { children: [_jsx("span", { className: "font-semibold text-white", children: "Patient ID:" }), " ", patientId] }), _jsxs("p", { className: "flex items-center gap-2", children: [_jsx(Mail, { size: 14 }), " ", patientEmail] }), _jsxs("p", { className: "flex items-center gap-2", children: [_jsx(Phone, { size: 14 }), " ", patientPhone] }), _jsxs("p", { children: [_jsx("span", { className: "font-semibold text-white", children: "Date of Birth:" }), " ", patientDateOfBirth] })] })] })] }), _jsxs("div", { className: "p-4", children: [_jsx("h3", { className: "section-title mb-3 text-xl font-bold text-white", children: "Choose Eye Scan Type" }), _jsx("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children: eyeScanTypes.map((scan) => {
                            const isActive = scan.id === selectedScanType;
                            return (_jsxs("button", { type: "button", onClick: () => setSelectedScanType(scan.id), className: `rounded-xl border p-3 text-left transition-all duration-200 ${isActive
                                    ? 'border-sky-200 bg-sky-500/35 text-white shadow-[0_0_0_1px_rgba(147,197,253,0.5)]'
                                    : 'border-white/35 bg-white/8 text-sky-50 hover:border-sky-200 hover:bg-sky-500/18 active:scale-95'}`, children: [_jsx("p", { className: "section-title text-base font-bold", children: scan.label }), _jsxs("p", { className: "mt-1 text-sm opacity-90", children: ["EGP ", scan.price] })] }, scan.id));
                        }) })] }), _jsxs("div", { className: "grid gap-6 px-4 lg:grid-cols-2", children: [_jsxs("div", { children: [_jsx("h3", { className: "section-title text-xl font-bold text-white", children: "Choose Date (Calendar)" }), _jsx("p", { className: "mt-1 text-sm text-sky-100", children: "Pick your date from the monthly calendar." }), _jsxs("div", { className: "mt-3 rounded-2xl border border-white/35 bg-white/12 p-4 backdrop-blur-[2px]", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsx("button", { type: "button", onClick: () => setCurrentMonth((prev) => subMonths(prev, 1)), className: "rounded-lg border border-white/45 bg-white/12 p-2 text-white transition hover:bg-white/24", "aria-label": "Previous month", title: "Previous month", children: _jsx(ChevronLeft, { size: 16 }) }), _jsx("h4", { className: "section-title text-2xl font-bold text-white", children: format(currentMonth, 'MMMM yyyy') }), _jsx("button", { type: "button", onClick: () => setCurrentMonth((prev) => addMonths(prev, 1)), className: "rounded-lg border border-white/45 bg-white/12 p-2 text-white transition hover:bg-white/24", "aria-label": "Next month", title: "Next month", children: _jsx(ChevronRight, { size: 16 }) })] }), _jsxs("div", { className: "grid grid-cols-7 overflow-hidden rounded-xl border border-sky-300/55", children: [weekDays.map((day) => (_jsx("div", { className: "bg-blue-700 px-2 py-3 text-center text-xs font-bold tracking-wide text-white", children: day }, day))), calendarDays.map((day) => {
                                                const isCurrentMonth = isSameMonth(day, monthStart);
                                                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                                                const isPast = isBefore(day, startOfDay(new Date()));
                                                const isDisabled = !isCurrentMonth || isPast;
                                                return (_jsx("button", { type: "button", disabled: isDisabled, onClick: () => setSelectedDate(day), className: `h-16 border border-slate-300/35 text-sm font-medium transition-all md:h-20 ${isSelected
                                                        ? 'bg-emerald-600 text-white'
                                                        : isDisabled
                                                            ? 'bg-slate-200/30 text-slate-300'
                                                            : 'bg-white/10 text-white hover:bg-sky-500/28 active:bg-sky-500/40'}`, children: format(day, 'd') }, day.toISOString()));
                                            })] })] }), selectedDate ? (_jsxs("p", { className: "mt-2 text-sm text-sky-100", children: ["Selected date: ", selectedDateText] })) : (_jsx("p", { className: "mt-2 text-sm text-sky-100", children: "No date selected yet." }))] }), _jsxs("div", { children: [_jsx("h3", { className: "section-title text-xl font-bold text-white", children: "Radiology Center Location" }), _jsx("p", { className: "mt-1 text-sm text-sky-100", children: "Find us on Google Maps and navigate easily." }), _jsx("div", { className: "mt-3 overflow-hidden rounded-2xl border border-white/40", children: _jsx("iframe", { title: "Radiology Center Map", src: "https://www.google.com/maps?q=30.0444,31.2357&z=14&output=embed", width: "100%", height: "280", className: "border-0", loading: "lazy", referrerPolicy: "no-referrer-when-downgrade" }) })] })] }), _jsxs("div", { className: "p-4", children: [_jsx("h3", { className: "section-title mb-3 text-xl font-bold text-white", children: "Choose Time Slot" }), _jsx("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children: slots.map((slot) => {
                            const isSelected = selectedSlotId === slot.id;
                            return (_jsxs("button", { type: "button", disabled: slot.isBooked, onClick: () => setSelectedSlotId(slot.id), className: `rounded-xl border p-3 text-left transition-all duration-200 ${slot.isBooked
                                    ? 'cursor-not-allowed border-white/20 bg-white/5 text-sky-200/60 line-through'
                                    : isSelected
                                        ? 'border-sky-200 bg-sky-500/35 text-white shadow-[0_0_0_1px_rgba(147,197,253,0.5)]'
                                        : 'border-white/35 bg-white/8 text-sky-50 hover:border-sky-200 hover:bg-sky-500/18 active:scale-95'}`, children: [_jsx("p", { className: "section-title text-base font-bold", children: slot.time }), _jsx("p", { className: "text-xs opacity-90", children: slot.duration })] }, slot.id));
                        }) })] }), _jsxs("div", { className: "p-4", children: [_jsx("h2", { className: "section-title text-xl font-bold text-white", children: "Radiology Center Details" }), _jsx("p", { className: "mt-1 text-sm text-sky-100", children: "Eye Radiology Center - Specialist Eye Clinic" }), _jsxs("div", { className: "mt-3 grid gap-2 text-sm text-sky-100 sm:grid-cols-2", children: [_jsxs("p", { className: "flex items-center gap-2", children: [_jsx(MapPin, { size: 16 }), " Tahrir Street, Cairo"] }), _jsxs("p", { className: "flex items-center gap-2", children: [_jsx(Phone, { size: 16 }), " 0100-555-1234"] })] }), _jsxs("p", { className: "mt-3 inline-block rounded-xl border border-white/40 bg-white/10 px-3 py-1 text-sm font-semibold text-white", children: ["Selected scan price: EGP ", price] })] }), _jsx("div", { className: "sticky bottom-3 z-20 p-4", children: _jsxs("div", { className: "mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/45 bg-white/12 px-4 py-3 text-sm text-white backdrop-blur-[3px]", children: [_jsxs("span", { children: ["Date: ", selectedDateText || 'Not selected'] }), _jsxs("span", { children: ["Time: ", selectedSlot?.time || 'Not selected'] }), _jsxs("span", { children: ["Price: EGP ", price] }), _jsx("button", { type: "button", disabled: !(selectedDate && selectedSlotId && selectedScanType), onClick: () => setIsBooked(true), className: "rounded-xl border border-white/55 bg-white/14 px-4 py-2 font-semibold text-white transition hover:bg-white/24 disabled:cursor-not-allowed disabled:opacity-50", children: "Confirm Booking" })] }) })] }));
}
