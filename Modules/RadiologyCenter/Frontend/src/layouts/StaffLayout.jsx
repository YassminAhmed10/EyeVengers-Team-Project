import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/shared/Sidebar';
import { Navbar } from '../components/shared/Navbar';
import { useSignalRContext } from '../context/SignalRContext';
export function StaffLayout() {
    const { connectionState } = useSignalRContext();
    return (_jsxs("div", { className: "min-h-screen md:flex", children: [_jsx(Sidebar, {}), _jsxs("main", { className: "flex-1 p-4 md:p-8", children: [_jsx(Navbar, { title: "Staff Console", subtitle: "Radiology workflow, scan order queue, and reporting", connectionText: `SignalR: ${connectionState}` }), _jsx(Outlet, {})] })] }));
}
