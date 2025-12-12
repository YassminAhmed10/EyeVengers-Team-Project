import React from "react";
import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-80 bg-brand text-white flex flex-col fixed h-full">
      <div className="p-6 flex items-center gap-3">
        <img 
          className="w-14 h-14 rounded-full object-cover border-2 border-white"
          src="/src/images/logo.png"
          alt="Clinic Logo"
        />
        <div className="flex flex-col">
          <p className="font-semibold text-lg leading-tight">Dr. Mohab Khairy</p>
          <span className="text-sm text-white/70 leading-tight">Ophthalmologist</span>
        </div>
      </div>

      <nav className="flex-1 px-6 py-4 flex flex-col gap-4">
        <Link 
          to="/" 
          className={`flex items-center gap-4 px-6 py-4 rounded-xl text-white text-lg transition-colors ${
            location.pathname === "/" ? "bg-white/20" : "hover:bg-white/10"
          }`}
        >
          <span className="material-symbols-outlined text-[28px]">dashboard</span>
          <span className="font-semibold">Dashboard</span>
        </Link>

        <Link 
          to="/patients" 
          className={`flex items-center gap-4 px-6 py-4 rounded-xl text-white text-lg transition-colors ${
            location.pathname === "/patients" ? "bg-white/20" : "hover:bg-white/10"
          }`}
        >
          <span className="material-symbols-outlined text-[28px]">group</span>
          <span className="font-semibold">Patients</span>
        </Link>

        <Link 
          to="/appointments" 
          className={`flex items-center gap-4 px-6 py-4 rounded-xl text-white text-lg transition-colors ${
            location.pathname === "/appointments" ? "bg-white/20" : "hover:bg-white/10"
          }`}
        >
          <span className="material-symbols-outlined text-[28px]">calendar_month</span>
          <span className="font-semibold">Appointments</span>
        </Link>

        <Link 
          to="/finance" 
          className={`flex items-center gap-4 px-6 py-4 rounded-xl text-white text-lg transition-colors ${
            location.pathname === "/finance" ? "bg-white/20" : "hover:bg-white/10"
          }`}
        >
          <span className="material-symbols-outlined text-[28px]">receipt_long</span>
          <span className="font-semibold">Finance</span>
        </Link>

        <Link 
          to="/clinic-system" 
          className={`flex items-center gap-4 px-6 py-4 rounded-xl text-white text-lg transition-colors ${
            location.pathname === "/clinic-system" ? "bg-white/20" : "hover:bg-white/10"
          }`}
        >
          <span className="material-symbols-outlined text-[28px]">local_hospital</span>
          <span className="font-semibold">Clinic Management</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-white/20">
        <Link 
          to="/settings" 
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-white"
        >
          <span className="material-symbols-outlined text-white">settings</span>
          <span className="font-medium">Settings</span>
        </Link>
        <div className="flex items-center gap-3 mt-4 p-2">
          <img 
            className="w-12 h-12 rounded-full object-cover border-2 border-white"
            src="src/images/doctor.jpg"
            alt="Dr. Mohab Khairy"
          />
          <div>
            <p className="font-heading font-semibold">Dr. Mohab Khairy</p>
            <p className="text-sm text-white/70">Ophthalmologist</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;