import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
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
        <NavLink 
          to="/" 
          className={({ isActive }) => `flex items-center gap-4 px-6 py-4 rounded-xl text-white text-lg ${
            isActive ? 'bg-white/30 font-bold shadow-lg' : 'hover:bg-white/10 transition-colors'
          }`}
        >
          <span className="material-symbols-outlined text-[28px]">dashboard</span>
          <span className="font-semibold">Dashboard</span>
        </NavLink>

        <NavLink 
          to="/patients" 
          className={({ isActive }) => `flex items-center gap-4 px-6 py-4 rounded-xl text-white text-lg ${
            isActive ? 'bg-white/30 font-bold shadow-lg' : 'hover:bg-white/10 transition-colors'
          }`}
        >
          <span className="material-symbols-outlined text-[28px]">group</span>
          <span className="font-semibold">Patients</span>
        </NavLink>

        <NavLink 
          to="/appointments"  
          className={({ isActive }) => `flex items-center gap-4 px-6 py-4 rounded-xl text-white text-lg ${
            isActive ? 'bg-white/30 font-bold shadow-lg' : 'hover:bg-white/10 transition-colors'
          }`}
        >
          <span className="material-symbols-outlined text-[28px]">calendar_month</span>
          <span className="font-semibold">Appointments</span>
        </NavLink>

        <NavLink 
          to="/finance"  
          className={({ isActive }) => `flex items-center gap-4 px-6 py-4 rounded-xl text-white text-lg ${
            isActive ? 'bg-white/30 font-bold shadow-lg' : 'hover:bg-white/10 transition-colors'
          }`}
        >
          <span className="material-symbols-outlined text-[28px]">receipt_long</span>
          <span className="font-semibold">Finance</span>
        </NavLink>

        <NavLink 
          to="/clinic-system"  
          className={({ isActive }) => `flex items-center gap-4 px-6 py-4 rounded-xl text-white text-lg ${
            isActive ? 'bg-white/30 font-bold shadow-lg' : 'hover:bg-white/10 transition-colors'
          }`}
        >
          <span className="material-symbols-outlined text-[28px]">local_hospital</span>
          <span className="font-semibold">Clinic System</span>
        </NavLink>
      </nav>

      <div className="p-4 border-t border-white/20">
        <NavLink 
          to="/settings" 
          className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg text-white ${
            isActive ? 'bg-white/30 font-bold shadow-lg' : 'hover:bg-white/10 transition-colors'
          }`}
        >
          <span className="material-symbols-outlined text-white">settings</span>
          <span className="font-medium">Settings</span>
        </NavLink>

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
};

export default Sidebar;
