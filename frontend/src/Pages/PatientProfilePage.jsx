import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientLayout from '../components/PatientLayout';
import {
    FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBell, FaTimes, FaSignOutAlt,
    FaCog, FaLock, FaBirthdayCake, FaGenderless, FaEdit, FaSave, FaTimes as FaClose,
    FaGlobe, FaCheck
} from 'react-icons/fa';
import './PatientProfilePage.css';

const PatientProfilePage = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('Guest');
    const [userEmail, setUserEmail] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [language, setLanguage] = useState('en');
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');
    const dropdownRef = useRef(null);
    const notifRef = useRef(null);

    const [profileData, setProfileData] = useState({
        fullName: 'Mario Sameh',
        email: 'mariosameh18@gmail.com',
        phone: '+20 123 456 7890',
        dateOfBirth: '1995-05-15',
        gender: 'Male',
        address: 'Cairo, Egypt',
        medicalHistory: 'No chronic diseases'
    });

    const [editData, setEditData] = useState(profileData);

    const translations = {
        en: {
            myProfile: 'My Profile',
            accountSettings: 'Account Settings',
            personalInformation: 'Personal Information',
            fullName: 'Full Name',
            email: 'Email Address',
            phone: 'Phone Number',
            dateOfBirth: 'Date of Birth',
            gender: 'Gender',
            address: 'Address',
            medicalHistory: 'Medical History',
            edit: 'Edit Profile',
            save: 'Save Changes',
            cancel: 'Cancel',
            securitySettings: 'Security Settings',
            changePassword: 'Change Password',
            currentPassword: 'Current Password',
            newPassword: 'New Password',
            confirmPassword: 'Confirm Password',
            twoFactorAuth: 'Two-Factor Authentication',
            enable: 'Enable',
            languagePreferences: 'Language Preferences',
            selectLanguage: 'Select Your Language',
            notifications: 'Notifications',
            emailNotifications: 'Email Notifications',
            appointmentReminders: 'Appointment Reminders',
            prescriptionUpdates: 'Prescription Updates',
            privacySettings: 'Privacy Settings',
            profileVisibility: 'Profile Visibility',
            public: 'Public',
            private: 'Private',
            logout: 'Logout',
            saved: 'Profile saved successfully!'
        },
        ar: {
            myProfile: 'ملفي الشخصي',
            accountSettings: 'إعدادات الحساب',
            personalInformation: 'معلومات شخصية',
            fullName: 'الاسم الكامل',
            email: 'عنوان البريد الإلكتروني',
            phone: 'رقم الهاتف',
            dateOfBirth: 'تاريخ الميلاد',
            gender: 'الجنس',
            address: 'العنوان',
            medicalHistory: 'السجل الطبي',
            edit: 'تعديل الملف الشخصي',
            save: 'حفظ التغييرات',
            cancel: 'إلغاء',
            securitySettings: 'إعدادات الأمان',
            changePassword: 'تغيير كلمة المرور',
            currentPassword: 'كلمة المرور الحالية',
            newPassword: 'كلمة المرور الجديدة',
            confirmPassword: 'تأكيد كلمة المرور',
            twoFactorAuth: 'المصادقة الثنائية',
            enable: 'تفعيل',
            languagePreferences: 'تفضيلات اللغة',
            selectLanguage: 'اختر لغتك',
            notifications: 'الإشعارات',
            emailNotifications: 'إشعارات البريد الإلكتروني',
            appointmentReminders: 'تذكيرات المواعيد',
            prescriptionUpdates: 'تحديثات الوصفات الطبية',
            privacySettings: 'إعدادات الخصوصية',
            profileVisibility: 'ظهور الملف الشخصي',
            public: 'عام',
            private: 'خاص',
            logout: 'تسجيل الخروج',
            saved: 'تم حفظ الملف الشخصي بنجاح!'
        }
    };

    const t = translations[language];

    useEffect(() => {
        const storedUser = localStorage.getItem('userName');
        const storedEmail = localStorage.getItem('userEmail');
        const storedLanguage = localStorage.getItem('language') || 'en';

        if (storedUser) setUserName(storedUser);
        if (storedEmail) setUserEmail(storedEmail);
        setLanguage(storedLanguage);

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        navigate('/login');
    };

    const handleSave = () => {
        setProfileData(editData);
        localStorage.setItem('userName', editData.fullName);
        localStorage.setItem('userEmail', editData.email);
        setUserName(editData.fullName);
        setUserEmail(editData.email);
        setIsEditing(false);
        alert(t.saved);
    };

    const handleLanguageChange = (newLanguage) => {
        setLanguage(newLanguage);
        localStorage.setItem('language', newLanguage);
    };

    const getUserInitials = () => {
        return userName
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <PatientLayout>
            <div className="profile-page-content" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="profile-container">
                    <div className="profile-header">
                        <h1>{t.myProfile}</h1>
                        <p>Manage your account settings and preferences</p>
                    </div>

                    <div className="profile-content">
                        {/* Tabs Navigation */}
                        <div className="profile-tabs">
                            <button 
                                className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
                                onClick={() => setActiveTab('personal')}
                            >
                                <FaUser /> {t.personalInformation}
                            </button>
                            <button 
                                className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                                onClick={() => setActiveTab('security')}
                            >
                                <FaLock /> {t.securitySettings}
                            </button>
                            <button 
                                className={`tab-btn ${activeTab === 'language' ? 'active' : ''}`}
                                onClick={() => setActiveTab('language')}
                        >
                            <FaGlobe /> {t.languagePreferences}
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
                            onClick={() => setActiveTab('notifications')}
                        >
                            <FaBell /> {t.notifications}
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
                            onClick={() => setActiveTab('privacy')}
                        >
                            <FaCog /> {t.privacySettings}
                        </button>
                    </div>

                    {/* Main Section */}
                    <main className="profile-main">
                        {/* Personal Information */}
                        {activeTab === 'personal' && (
                        <section id="personal" className="profile-section">
                            <div className="section-header">
                                <h2><FaUser /> {t.personalInformation}</h2>
                                {!isEditing && (
                                    <button className="edit-btn" onClick={() => { setIsEditing(true); setEditData(profileData); }}>
                                        <FaEdit /> {t.edit}
                                    </button>
                                )}
                            </div>

                            {!isEditing ? (
                                <div className="profile-details">
                                    <div className="detail-item">
                                        <label>{t.fullName}</label>
                                        <p>{profileData.fullName}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>{t.email}</label>
                                        <p>{profileData.email}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>{t.phone}</label>
                                        <p>{profileData.phone}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>{t.dateOfBirth}</label>
                                        <p>{profileData.dateOfBirth}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>{t.gender}</label>
                                        <p>{profileData.gender}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>{t.address}</label>
                                        <p>{profileData.address}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>{t.medicalHistory}</label>
                                        <p>{profileData.medicalHistory}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="edit-form">
                                    <div className="form-group">
                                        <label>{t.fullName}</label>
                                        <input 
                                            type="text" 
                                            value={editData.fullName}
                                            onChange={(e) => setEditData({...editData, fullName: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>{t.email}</label>
                                        <input 
                                            type="email" 
                                            value={editData.email}
                                            onChange={(e) => setEditData({...editData, email: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>{t.phone}</label>
                                        <input 
                                            type="tel" 
                                            value={editData.phone}
                                            onChange={(e) => setEditData({...editData, phone: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>{t.dateOfBirth}</label>
                                        <input 
                                            type="date" 
                                            value={editData.dateOfBirth}
                                            onChange={(e) => setEditData({...editData, dateOfBirth: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>{t.gender}</label>
                                        <select 
                                            value={editData.gender}
                                            onChange={(e) => setEditData({...editData, gender: e.target.value})}
                                        >
                                            <option>Male</option>
                                            <option>Female</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>{t.address}</label>
                                        <input 
                                            type="text" 
                                            value={editData.address}
                                            onChange={(e) => setEditData({...editData, address: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>{t.medicalHistory}</label>
                                        <textarea 
                                            value={editData.medicalHistory}
                                            onChange={(e) => setEditData({...editData, medicalHistory: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-actions">
                                        <button className="save-btn" onClick={handleSave}>
                                            <FaSave /> {t.save}
                                        </button>
                                        <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                                            <FaTimes /> {t.cancel}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </section>
                        )}

                        {/* Security Settings */}
                        {activeTab === 'security' && (
                        <section id="security" className="profile-section">
                            <h2><FaLock /> {t.securitySettings}</h2>
                            <div className="settings-group">
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <h4>{t.changePassword}</h4>
                                        <p>Update your password regularly for better security</p>
                                    </div>
                                    <button className="setting-btn">Change</button>
                                </div>
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <h4>{t.twoFactorAuth}</h4>
                                        <p>Add an extra layer of security to your account</p>
                                    </div>
                                    <button className="setting-btn">{t.enable}</button>
                                </div>
                            </div>
                        </section>
                        )}

                        {/* Language Preferences */}
                        {activeTab === 'language' && (
                        <section id="language" className="profile-section">
                            <h2><FaGlobe /> {t.languagePreferences}</h2>
                            <div className="language-options">
                                <button 
                                    className={`language-btn ${language === 'en' ? 'active' : ''}`}
                                    onClick={() => handleLanguageChange('en')}
                                >
                                    <FaCheck /> English
                                </button>
                                <button 
                                    className={`language-btn ${language === 'ar' ? 'active' : ''}`}
                                    onClick={() => handleLanguageChange('ar')}
                                >
                                    <FaCheck /> العربية
                                </button>
                            </div>
                        </section>
                        )}

                        {/* Notifications */}
                        {activeTab === 'notifications' && (
                        <section id="notifications" className="profile-section">
                            <h2><FaBell /> {t.notifications}</h2>
                            <div className="settings-group">
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <h4>{t.appointmentReminders}</h4>
                                        <p>Get notified about upcoming appointments</p>
                                    </div>
                                    <label className="toggle-switch">
                                        <input type="checkbox" defaultChecked />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <h4>{t.prescriptionUpdates}</h4>
                                        <p>Receive updates about your prescriptions</p>
                                    </div>
                                    <label className="toggle-switch">
                                        <input type="checkbox" defaultChecked />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <h4>{t.emailNotifications}</h4>
                                        <p>Receive email notifications for important updates</p>
                                    </div>
                                    <label className="toggle-switch">
                                        <input type="checkbox" defaultChecked />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                            </div>
                        </section>
                        )}

                        {/* Privacy Settings */}
                        {activeTab === 'privacy' && (
                        <section id="privacy" className="profile-section">
                            <h2><FaCog /> {t.privacySettings}</h2>
                            <div className="settings-group">
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <h4>{t.profileVisibility}</h4>
                                        <p>Control who can see your profile information</p>
                                    </div>
                                    <select className="privacy-select">
                                        <option>Private</option>
                                        <option>Public</option>
                                    </select>
                                </div>
                            </div>
                        </section>
                        )}
                    </main>
                    </div>
                </div>
            </div>
        </PatientLayout>
    );
};

export default PatientProfilePage;
