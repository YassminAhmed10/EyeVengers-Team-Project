import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, NavLink } from 'react-router-dom';
import { ClipboardList, FileText, LayoutDashboard } from 'lucide-react';
const staffLinks = [
    { to: '/staff', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/staff/worklist', label: 'Worklist', icon: ClipboardList },
    { to: '/staff/reports', label: 'Reports', icon: FileText },
];
export function Sidebar() {
    return (_jsxs("aside", { className: "w-full border-r border-slate-200 bg-white/80 p-4 backdrop-blur md:w-72", children: [_jsx(Link, { to: "/staff", className: "section-title mb-6 block text-xl font-bold text-ink", children: "Radiology Center" }), _jsx("nav", { className: "space-y-2", children: staffLinks.map(({ to, label, icon: Icon }) => (_jsxs(NavLink, { to: to, end: to === '/staff', className: ({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-primary text-white' : 'text-slate-700 hover:bg-slate-100'}`, children: [_jsx(Icon, { size: 18 }), _jsx("span", { children: label })] }, to))) })] }));
}
