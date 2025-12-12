import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import ReceptionistSidebar from './ReceptionistSidebar';
import ReceptionistHeader from './ReceptionistHeader';
import '../DoctorDashboard/Sidebar.css';
import '../DoctorDashboard/Header.css';

const ReceptionistLayout = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    applyDarkMode(darkMode);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyDarkMode = (isDark) => {
    if (isDark) {
      document.body.classList.add('dark-mode');
      document.body.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      document.body.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
    applyDarkMode(newDarkMode);
  };
  
  const toggleSidebar = () => {
    const newCollapsed = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsed);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newCollapsed));
  };

  return (
    <div className="flex h-screen bg-neutral text-text font-body" style={{ background: 'var(--primary-bg)' }}>
      <ReceptionistSidebar collapsed={sidebarCollapsed} />
      <div 
        className="flex-1 flex flex-col" 
        style={{ 
          marginLeft: window.innerWidth > 768 ? (sidebarCollapsed ? '120px' : '320px') : '0',
          transition: 'margin-left 0.3s ease',
          width: '100%',
          maxWidth: '100vw',
          overflow: 'hidden'
        }}
      >
        <ReceptionistHeader 
          toggleDarkMode={toggleDarkMode} 
          darkMode={darkMode}
          toggleSidebar={toggleSidebar}
        />
        <main 
          className="overflow-y-auto overflow-x-hidden" 
          style={{ 
            background: 'var(--primary-bg)', 
            minHeight: 'calc(100vh - 70px)',
            width: '100%',
            maxWidth: '100%',
            padding: '12px 16px'
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ReceptionistLayout;
