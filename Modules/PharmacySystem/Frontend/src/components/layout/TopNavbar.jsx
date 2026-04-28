import React, { useState } from 'react';
import { 
  LayoutDashboard, Package, FileText, ShoppingCart, 
  Users, BarChart3, Settings, LogOut, User, Menu, X, Globe
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import './TopNavbar.css';

const defaultMenuItems = [
  { id: 'dashboard', labelEn: 'Dashboard', labelAr: 'لوحة التحكم', icon: <LayoutDashboard size={20} /> },
  { id: 'inventory', labelEn: 'Inventory', labelAr: 'المخزون', icon: <Package size={20} /> },
  { id: 'prescriptions', labelEn: 'Prescriptions', labelAr: 'الوصفات الطبية', icon: <FileText size={20} /> },
  { id: 'sales', labelEn: 'Point of Sale', labelAr: 'نقاط البيع', icon: <ShoppingCart size={20} /> },
  { id: 'customers', labelEn: 'Customers', labelAr: 'العملاء', icon: <Users size={20} /> },
  { id: 'reports', labelEn: 'Reports', labelAr: 'التقارير', icon: <BarChart3 size={20} /> },
  { id: 'settings', labelEn: 'Settings', labelAr: 'الإعدادات', icon: <Settings size={20} /> }
];

const TopNavbar = ({
  activeTab,
  setActiveTab,
  darkMode,
  menuItems = defaultMenuItems,
  userName = 'Doha',
  userRole = 'Pharmacist',
  onLogout = () => {}
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, toggleLanguage, isRTL } = useLanguage();

  const getLabel = (item) => language === 'ar' ? item.labelAr : item.labelEn;

  return (
    <nav className={`top-navbar ${darkMode ? 'dark' : ''}`}>
      <div className="navbar-container">
        {/* Logo Section */}
        <div className="navbar-brand">
          <div className="pharmacy-logo-animated">
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-white">
              {/* Pharmacy/Medical Cross Symbol */}
              <rect x="9" y="2" width="6" height="20" rx="1" fill="currentColor" opacity="0.9"/>
              <rect x="2" y="9" width="20" height="6" rx="1" fill="currentColor" opacity="0.9"/>
              {/* Plus sign in center */}
              <rect x="10" y="10" width="4" height="4" rx="0.5" fill="white"/>
            </svg>
            <div className="logo-pulse"></div>
          </div>
          <div className="brand-text">
            <h2>PharmaFlow</h2>
            <p>Management System</p>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className={`navbar-menu ${isRTL ? 'rtl' : ''}`}>
          {menuItems.map((item, index) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-item-animated ${isActive ? 'active' : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <span className="nav-icon-animated">{item.icon}</span>
                <span className="nav-label-animated">{getLabel(item)}</span>
                {isActive && <div className="active-indicator"></div>}
              </button>
            );
          })}
        </div>

        {/* User Section with Language Toggle */}
        <div className="navbar-user">
          {/* Language Toggle Button */}
          <button 
            onClick={toggleLanguage}
            className="language-toggle-btn"
            title={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
          >
            <Globe size={18} />
            <span className="language-label">{language === 'en' ? 'ع' : 'EN'}</span>
          </button>
          
          <div className="user-profile-animated">
            <div className="user-avatar-animated">
              <User size={18} />
            </div>
            <div className="user-info-animated">
              <h3>{userName}</h3>
              <p>{userRole}</p>
            </div>
          </div>
          <button className="logout-btn-animated" onClick={onLogout}>
            <LogOut size={18} />
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        {menuItems.map((item, index) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <span className="nav-icon-animated">{item.icon}</span>
              <span className="nav-label-animated">{getLabel(item)}</span>
            </button>
          );
        })}
        <div className="mobile-user-section">
          <button 
            onClick={toggleLanguage}
            className="language-toggle-btn mobile"
          >
            <Globe size={18} />
            <span>{language === 'en' ? 'العربية' : 'English'}</span>
          </button>
          <div className="user-profile-animated">
            <div className="user-avatar-animated">
              <User size={18} />
            </div>
            <div className="user-info-animated">
              <h3>{userName}</h3>
              <p>{userRole}</p>
            </div>
          </div>
          <button className="logout-btn-animated" onClick={onLogout}>
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Inline styles for language toggle */}
      <style>{`
        .language-toggle-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
        }
        
        .language-toggle-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }
        
        .language-label {
          font-size: 12px;
          font-weight: 700;
        }
        
        .language-toggle-btn.mobile {
          width: 100%;
          justify-content: center;
          margin-bottom: 10px;
        }
        
        .navbar-menu.rtl {
          flex-direction: row-reverse;
        }
      `}</style>
    </nav>
  );
};

export default TopNavbar;

