import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Bell, Moon, Sun, ChevronDown, 
  Mail, Settings, LogOut, User, MessageCircle
} from 'lucide-react';
import GlobalSearchResults from '../../Common/GlobalSearchResults';
import PharmacyAssistant from '../../Common/PharmacyAssistant';
import { medicines as allMedicines, customers as allCustomers, prescriptions as allPrescriptions } from '../../data/mockData';

const Header = ({ 
  darkMode, 
  setDarkMode, searchQuery = '', setSearchQuery = () => {}, 
  notifications = [], onNavigate, pageTitle, pageSubtitle,
  userName = 'Doha', userRole = 'Pharmacist', onLogout = () => {}, showSearch = true
}) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [searchResults, setSearchResults] = useState({ medicines: [], customers: [], prescriptions: [] });
  const searchRef = useRef(null);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      
      // Search medicines
      const matchedMedicines = allMedicines.filter(med => 
        med.name.toLowerCase().includes(query) ||
        med.category.toLowerCase().includes(query) ||
        med.manufacturer?.toLowerCase().includes(query)
      );

      // Search customers
      const matchedCustomers = allCustomers.filter(cust => 
        cust.name.toLowerCase().includes(query) ||
        cust.email.toLowerCase().includes(query) ||
        cust.phone.includes(query)
      );

      // Search prescriptions
      const matchedPrescriptions = allPrescriptions.filter(rx => 
        (rx.patientName || rx.customer)?.toLowerCase().includes(query) ||
        rx.id?.toLowerCase().includes(query) ||
        rx.medication?.toLowerCase().includes(query)
      );

      setSearchResults({
        medicines: matchedMedicines,
        customers: matchedCustomers,
        prescriptions: matchedPrescriptions
      });
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
      setSearchResults({ medicines: [], customers: [], prescriptions: [] });
    }
  }, [searchQuery]);

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigate = (tab, item) => {
    onNavigate(tab);
    setShowSearchResults(false);
    setSearchQuery('');
  };

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Page Title */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {pageTitle}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {pageSubtitle || `Welcome back, ${userName}. Here's what's happening today.`}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {showSearch && (
            <div className="relative" ref={searchRef}>
              <div className="search-container animate-fade-in-right">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="Search medicines, prescriptions, customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim().length > 0 && setShowSearchResults(true)}
                  className="search-input"
                />
              </div>

              {showSearchResults && (
                <GlobalSearchResults 
                  results={searchResults}
                  onNavigate={handleNavigate}
                  onClose={() => setShowSearchResults(false)}
                />
              )}
            </div>
          )}

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfile(false);
              }}
              className="icon-button animate-pulse-once"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="notification-dot"></span>
              )}
            </button>

            {showNotifications && (
              <div className="dropdown-menu animate-fade-in-down">
                <div className="dropdown-header">
                  <span className="font-medium text-sm">Notifications</span>
                </div>
                <div className="dropdown-content">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div key={notif.id} className="dropdown-item">
                        <p className="text-sm">{notif.message}</p>
                        <span className="text-xs text-gray-400">{notif.time}</span>
                      </div>
                    ))
                  ) : (
                    <div className="dropdown-empty">
                      No notifications
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="icon-button animate-fade-in"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-amber-500" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          {/* AI Pharmacy Assistant Button */}
          <button
            onClick={() => setShowAssistant(!showAssistant)}
            className="icon-button animate-fade-in bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
            title="PharmaFlow AI Assistant"
          >
            <MessageCircle className="w-5 h-5" />
          </button>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
              }}
              className="profile-button"
            >
              <div className="profile-avatar">
                <User className="w-4 h-4" />
              </div>
              <span className="profile-name">{userName}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showProfile && (
              <div className="dropdown-menu animate-fade-in-down">
                <div className="dropdown-header">
                  <p className="font-medium text-sm">{userName}</p>
                  <p className="text-xs text-gray-400">{userRole}</p>
                </div>
                <div className="dropdown-actions">
                  <button className="dropdown-action">
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <button className="dropdown-action">
                    <Mail className="w-4 h-4" />
                    Inbox
                  </button>
                  <button className="dropdown-action">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                </div>
                <div className="dropdown-footer">
                  <button className="dropdown-action logout" onClick={onLogout}>
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .search-container {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 18px;
          height: 18px;
          color: #9ca3af;
          pointer-events: none;
        }
        
        .search-input {
          width: 300px;
          padding: 10px 12px 10px 40px;
          background: #f3f4f6;
          border: 1px solid transparent;
          border-radius: 25px;
          font-size: 14px;
          transition: all 0.3s ease;
        }
        
        .search-input:focus {
          outline: none;
          background: white;
          border-color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
          width: 350px;
        }
        
        .dark .search-input {
          background: #374151;
          color: #f3f4f6;
        }
        
        .dark .search-input:focus {
          background: #1f2937;
        }
        
        .icon-button {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #f3f4f6;
          border: none;
          color: #6b7280;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .icon-button:hover {
          background: #e5e7eb;
          color: #374151;
          transform: scale(1.05);
        }
        
        .dark .icon-button {
          background: #374151;
          color: #9ca3af;
        }
        
        .dark .icon-button:hover {
          background: #4b5563;
          color: #f3f4f6;
        }
        
        .notification-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
          border: 2px solid white;
        }
        
        .dark .notification-dot {
          border-color: #1f2937;
        }
        
        .profile-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px 6px 6px;
          background: #f3f4f6;
          border: none;
          border-radius: 25px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .profile-button:hover {
          background: #e5e7eb;
          transform: scale(1.02);
        }
        
        .dark .profile-button {
          background: #374151;
        }
        
        .dark .profile-button:hover {
          background: #4b5563;
        }
        

        .profile-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        
        .profile-name {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }
        
        .dark .profile-name {
          color: #f3f4f6;
        }
        
        .dropdown-menu {
          position: absolute;
          right: 0;
          top: calc(100% + 8px);
          width: 220px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          z-index: 100;
          overflow: hidden;
        }
        
        .dark .dropdown-menu {
          background: #1f2937;
          border: 1px solid #374151;
        }
        
        .dropdown-header {
          padding: 16px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .dark .dropdown-header {
          border-color: #374151;
        }
        
        .dropdown-content {
          max-height: 200px;
          overflow-y: auto;
        }
        
        .dropdown-item {
          padding: 12px 16px;
          border-bottom: 1px solid #f3f4f6;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        
        .dropdown-item:hover {
          background: #f9fafb;
        }
        
        .dark .dropdown-item {
          border-color: #374151;
        }
        
        .dark .dropdown-item:hover {
          background: #374151;
        }
        
        .dropdown-empty {
          padding: 24px;
          text-align: center;
          color: #9ca3af;
          font-size: 14px;
        }
        
        .dropdown-actions {
          padding: 8px;
        }
        
        .dropdown-action {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 12px;
          background: transparent;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .dropdown-action:hover {
          background: #f3f4f6;
        }
        
        .dark .dropdown-action {
          color: #e5e7eb;
        }
        
        .dark .dropdown-action:hover {
          background: #374151;
        }
        
        .dropdown-action.logout {
          color: #ef4444;
        }
        
        .dropdown-action.logout:hover {
          background: #fef2f2;
        }
        
        .dark .dropdown-action.logout:hover {
          background: #450a0a;
        }
        
        .dropdown-footer {
          padding: 8px;
          border-top: 1px solid #e5e7eb;
        }
        
        .dark .dropdown-footer {
          border-color: #374151;
        }
        
        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-fade-in-down {
          animation: fadeInDown 0.3s ease-out;
        }
        
        .animate-fade-in-right {
          animation: fadeInRight 0.3s ease-out;
        }
        
        .animate-pulse-once {
          animation: pulse 0.3s ease-out;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>

      {showSearch && (
        <PharmacyAssistant 
          isOpen={showAssistant}
          onClose={() => setShowAssistant(false)}
          onToggle={() => setShowAssistant(!showAssistant)}
          medicines={allMedicines}
          customers={allCustomers}
          prescriptions={allPrescriptions}
        />
      )}
    </header>
  );
};

export default Header;

