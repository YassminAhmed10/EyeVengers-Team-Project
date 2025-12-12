import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Settings.css';

function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    clinicName: '',
    address: '',
    workStart: '09:00',
    workEnd: '17:00'
  });
  const [notifications, setNotifications] = useState({
    email: true,
    appointments: true,
    payments: false
  });
  const [selectedTheme, setSelectedTheme] = useState('light');

  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    
    if (!isAuthenticated || !role) {
      navigate("/login");
      return;
    }
    setUserRole(role);

    if (role === 'Doctor') {
      setFormData({
        name: 'Dr. Mohab Khairy',
        email: 'mohab.khairy@clinic.com',
        phone: '+20 123 456 7890',
        specialty: 'Ophthalmologist',
        clinicName: 'Eye Care Clinic',
        address: 'Cairo, Egypt',
        workStart: '09:00',
        workEnd: '17:00'
      });
    } else if (role === 'Receptionist') {
      setFormData({
        name: 'Receptionist',
        email: 'receptionist@clinic.com',
        phone: '+20 123 456 7891',
        specialty: '',
        clinicName: 'Eye Care Clinic',
        address: 'Cairo, Egypt',
        workStart: '08:00',
        workEnd: '18:00'
      });
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNotificationChange = (key) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key]
    });
  };

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: 'person' },
    { id: 'clinic', label: 'Clinic Info', icon: 'local_hospital' },
    { id: 'appearance', label: 'Appearance', icon: 'palette' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications' },
    { id: 'security', label: 'Security', icon: 'lock' }
  ];

  const getPageTitle = () => {
    if (userRole === 'Doctor') {
      return "Doctor Settings";
    } else if (userRole === 'Receptionist') {
      return "Receptionist Settings";
    }
    return "Settings";
  };

  const getPageSubtitle = () => {
    if (userRole === 'Doctor') {
      return "Manage your account and clinic preferences";
    } else if (userRole === 'Receptionist') {
      return "Manage your receptionist account and preferences";
    }
    return "Manage your account preferences";
  };

  if (!userRole) {
    return <div>Loading...</div>;
  }

  return (
    <div className="settings-wrapper">
      <div className="settings-page" style={{ marginLeft: 0 }}>
        <div className="settings-header">
          <div>
            <h2 className="settings-title">{getPageTitle()}</h2>
            <p className="settings-subtitle">{getPageSubtitle()}</p>
          </div>
          <button className="btn-save" onClick={handleSave}>
            <span className="material-symbols-outlined">save</span>
            Save Changes
          </button>
        </div>

        <div className="settings-container">
          <div className="settings-sidebar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="material-symbols-outlined">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="settings-content">
            {activeTab === 'account' && (
              <div className="settings-section">
                <div className="section-header">
                  <h3>Account Information</h3>
                  <p>Update your personal and professional details</p>
                </div>

                <div className="profile-photo-section">
                  <img 
                    src={userRole === 'Doctor' 
                      ? "https://via.placeholder.com/80x80/0077B6/FFFFFF?text=DR" 
                      : "https://via.placeholder.com/80x80/00B4D8/FFFFFF?text=R"
                    }
                    alt="Profile" 
                    className="profile-photo"
                  />
                  <div>
                    <button className="btn-secondary">
                      <span className="material-symbols-outlined">photo_camera</span>
                      Change Photo
                    </button>
                    <p className="hint-text">JPG or PNG. Max size 2MB</p>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  {userRole === 'Doctor' && (
                    <div className="form-group">
                      <label>Specialty</label>
                      <input
                        type="text"
                        name="specialty"
                        value={formData.specialty}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'clinic' && (
              <div className="settings-section">
                <div className="section-header">
                  <h3>Clinic Information</h3>
                  <p>Manage your clinic details and working hours</p>
                </div>

                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Clinic Name</label>
                    <input
                      type="text"
                      name="clinicName"
                      value={formData.clinicName}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Address</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="form-input"
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label>Working Hours (Start)</label>
                    <input
                      type="time"
                      name="workStart"
                      value={formData.workStart}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Working Hours (End)</label>
                    <input
                      type="time"
                      name="workEnd"
                      value={formData.workEnd}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="settings-section">
                <div className="section-header">
                  <h3>Appearance</h3>
                  <p>Customize the look and feel of your dashboard</p>
                </div>

                <div className="theme-selector">
                  <div 
                    className={`theme-option ${selectedTheme === 'light' ? 'selected' : ''}`}
                    onClick={() => setSelectedTheme('light')}
                  >
                    <span className="material-symbols-outlined">light_mode</span>
                    <div>
                      <h4>Light Mode</h4>
                      <p>Classic bright interface</p>
                    </div>
                    {selectedTheme === 'light' && (
                      <span className="material-symbols-outlined check-icon">check_circle</span>
                    )}
                  </div>

                  <div 
                    className={`theme-option ${selectedTheme === 'dark' ? 'selected' : ''}`}
                    onClick={() => setSelectedTheme('dark')}
                  >
                    <span className="material-symbols-outlined">dark_mode</span>
                    <div>
                      <h4>Dark Mode</h4>
                      <p>Easy on the eyes</p>
                    </div>
                    {selectedTheme === 'dark' && (
                      <span className="material-symbols-outlined check-icon">check_circle</span>
                    )}
                  </div>

                  <div 
                    className={`theme-option ${selectedTheme === 'auto' ? 'selected' : ''}`}
                    onClick={() => setSelectedTheme('auto')}
                  >
                    <span className="material-symbols-outlined">brightness_auto</span>
                    <div>
                      <h4>Auto</h4>
                      <p>Matches system settings</p>
                    </div>
                    {selectedTheme === 'auto' && (
                      <span className="material-symbols-outlined check-icon">check_circle</span>
                    )}
                  </div>
                </div>

                <div className="color-scheme-section">
                  <h4>Accent Color</h4>
                  <p className="scheme-desc">Choose your preferred brand color</p>
                  <div className="color-options">
                    <div className="color-swatch active" style={{backgroundColor: '#0EA5E9'}} title="Sky Blue"></div>
                    <div className="color-swatch" style={{backgroundColor: '#10B981'}} title="Emerald"></div>
                    <div className="color-swatch" style={{backgroundColor: '#8B5CF6'}} title="Violet"></div>
                    <div className="color-swatch" style={{backgroundColor: '#F59E0B'}} title="Amber"></div>
                    <div className="color-swatch" style={{backgroundColor: '#EF4444'}} title="Red"></div>
                    <div className="color-swatch" style={{backgroundColor: '#EC4899'}} title="Pink"></div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="settings-section">
                <div className="section-header">
                  <h3>Notification Preferences</h3>
                  <p>Choose how you want to be notified</p>
                </div>

                <div className="notification-options">
                  <div className="notification-item">
                    <div className="notification-info">
                      <span className="material-symbols-outlined">email</span>
                      <div>
                        <h4>Email Notifications</h4>
                        <p>Receive updates via email</p>
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notifications.email}
                        onChange={() => handleNotificationChange('email')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="notification-item">
                    <div className="notification-info">
                      <span className="material-symbols-outlined">calendar_today</span>
                      <div>
                        <h4>Appointment Reminders</h4>
                        <p>Get notified about upcoming appointments</p>
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notifications.appointments}
                        onChange={() => handleNotificationChange('appointments')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  {userRole === 'Receptionist' && (
                    <div className="notification-item">
                      <div className="notification-info">
                        <span className="material-symbols-outlined">payments</span>
                        <div>
                          <h4>Payment Alerts</h4>
                          <p>Notifications for payments and invoices</p>
                        </div>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={notifications.payments}
                          onChange={() => handleNotificationChange('payments')}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="settings-section">
                <div className="section-header">
                  <h3>Security Settings</h3>
                  <p>Manage your password and account security</p>
                </div>

                <div className="security-card">
                  <span className="material-symbols-outlined">lock</span>
                  <div>
                    <h4>Change Password</h4>
                    <p>Update your password regularly for better security</p>
                  </div>
                  <button className="btn-secondary">Change</button>
                </div>

                <div className="security-card">
                  <span className="material-symbols-outlined">shield</span>
                  <div>
                    <h4>Two-Factor Authentication</h4>
                    <p>Add an extra layer of security to your account</p>
                  </div>
                  <button className="btn-secondary">Enable</button>
                </div>

                <div className="security-card">
                  <span className="material-symbols-outlined">devices</span>
                  <div>
                    <h4>Active Sessions</h4>
                    <p>Manage devices where you're currently logged in</p>
                  </div>
                  <button className="btn-secondary">View</button>
                </div>

                <div className="danger-zone">
                  <h4>Danger Zone</h4>
                  <p>Irreversible actions that affect your account</p>
                  <button className="btn-danger">
                    <span className="material-symbols-outlined">delete</span>
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;