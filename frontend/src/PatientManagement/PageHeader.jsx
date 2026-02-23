
import React, { useState, useRef, useEffect } from 'react';

const Header = () => {
  const currentDate = new Date().toLocaleDateString('ar-EG', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const [isOpen, setIsOpen] = useState(false); 
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 shadow-lg p-6 flex justify-between items-center sticky top-0 z-10 border-b-4 border-blue-700">
      
      <div className="flex items-center gap-6">
        <div className="flex items-start gap-4 flex-1">
          <div className="pt-1">
            <span className="material-symbols-outlined text-6xl text-white drop-shadow-md">person_search</span>
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <h2 className="text-4xl font-heading font-bold text-white drop-shadow-sm">
                إدارة المرضى
              </h2>
              <p className="text-sm font-medium text-blue-100 mt-1">
                Patient Management System
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30 w-fit">
              <span className="material-symbols-outlined text-lg text-blue-100">calendar_today</span>
              <p className="text-blue-50 font-medium">
                {currentDate}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        
        {/* Statistics Cards */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30 hover:bg-white/30 transition-all">
            <p className="text-blue-50 text-xs font-semibold uppercase tracking-wide">Total Patients</p>
            <p className="text-3xl font-bold text-white">248</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30 hover:bg-white/30 transition-all">
            <p className="text-blue-50 text-xs font-semibold uppercase tracking-wide">Appointments Today</p>
            <p className="text-3xl font-bold text-white">12</p>
          </div>
        </div>

        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="relative p-3 text-white hover:bg-white/20 rounded-lg transition-all duration-300"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="material-symbols-outlined text-3xl">notifications</span>
            <span className="absolute top-1 right-1 block h-3 w-3 rounded-full bg-red-500 animate-pulse border-2 border-white"></span>
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl overflow-hidden z-20 border border-gray-100">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined">notifications_active</span>
                الإشعارات (Notifications)
              </div>
              <div className="max-h-72 overflow-y-auto">
                <ul>
                  <li className="px-5 py-4 hover:bg-blue-50 transition-colors cursor-pointer border-b border-gray-100 flex items-start gap-3">
                    <span className="material-symbols-outlined text-blue-600 text-5xl mt-1">person</span>
                    <div>
                      <p className="font-semibold text-gray-800">Yassmin Ahmed</p>
                      <p className="text-sm text-gray-600">تسجيل الدخول جديد - New Check-in</p>
                      <p className="text-xs text-gray-500 mt-1">قبل 5 دقائق - 5 min ago</p>
                    </div>
                  </li>
                  <li className="px-5 py-4 hover:bg-blue-50 transition-colors cursor-pointer border-b border-gray-100 flex items-start gap-3">
                    <span className="material-symbols-outlined text-orange-600 text-5xl mt-1">event_busy</span>
                    <div>
                      <p className="font-semibold text-gray-800">Maysoun Hassan</p>
                      <p className="text-sm text-gray-600">تم إلغاء الموعد - Appointment Cancelled</p>
                      <p className="text-xs text-gray-500 mt-1">قبل ساعة - 1 hour ago</p>
                    </div>
                  </li>
                  <li className="px-5 py-4 hover:bg-blue-50 transition-colors cursor-pointer border-b border-gray-100 flex items-start gap-3">
                    <span className="material-symbols-outlined text-green-600 text-5xl mt-1">lab_panel</span>
                    <div>
                      <p className="font-semibold text-gray-800">Doha Waleed</p>
                      <p className="text-sm text-gray-600">نتائج الفحوصات جاهزة - Lab Results Ready</p>
                      <p className="text-xs text-gray-500 mt-1">قبل ساعتين - 2 hours ago</p>
                    </div>
                  </li>
                  <li className="px-5 py-4 hover:bg-blue-50 transition-colors cursor-pointer flex items-start gap-3">
                    <span className="material-symbols-outlined text-purple-600 text-5xl mt-1">mail</span>
                    <div>
                      <p className="font-semibold text-gray-800">Zeina Mohamed</p>
                      <p className="text-sm text-gray-600">رسالة جديدة - New Message</p>
                      <p className="text-xs text-gray-500 mt-1">قبل 30 دقيقة - 30 min ago</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="p-3 bg-gray-50 border-t text-center">
                <a href="#" className="text-blue-600 font-semibold hover:text-blue-700 text-sm">
                  اعرض جميع الإشعارات - View All
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <button className="p-3 text-white hover:bg-white/20 rounded-lg transition-all duration-300">
          <span className="material-symbols-outlined text-3xl">account_circle</span>
        </button>
      </div>
    </header>
  );
};

export default Header;




