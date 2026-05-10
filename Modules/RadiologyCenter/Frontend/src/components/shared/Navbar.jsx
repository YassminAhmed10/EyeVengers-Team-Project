import { ArrowLeft } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import logo from '../../assets/logo.png';

export function Navbar({ title, subtitle, connectionText, mode = 'default', backToUrl, patientName }) {
    const displayTitle = patientName ? `${patientName}` : 'Radiology Center';

    return (
        <header className="mb-6 px-4 py-2 md:px-6 md:py-3 border-b border-slate-200">
            {/* Top Bar - Logo, Title, Back Button */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Logo and Title */}
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white p-1 shadow-sm md:h-12 md:w-12">
                        <img src={logo} alt="Radiology Center" className="h-full w-full object-contain" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="truncate text-lg md:text-xl font-bold text-slate-900">
                            {displayTitle}
                        </h1>
                    </div>
                </div>

                {/* Right Side - Avatar and Back Button */}
                <div className="flex items-center gap-3 md:gap-4">
                    {/* Avatar with Initials */}
                    {patientName && (
                        <div className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full bg-cyan-500 text-white text-xs font-bold">
                            {patientName
                                .split(' ')
                                .map(n => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2)}
                        </div>
                    )}

                    {/* Back to Clinic Button */}
                    {backToUrl && (
                        <a
                            href={backToUrl}
                            className="text-cyan-600 hover:text-cyan-700 transition-colors text-sm md:text-base font-semibold flex items-center gap-1"
                            title="Back to Eye Clinic"
                        >
                            <ArrowLeft size={16} />
                            <span className="hidden md:inline">العودة للعيادة</span>
                            <span className="md:hidden">رجوع</span>
                        </a>
                    )}
                </div>
            </div>

            {/* Navigation Links */}
            {mode === 'patient' && (
                <nav className="mt-3 flex flex-wrap justify-center gap-4 md:gap-8 text-sm md:text-base border-t border-slate-200 pt-3">
                    <NavLink
                        to="/patient"
                        end={true}
                        className={({ isActive }) =>
                            `font-semibold transition-colors pb-2 border-b-2 ${
                                isActive
                                    ? 'text-cyan-600 border-cyan-600'
                                    : 'text-slate-600 border-transparent hover:text-slate-900'
                            }`
                        }
                    >
                        Dashboard
                    </NavLink>
                    <NavLink
                        to="/patient/book-appointment"
                        className={({ isActive }) =>
                            `font-semibold transition-colors pb-2 border-b-2 ${
                                isActive
                                    ? 'text-cyan-600 border-cyan-600'
                                    : 'text-slate-600 border-transparent hover:text-slate-900'
                            }`
                        }
                    >
                        Book Appointment
                    </NavLink>
                    <NavLink
                        to="/patient/reports"
                        className={({ isActive }) =>
                            `font-semibold transition-colors pb-2 border-b-2 ${
                                isActive
                                    ? 'text-cyan-600 border-cyan-600'
                                    : 'text-slate-600 border-transparent hover:text-slate-900'
                            }`
                        }
                    >
                        Reports
                    </NavLink>
                </nav>
            )}
        </header>
    );
}
