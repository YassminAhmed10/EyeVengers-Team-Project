import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, Bell, Shield, Palette, 
  Database, Moon, Sun, Save, LogOut
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const Settings = ({ darkMode, setDarkMode, onLogout, userRole = 'Pharmacist' }) => {
  const { language, setLanguage } = useLanguage();
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState({
    // General
    pharmacyName: 'PharmaFlow',
    timezone: 'Africa/Cairo',
    
    // Appearance
    theme: darkMode ? 'dark' : 'light',
    sidebarCollapsed: false,
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    lowStockAlerts: true,
    expiryAlerts: true,
    salesReports: true,
    
    // Security
    twoFactorAuth: false,
    sessionTimeout: '30',
    
    // Data
    autoBackup: true,
    backupFrequency: 'daily'
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const sections = [
    { id: 'general', label: 'General', icon: <SettingsIcon size={20} /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette size={20} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
    { id: 'security', label: 'Security', icon: <Shield size={20} /> },
    { id: 'data', label: 'Data & Backup', icon: <Database size={20} /> },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4">Pharmacy Information</h3>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Pharmacy Name</label>
                  <input 
                    type="text" 
                    value={settings.pharmacyName}
                    onChange={(e) => handleChange('pharmacyName', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Language</label>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  >
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Timezone</label>
                  <select 
                    value={settings.timezone}
                    onChange={(e) => handleChange('timezone', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  >
                    <option value="Africa/Cairo">Africa/Cairo (GMT+2)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4">Theme</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    handleChange('theme', 'light');
                    setDarkMode(false);
                  }}
                  className={`p-6 rounded-2xl border-2 transition-all ${!darkMode ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <div className="w-full h-20 bg-white rounded-xl shadow-sm mb-3 flex items-center justify-center">
                    <Sun className="text-amber-500" size={32} />
                  </div>
                  <p className="font-bold text-slate-800">Light Mode</p>
                </button>
                <button
                  onClick={() => {
                    handleChange('theme', 'dark');
                    setDarkMode(true);
                  }}
                  className={`p-6 rounded-2xl border-2 transition-all ${darkMode ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <div className="w-full h-20 bg-slate-800 rounded-xl shadow-sm mb-3 flex items-center justify-center">
                    <Moon className="text-slate-200" size={32} />
                  </div>
                  <p className="font-bold text-slate-800">Dark Mode</p>
                </button>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4">Notification Channels</h3>
              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
                  { key: 'pushNotifications', label: 'Push Notifications', desc: 'Receive browser push notifications' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
                    <div>
                      <p className="font-bold text-slate-800">{item.label}</p>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => handleToggle(item.key)}
                      className={`w-14 h-8 rounded-full transition-all ${settings[item.key] ? 'bg-blue-500' : 'bg-slate-200'}`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${settings[item.key] ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4">Alert Types</h3>
              <div className="space-y-4">
                {[
                  { key: 'lowStockAlerts', label: 'Low Stock Alerts', desc: 'Get notified when inventory is low' },
                  { key: 'expiryAlerts', label: 'Expiry Alerts', desc: 'Alert before medicines expire' },
                  { key: 'salesReports', label: 'Daily Sales Reports', desc: 'Receive daily sales summary' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
                    <div>
                      <p className="font-bold text-slate-800">{item.label}</p>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => handleToggle(item.key)}
                      className={`w-14 h-8 rounded-full transition-all ${settings[item.key] ? 'bg-blue-500' : 'bg-slate-200'}`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${settings[item.key] ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4">Authentication</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
                  <div>
                    <p className="font-bold text-slate-800">Two-Factor Authentication</p>
                    <p className="text-sm text-slate-500">Add an extra layer of security</p>
                  </div>
                  <button
                    onClick={() => handleToggle('twoFactorAuth')}
                    className={`w-14 h-8 rounded-full transition-all ${settings.twoFactorAuth ? 'bg-blue-500' : 'bg-slate-200'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${settings.twoFactorAuth ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Session Timeout (minutes)</label>
                  <select 
                    value={settings.sessionTimeout}
                    onChange={(e) => handleChange('sessionTimeout', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="never">Never</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4">Backup Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
                  <div>
                    <p className="font-bold text-slate-800">Auto Backup</p>
                    <p className="text-sm text-slate-500">Automatically backup your data</p>
                  </div>
                  <button
                    onClick={() => handleToggle('autoBackup')}
                    className={`w-14 h-8 rounded-full transition-all ${settings.autoBackup ? 'bg-blue-500' : 'bg-slate-200'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${settings.autoBackup ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
                {settings.autoBackup && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Backup Frequency</label>
                    <select 
                      value={settings.backupFrequency}
                      onChange={(e) => handleChange('backupFrequency', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-4">
              <button className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                <Database size={18} />
                Export Data
              </button>
              <button className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                <Database size={18} />
                Import Data
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans text-slate-800">
      {/* Header */}
      <header className="flex items-center gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-lg shadow-blue-200">
          <SettingsIcon className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900">Settings</h1>
          <p className="text-slate-500 font-medium">Manage your {userRole.toLowerCase()} preferences</p>
        </div>
      </header>

      <div className="flex gap-8">
        {/* Sidebar Navigation */}
        <div className="w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeSection === section.id ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span className={activeSection === section.id ? 'text-blue-500' : 'text-slate-400'}>
                  {section.icon}
                </span>
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
            {renderSection()}
            
            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
              <div>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2"
                  >
                    <LogOut size={18} />
                    Log out
                  </button>
                )}
              </div>
              <button className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200">
                <Save size={18} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

