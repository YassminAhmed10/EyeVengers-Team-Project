import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './Settings.css';

function SettingsPage() {
  const { t, language, changeLanguage } = useLanguage();
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
  const [availability, setAvailability] = useState({
    sunday: { enabled: true, start: '09:00', end: '17:00' },
    monday: { enabled: true, start: '09:00', end: '17:00' },
    tuesday: { enabled: true, start: '09:00', end: '17:00' },
    wednesday: { enabled: true, start: '09:00', end: '17:00' },
    thursday: { enabled: true, start: '09:00', end: '17:00' },
    friday: { enabled: false, start: '09:00', end: '17:00' },
    saturday: { enabled: false, start: '09:00', end: '17:00' }
  });
  const [selectedDates, setSelectedDates] = useState(() => {
    const saved = localStorage.getItem('doctorAvailability');
    return saved ? JSON.parse(saved) : {};
  });
  const [dateRange, setDateRange] = useState(() => {
    const saved = localStorage.getItem('doctorAvailabilityDateRange');
    if (saved) {
      return JSON.parse(saved);
    }
    const today = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(today.getMonth() + 3);
    return {
      startDate: today.toISOString().split('T')[0],
      endDate: threeMonthsLater.toISOString().split('T')[0]
    };
  });
  const [profilePhoto, setProfilePhoto] = useState(() => {
    return localStorage.getItem('doctorProfilePhoto') || '/src/images/doctor.jpg';
  });
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);

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
    // Save profile photo to localStorage
    localStorage.setItem('doctorProfilePhoto', profilePhoto);
    localStorage.setItem('doctorName', formData.name);
    localStorage.setItem('doctorEmail', formData.email);
    localStorage.setItem('doctorPhone', formData.phone);
    localStorage.setItem('doctorAvailability', JSON.stringify(availability));
    localStorage.setItem('doctorAvailabilityDateRange', JSON.stringify(dateRange));
    localStorage.setItem('doctorSelectedDates', JSON.stringify(selectedDates));
    
    // Show detailed success message
    const enabledDays = Object.entries(availability)
      .filter(([, schedule]) => schedule.enabled)
      .map(([day, schedule]) => `${day.charAt(0).toUpperCase() + day.slice(1)}: ${schedule.start} - ${schedule.end}`)
      .join('\n');
    
    const selectedDatesCount = Object.values(selectedDates).filter(d => d.enabled).length;
    
    alert(`✅ ${t('settings.settingsSaved')}\n\n📅 ${t('settings.workingHoursUpdated')}:\n${enabledDays || t('settings.noWorkingDays')}\n\n📆 ${t('settings.selectedDates')}: ${selectedDatesCount} ${t('settings.days')}\n\n🔔 ${t('settings.appointmentsUpdated')}`);
    
    // Trigger a custom event to notify other components
    window.dispatchEvent(new Event('profileUpdated'));
    window.dispatchEvent(new Event('availabilityUpdated'));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
        // Save to localStorage immediately
        localStorage.setItem('doctorProfilePhoto', reader.result);
        // Trigger event to update Header
        window.dispatchEvent(new Event('profileUpdated'));
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'account', label: t('settings.account'), icon: 'person' },
    { id: 'language', label: t('settings.language'), icon: 'language' },
    { id: 'availability', label: t('settings.availability'), icon: 'event_available' },
    { id: 'notifications', label: t('settings.notifications'), icon: 'notifications' },
    { id: 'security', label: t('settings.security'), icon: 'lock' }
  ];

  const getPageTitle = () => {
    if (userRole === 'Doctor') {
      return t('settings.doctorSettings');
    } else if (userRole === 'Receptionist') {
      return t('settings.receptionistSettings');
    }
    return t('settings.title');
  };

  const getPageSubtitle = () => {
    if (userRole === 'Doctor') {
      return t('settings.doctorSubtitle');
    } else if (userRole === 'Receptionist') {
      return t('settings.receptionistSubtitle');
    }
    return t('settings.subtitle');
  };

  if (!userRole) {
    return <div>{t('common.loading')}</div>;
  }

  return (
    <div className="settings-wrapper" data-lang={language}>
      <div className="settings-page" style={{ marginLeft: 0 }}>
        <div className="settings-header">
          <div>
            <h2 className="settings-title">{getPageTitle()}</h2>
            <p className="settings-subtitle">{getPageSubtitle()}</p>
          </div>
          <button className="btn-save" onClick={handleSave}>
            <span className="material-symbols-outlined">save</span>
            {t('common.save')}
          </button>
        </div>

        <div className="settings-container">
          <div className="settings-tabs">
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
                  <h3>{t('settings.accountInfo')}</h3>
                  <p>{t('settings.updateDetails')}</p>
                </div>

                <div className="profile-photo-section">
                  <img 
                    src={profilePhoto}
                    alt="Profile" 
                    className="profile-photo"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/80x80/0077B6/FFFFFF?text=DR';
                    }}
                  />
                  <div>
                    <input
                      type="file"
                      id="photoUpload"
                      accept="image/png, image/jpeg"
                      onChange={handlePhotoChange}
                      style={{ display: 'none' }}
                    />
                    <button 
                      className="btn-secondary"
                      onClick={() => document.getElementById('photoUpload').click()}
                    >
                      <span className="material-symbols-outlined">photo_camera</span>
                      {t('settings.changePhoto')}
                    </button>
                    <p className="hint-text">{t('settings.photoHint')}</p>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>{t('settings.fullName')}</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('settings.email')}</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('settings.phone')}</label>
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
                      <label>{t('settings.specialty')}</label>
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

            {activeTab === 'language' && (
              <div className="settings-section">
                <div className="section-header">
                  <h3>{t('settings.languageSettings')}</h3>
                  <p>{t('settings.chooseLanguage')}</p>
                </div>

                <div className="language-selector">
                  <div 
                    className={`language-option ${language === 'en' ? 'selected' : ''}`}
                    onClick={() => changeLanguage('en')}
                  >
                    <div className="language-flag">🇬🇧</div>
                    <div>
                      <h4>English</h4>
                      <p>Default language</p>
                    </div>
                    {language === 'en' && (
                      <span className="material-symbols-outlined check-icon">check_circle</span>
                    )}
                  </div>

                  <div 
                    className={`language-option ${language === 'ar' ? 'selected' : ''}`}
                    onClick={() => changeLanguage('ar')}
                  >
                    <div className="language-flag">🇪🇬</div>
                    <div>
                      <h4>العربية</h4>
                      <p>اللغة العربية</p>
                    </div>
                    {language === 'ar' && (
                      <span className="material-symbols-outlined check-icon">check_circle</span>
                    )}
                  </div>
                </div>

                <div className="language-note">
                  <span className="material-symbols-outlined">info</span>
                  <p>{t('settings.languageNote')}</p>
                </div>
              </div>
            )}

            {activeTab === 'availability' && (
              <div className="settings-section">
                <div className="section-header">
                  <h3>{t('settings.workingHours')}</h3>
                  <p>{t('settings.selectDate')}</p>
                </div>

                {/* Main Container: Calendar + Time Slots Side by Side */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr',
                  gap: '30px',
                  alignItems: 'start'
                }}>
                  
                  {/* LEFT: Calendar Section */}
                  <div style={{
                    padding: '32px',
                    background: 'white',
                    borderRadius: '16px',
                    border: '2px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                  {/* Month/Year Navigation */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '32px'
                  }}>
                    <button
                      onClick={() => {
                        if (currentMonth === 0) {
                          setCurrentMonth(11);
                          setCurrentYear(currentYear - 1);
                        } else {
                          setCurrentMonth(currentMonth - 1);
                        }
                      }}
                      style={{
                        padding: '12px 24px',
                        background: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '20px',
                        color: '#6b7280',
                        transition: 'all 0.2s'
                      }}
                    >
                      ‹
                    </button>
                    
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: '#111827'
                    }}>
                      {language === 'ar' 
                        ? `${t(`calendar.${new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long' }).toLowerCase()}`)} ${currentYear}`
                        : new Date(currentYear, currentMonth).toLocaleDateString('en-US', { 
                            month: 'long', 
                            year: 'numeric' 
                          })
                      }
                    </div>
                    
                    <button
                      onClick={() => {
                        if (currentMonth === 11) {
                          setCurrentMonth(0);
                          setCurrentYear(currentYear + 1);
                        } else {
                          setCurrentMonth(currentMonth + 1);
                        }
                      }}
                      style={{
                        padding: '12px 24px',
                        background: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '20px',
                        color: '#6b7280',
                        transition: 'all 0.2s'
                      }}
                    >
                      ›
                    </button>
                  </div>

                  {/* Calendar Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '8px'
                  }}>
                    {/* Day Headers */}
                    {[
                      { key: 'sunday', short: language === 'ar' ? t('calendar.days.sun') : 'Sun' },
                      { key: 'monday', short: language === 'ar' ? t('calendar.days.mon') : 'Mon' },
                      { key: 'tuesday', short: language === 'ar' ? t('calendar.days.tue') : 'Tue' },
                      { key: 'wednesday', short: language === 'ar' ? t('calendar.days.wed') : 'Wed' },
                      { key: 'thursday', short: language === 'ar' ? t('calendar.days.thu') : 'Thu' },
                      { key: 'friday', short: language === 'ar' ? t('calendar.days.fri') : 'Fri' },
                      { key: 'saturday', short: language === 'ar' ? t('calendar.days.sat') : 'Sat' }
                    ].map(day => (
                      <div key={day.key} style={{
                        padding: '14px',
                        textAlign: 'center',
                        fontWeight: '600',
                        fontSize: '13px',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {day.short}
                      </div>
                    ))}

                    {/* Calendar Days */}
                    {(() => {
                      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                      const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
                      const days = [];
                      
                      // Empty cells before first day
                      for (let i = 0; i < firstDayOfMonth; i++) {
                        days.push(<div key={`empty-${i}`} style={{ padding: '30px' }}></div>);
                      }
                      
                      // Days of the month
                      for (let day = 1; day <= daysInMonth; day++) {
                        const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const dayData = selectedDates[dateString];
                        const isAvailable = dayData?.enabled;
                        const hasTimeSlots = dayData?.timeSlots && dayData.timeSlots.length > 0;
                        const isSelected = selectedDate === dateString;
                        
                        days.push(
                          <div
                            key={day}
                            onClick={() => {
                              setSelectedDate(dateString);
                              // Initialize with default time range if not already configured
                              if (!selectedDates[dateString]) {
                                setSelectedDates(prev => ({
                                  ...prev,
                                  [dateString]: {
                                    enabled: true,
                                    startTime: '09:00',
                                    endTime: '17:00'
                                  }
                                }));
                              }
                            }}
                            style={{
                              padding: '20px 16px',
                              minHeight: '90px',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              border: '2px solid',
                              borderColor: isSelected 
                                ? (isAvailable === false ? '#dc2626' : '#3b82f6')
                                : (isAvailable === false ? '#ef4444' : '#e5e7eb'),
                              background: isSelected
                                ? (isAvailable === false ? '#dc2626' : '#3b82f6')
                                : (isAvailable === false ? '#fecaca' : '#ffffff'),
                              transition: 'all 0.2s ease',
                              position: 'relative',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center'
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            <div style={{
                              fontSize: '20px',
                              fontWeight: '700',
                              color: isSelected ? '#ffffff' : (isAvailable === false ? '#dc2626' : '#111827')
                            }}>
                              {day}
                            </div>
                          </div>
                        );
                      }
                      
                      return days;
                    })()}
                  </div>

                  {/* Legend */}
                  <div style={{
                    marginTop: '24px',
                    padding: '18px 24px',
                    background: '#f9fafb',
                    borderRadius: '12px',
                    display: 'flex',
                    gap: '28px',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    borderTop: '1px solid #e5e7eb'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '4px',
                        background: '#3b82f6',
                        border: '2px solid #2563eb'
                      }}></div>
                      <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>{t('settings.selected')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '4px',
                        background: '#fee2e2',
                        border: '2px solid #ef4444'
                      }}></div>
                      <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>{t('settings.unavailable')}</span>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Time Slots Panel */}
                <div style={{
                  padding: '28px',
                  background: 'white',
                  borderRadius: '16px',
                  border: '2px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  height: 'fit-content',
                  position: 'sticky',
                  top: '20px'
                }}>
                  {/* Header */}
                  <div style={{
                    marginBottom: '24px',
                    paddingBottom: '18px',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '8px'
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '26px', color: '#111827' }}>
                        schedule
                      </span>
                      <h3 style={{ margin: 0, fontSize: '19px', fontWeight: '600', color: '#111827' }}>
                        {t('settings.workingHoursTitle')}
                      </h3>
                    </div>
                    {selectedDate ? (
                      <p style={{
                        margin: 0,
                        fontSize: '15px',
                        fontWeight: '500',
                        color: '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                          event
                        </span>
                        {new Date(selectedDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { 
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    ) : (
                      <p style={{
                        margin: 0,
                        fontSize: '14px',
                        color: '#9ca3af',
                        fontStyle: 'italic'
                      }}>
                        {t('settings.selectDate')}
                      </p>
                    )}
                    {selectedDate && selectedDates[selectedDate]?.startTime && selectedDates[selectedDate]?.endTime && (
                      <p style={{
                        margin: '8px 0 0 0',
                        fontSize: '13px',
                        color: '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                          schedule
                        </span>
                        {selectedDates[selectedDate].startTime} - {selectedDates[selectedDate].endTime}
                      </p>
                    )}
                  </div>

                  {!selectedDate && (
                    <div style={{
                      padding: '60px 20px',
                      textAlign: 'center',
                      color: '#9ca3af'
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '60px', opacity: 0.3 }}>
                        event_note
                      </span>
                      <p style={{ margin: '16px 0 0 0', fontWeight: '500', fontSize: '15px', color: '#6b7280' }}>
                        {t('settings.selectDate')}
                      </p>
                    </div>
                  )}

                  {selectedDate && (
                    <>
                      {/* Mark Unavailable Toggle */}
                      <div style={{
                        marginBottom: '20px',
                        padding: '14px 16px',
                        background: '#fef3c7',
                        border: '1px solid #fbbf24',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{ fontSize: '13px', fontWeight: '500', color: '#92400e' }}>
                          {t('settings.markUnavailable')}
                        </span>
                        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={selectedDates[selectedDate]?.enabled === false}
                            onChange={(e) => {
                              setSelectedDates(prev => ({
                                ...prev,
                                [selectedDate]: {
                                  enabled: !e.target.checked,
                                  startTime: e.target.checked ? '' : (prev[selectedDate]?.startTime || '09:00'),
                                  endTime: e.target.checked ? '' : (prev[selectedDate]?.endTime || '17:00')
                                }
                              }));
                            }}
                            style={{
                              width: '18px',
                              height: '18px',
                              cursor: 'pointer'
                            }}
                          />
                        </label>
                      </div>

                      {/* Working Hours Section */}
                      {selectedDates[selectedDate]?.enabled !== false && (
                        <div>
                        <div style={{
                          marginBottom: '16px'
                        }}>
                            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#111827' }}>
                              {t('settings.workingHoursTitle')}
                            </h4>
                            <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                              {t('settings.appointmentsNote')}
                            </p>
                        </div>

                        {/* Start and End Time */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '16px',
                          padding: '16px',
                          background: '#f9fafb',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb'
                        }}>
                          <div>
                            <label style={{
                              display: 'block',
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#374151',
                              marginBottom: '8px'
                            }}>
                              {t('settings.startTime')}
                            </label>
                            <input
                              type="time"
                              value={selectedDates[selectedDate]?.startTime || '09:00'}
                              onChange={(e) => {
                                setSelectedDates(prev => ({
                                  ...prev,
                                  [selectedDate]: {
                                    ...prev[selectedDate],
                                    startTime: e.target.value
                                  }
                                }));
                              }}
                              style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '6px',
                                border: '1px solid #d1d5db',
                                fontSize: '14px',
                                fontWeight: '500'
                              }}
                            />
                          </div>
                          <div>
                            <label style={{
                              display: 'block',
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#374151',
                              marginBottom: '8px'
                            }}>
                              {t('settings.endTime')}
                            </label>
                            <input
                              type="time"
                              value={selectedDates[selectedDate]?.endTime || '17:00'}
                              onChange={(e) => {
                                setSelectedDates(prev => ({
                                  ...prev,
                                  [selectedDate]: {
                                    ...prev[selectedDate],
                                    endTime: e.target.value
                                  }
                                }));
                              }}
                              style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '6px',
                                border: '1px solid #d1d5db',
                                fontSize: '14px',
                                fontWeight: '500'
                              }}
                            />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{
                          marginTop: '20px',
                          paddingTop: '16px',
                          borderTop: '1px solid #e5e7eb',
                          display: 'flex',
                          gap: '10px'
                        }}>
                          <button
                            onClick={() => {
                              setSelectedDates(prev => {
                                const newDates = { ...prev };
                                delete newDates[selectedDate];
                                return newDates;
                              });
                            }}
                            style={{
                              flex: 1,
                              padding: '10px',
                              background: 'transparent',
                              color: '#6b7280',
                              border: '1px solid #d1d5db',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = '#f9fafb';
                              e.target.style.borderColor = '#9ca3af';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'transparent';
                              e.target.style.borderColor = '#d1d5db';
                            }}
                          >
                            {t('settings.clearDay')}
                          </button>
                          <button
                            onClick={() => {
                              // Save to localStorage and dispatch event
                              localStorage.setItem('doctorAvailability', JSON.stringify(selectedDates));
                              window.dispatchEvent(new CustomEvent('availabilityUpdated', { 
                                detail: selectedDates 
                              }));
                              alert(t('settings.saveAvailability') + ' ' + t('common.save').toLowerCase() + 'd successfully!');
                            }}
                            style={{
                              flex: 1,
                              padding: '10px',
                              background: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#2563eb'}
                            onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
                          >
                            {t('settings.saveAvailability')}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Unavailable Message */}
                    {selectedDates[selectedDate]?.enabled === false && (
                      <div style={{
                        padding: '40px',
                        textAlign: 'center',
                        color: '#dc2626',
                        background: '#fee2e2',
                        borderRadius: '10px'
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '50px' }}>
                          event_busy
                        </span>
                        <p style={{ margin: '12px 0 0 0', fontWeight: '700', fontSize: '16px' }}>
                          {t('settings.unavailableMessage')}
                        </p>
                      </div>
                    )}
                    </>
                  )}
                </div>

                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="settings-section">
                <div className="section-header">
                  <h3>{t('settings.notificationPrefs')}</h3>
                  <p>{t('settings.chooseNotifications')}</p>
                </div>

                <div className="notification-options">
                  <div className="notification-item">
                    <div className="notification-info">
                      <span className="material-symbols-outlined">email</span>
                      <div>
                        <h4>{t('settings.emailNotifications')}</h4>
                        <p>{t('settings.emailNotificationsDesc')}</p>
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
                        <h4>{t('settings.appointmentReminders')}</h4>
                        <p>{t('settings.appointmentRemindersDesc')}</p>
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
                          <h4>{t('settings.paymentAlerts')}</h4>
                          <p>{t('settings.paymentAlertsDesc')}</p>
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
                  <h3>{t('settings.securitySettings')}</h3>
                  <p>{t('settings.managePassword')}</p>
                </div>

                <div className="security-card">
                  <span className="material-symbols-outlined">lock</span>
                  <div>
                    <h4>{t('settings.changePassword')}</h4>
                    <p>{t('settings.changePasswordDesc')}</p>
                  </div>
                  <button className="btn-secondary">{t('settings.change')}</button>
                </div>

                <div className="security-card">
                  <span className="material-symbols-outlined">shield</span>
                  <div>
                    <h4>{t('settings.twoFactorAuth')}</h4>
                    <p>{t('settings.twoFactorAuthDesc')}</p>
                  </div>
                  <button className="btn-secondary">{t('settings.enable')}</button>
                </div>

                <div className="security-card">
                  <span className="material-symbols-outlined">devices</span>
                  <div>
                    <h4>{t('settings.activeSessions')}</h4>
                    <p>{t('settings.activeSessionsDesc')}</p>
                  </div>
                  <button className="btn-secondary">{t('common.view')}</button>
                </div>

                <div className="danger-zone">
                  <h4>{t('settings.dangerZone')}</h4>
                  <p>{t('settings.dangerZoneDesc')}</p>
                  <button className="btn-danger">
                    <span className="material-symbols-outlined">delete</span>
                    {t('settings.deleteAccount')}
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
