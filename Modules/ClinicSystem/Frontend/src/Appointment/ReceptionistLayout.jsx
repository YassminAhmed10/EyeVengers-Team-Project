import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import ReceptionistSidebar from './ReceptionistSidebar';
import ReceptionistHeader from './ReceptionistHeader';
import './ReceptionistLayout.css';

const ReceptionistLayout = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    // على الموبايل، نبدأ مغلق. على الديسكتوب، نبدأ مفتوح
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return window.innerWidth <= 768; // مغلق على الموبايل، مفتوح على الديسكتوب
  });

  useEffect(() => {
    applyDarkMode(darkMode);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarCollapsed(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
    <div className="receptionist-main-layout" style={{ background: 'var(--primary-bg)' }}>
      <ReceptionistSidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={toggleSidebar} 
      />
      
      <div className={`receptionist-content ${sidebarCollapsed ? 'sidebar-closed' : 'sidebar-open'}`}>
        <ReceptionistHeader 
          toggleDarkMode={toggleDarkMode} 
          darkMode={darkMode}
          toggleSidebar={toggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
        />
        
        <main className="receptionist-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ReceptionistLayout;
