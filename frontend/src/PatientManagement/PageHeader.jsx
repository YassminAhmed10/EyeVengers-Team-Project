
import React, { useState, useRef, useEffect } from 'react';

const Header = () => {
  const currentDate = new Date().toLocaleDateString('en-US', { 
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
    <header className="bg-primary shadow-sm p-8 flex justify-between items-center sticky top-0 z-10">
      
      <div className="flex flex-col gap-3">
        <h2 className="text-4xl font-heading font-bold text-text">
          Patient Management
        </h2>
        <p className="text-lg font-medium text-text/80 bg-secondary/30 px-3 py-1 rounded-md w-fit">
          {currentDate}
        </p>
      </div>

      <div className="flex items-center gap-6">
        

        <div className="relative" ref={dropdownRef}>
          <button
            className="relative p-3 text-text/70 hover:text-accent transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="material-symbols-outlined text-4xl">notifications</span>
            <span className="absolute top-2 right-2 block h-3.5 w-3.5 rounded-full bg-red-600"></span>
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg overflow-hidden z-20">
              <div className="p-4 border-b border-gray-200 font-semibold text-gray-800">
                Notifications
              </div>
              <div className="max-h-64 overflow-y-auto">
                <ul>
                  <li className="px-4 py-3 hover:bg-gray-100 transition-colors cursor-pointer">
                    Patient Yassmin Ahmed checked in
                  </li>
                  <li className="px-4 py-3 hover:bg-gray-100 transition-colors cursor-pointer">
                    Appointment with Maysoun Hassan cancelled
                  </li>
                  <li className="px-4 py-3 hover:bg-gray-100 transition-colors cursor-pointer">
                    New message from Zeina Mohamed
                  </li>
                  <li className="px-4 py-3 hover:bg-gray-100 transition-colors cursor-pointer">
                    Lab results ready for Doha Waleed
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;




