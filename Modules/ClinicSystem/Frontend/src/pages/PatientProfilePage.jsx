// src/Pages/PatientProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientLayout from '../components/PatientLayout';
import {
    FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt,
    FaBirthdayCake, FaEdit, FaSave, FaTimes,
    FaGlobe, FaCheck, FaLock, FaBell, FaCog,
    FaShieldAlt, FaIdCard,
} from 'react-icons/fa';

// ── Read patient data from localStorage (keys saved by SignUpPage) ─────────────
const readFromStorage = () => ({
    fullName:    localStorage.getItem('userName')          || localStorage.getItem('patientName') || '',
    email:       localStorage.getItem('userEmail')         || localStorage.getItem('patientEmail') || '',
    phone:       localStorage.getItem('patientPhone')      || '',
    dateOfBirth: localStorage.getItem('patientDateOfBirth')|| '',
});

// ── Helpers ────────────────────────────────────────────────────────────────────
const initials = (name) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

const formatDate = (iso) => {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'long', year: 'numeric',
        });
    } catch { return iso; }
};

const calcAge = (dob) => {
    if (!dob) return null;
    const diff = Date.now() - new Date(dob).getTime();
    const age  = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    return isNaN(age) ? null : age;
};

// ── Tabs ───────────────────────────────────────────────────────────────────────
const TABS = [
    { id: 'personal',  icon: <FaUser />,      label: 'Personal Info' },
    { id: 'security',  icon: <FaLock />,      label: 'Security' },
    { id: 'language',  icon: <FaGlobe />,     label: 'Language' },
    { id: 'notif',     icon: <FaBell />,      label: 'Notifications' },
    { id: 'privacy',   icon: <FaCog />,       label: 'Privacy' },
];

// ── Translations ───────────────────────────────────────────────────────────────
const T = {
    en: {
        title: 'My Profile', subtitle: 'Manage your account information',
        fullName: 'Full Name', email: 'Email Address',
        phone: 'Phone Number', dob: 'Date of Birth',
        age: 'Age', edit: 'Edit', save: 'Save Changes',
        cancel: 'Cancel', saved: 'Profile updated!',
        noData: 'Not provided',
        security: 'Security Settings', changePass: 'Change Password',
        twoFactor: 'Two-Factor Authentication', enable: 'Enable',
        lang: 'Language Preferences',
        notif: 'Notifications', apptReminder: 'Appointment Reminders',
        rxUpdates: 'Prescription Updates', emailNotif: 'Email Notifications',
        privacy: 'Privacy Settings', profileVis: 'Profile Visibility',
    },
    ar: {
        title: 'ملفي الشخصي', subtitle: 'إدارة معلومات حسابك',
        fullName: 'الاسم الكامل', email: 'البريد الإلكتروني',
        phone: 'رقم الهاتف', dob: 'تاريخ الميلاد',
        age: 'العمر', edit: 'تعديل', save: 'حفظ التغييرات',
        cancel: 'إلغاء', saved: 'تم تحديث الملف!',
        noData: 'غير محدد',
        security: 'الأمان', changePass: 'تغيير كلمة المرور',
        twoFactor: 'المصادقة الثنائية', enable: 'تفعيل',
        lang: 'اللغة',
        notif: 'الإشعارات', apptReminder: 'تذكيرات المواعيد',
        rxUpdates: 'تحديثات الوصفات', emailNotif: 'إشعارات البريد',
        privacy: 'الخصوصية', profileVis: 'ظهور الملف',
    },
};

// ══════════════════════════════════════════════════════════════════════════════
export default function PatientProfilePage() {
    const navigate = useNavigate();

    const [lang,    setLang]    = useState(localStorage.getItem('language') || 'en');
    const [tab,     setTab]     = useState('personal');
    const [editing, setEditing] = useState(false);
    const [flash,   setFlash]   = useState('');

    const [profile, setProfile] = useState(readFromStorage);
    const [draft,   setDraft]   = useState(profile);

    // Re-read whenever tab changes (in case another page updated storage)
    useEffect(() => {
        const fresh = readFromStorage();
        setProfile(fresh);
        setDraft(fresh);
    }, [tab]);

    const t   = T[lang] || T.en;
    const isAr = lang === 'ar';
    const age  = calcAge(profile.dateOfBirth);

    const handleSave = () => {
        // Persist back to localStorage using same keys as SignUpPage
        localStorage.setItem('userName',           draft.fullName);
        localStorage.setItem('patientName',        draft.fullName);
        localStorage.setItem('userEmail',          draft.email);
        localStorage.setItem('patientEmail',       draft.email);
        localStorage.setItem('patientPhone',       draft.phone);
        localStorage.setItem('patientDateOfBirth', draft.dateOfBirth);

        setProfile({ ...draft });
        setEditing(false);
        setFlash(t.saved);
        setTimeout(() => setFlash(''), 3000);
    };

    const changeLang = (l) => {
        setLang(l);
        localStorage.setItem('language', l);
    };

    // ── Info field component ─────────────────────────────────────────────────
    const InfoRow = ({ icon, label, value, extra }) => (
        <div style={s.infoRow}>
            <div style={s.infoIcon}>{icon}</div>
            <div style={s.infoBody}>
                <span style={s.infoLabel}>{label}</span>
                <span style={s.infoValue}>{value || <em style={{ color: '#aaa' }}>{t.noData}</em>}</span>
                {extra && <span style={s.infoExtra}>{extra}</span>}
            </div>
        </div>
    );

    // ── Edit field ────────────────────────────────────────────────────────────
    const EditField = ({ label, name, type = 'text', placeholder }) => (
        <div style={s.fieldGroup}>
            <label style={s.fieldLabel}>{label}</label>
            <input
                type={type}
                value={draft[name] || ''}
                onChange={e => setDraft({ ...draft, [name]: e.target.value })}
                placeholder={placeholder}
                style={s.fieldInput}
            />
        </div>
    );

    // ── Toggle switch ─────────────────────────────────────────────────────────
    const Toggle = ({ defaultOn = true }) => {
        const [on, setOn] = useState(defaultOn);
        return (
            <button
                onClick={() => setOn(!on)}
                style={{
                    ...s.toggle,
                    background: on ? '#0D47A1' : '#d1d5db',
                }}
            >
                <span style={{ ...s.toggleDot, transform: on ? 'translateX(22px)' : 'translateX(2px)' }} />
            </button>
        );
    };

    // ── Setting row ───────────────────────────────────────────────────────────
    const SettingRow = ({ title, desc, control }) => (
        <div style={s.settingRow}>
            <div>
                <p style={s.settingTitle}>{title}</p>
                <p style={s.settingDesc}>{desc}</p>
            </div>
            {control}
        </div>
    );

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <PatientLayout>
            <div style={{ ...s.page, direction: isAr ? 'rtl' : 'ltr' }}>

                {/* ── Hero banner ── */}
                <div style={s.hero}>
                    <div style={s.heroInner}>
                        <div style={s.avatar}>{initials(profile.fullName)}</div>
                        <div>
                            <h1 style={s.heroName}>{profile.fullName || '—'}</h1>
                            <p style={s.heroSub}>{profile.email || t.noData}</p>
                            {age && (
                                <span style={s.ageBadge}>{age} years old</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Flash message ── */}
                {flash && (
                    <div style={s.flash}>
                        <FaCheck style={{ marginRight: 8 }} /> {flash}
                    </div>
                )}

                {/* ── Main card ── */}
                <div style={s.card}>

                    {/* Tabs */}
                    <div style={s.tabs}>
                        {TABS.map(tb => (
                            <button
                                key={tb.id}
                                onClick={() => { setTab(tb.id); setEditing(false); }}
                                style={{
                                    ...s.tabBtn,
                                    ...(tab === tb.id ? s.tabBtnActive : {}),
                                }}
                            >
                                <span style={{ marginRight: 6 }}>{tb.icon}</span>
                                {tb.label}
                            </button>
                        ))}
                    </div>

                    {/* ── Personal Info tab ── */}
                    {tab === 'personal' && (
                        <div style={s.tabContent}>
                            <div style={s.tabHeader}>
                                <h2 style={s.tabTitle}><FaIdCard style={{ marginRight: 8 }} />{t.title}</h2>
                                {!editing && (
                                    <button style={s.editBtn} onClick={() => setEditing(true)}>
                                        <FaEdit style={{ marginRight: 6 }} />{t.edit}
                                    </button>
                                )}
                            </div>

                            {!editing ? (
                                <div style={s.infoGrid}>
                                    <InfoRow icon={<FaUser />}         label={t.fullName}  value={profile.fullName} />
                                    <InfoRow icon={<FaEnvelope />}     label={t.email}     value={profile.email} />
                                    <InfoRow icon={<FaPhone />}        label={t.phone}     value={profile.phone} />
                                    <InfoRow
                                        icon={<FaBirthdayCake />}
                                        label={t.dob}
                                        value={formatDate(profile.dateOfBirth)}
                                        extra={age ? `${age} years old` : null}
                                    />
                                </div>
                            ) : (
                                <div>
                                    <div style={s.editGrid}>
                                        <EditField label={t.fullName}  name="fullName"    placeholder="Your full name" />
                                        <EditField label={t.email}     name="email"       type="email" placeholder="your@email.com" />
                                        <EditField label={t.phone}     name="phone"       type="tel"   placeholder="+20 xxx xxx xxxx" />
                                        <EditField label={t.dob}       name="dateOfBirth" type="date" />
                                    </div>
                                    <div style={s.editActions}>
                                        <button style={s.saveBtn} onClick={handleSave}>
                                            <FaSave style={{ marginRight: 6 }} />{t.save}
                                        </button>
                                        <button style={s.cancelBtn} onClick={() => { setEditing(false); setDraft(profile); }}>
                                            <FaTimes style={{ marginRight: 6 }} />{t.cancel}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Security tab ── */}
                    {tab === 'security' && (
                        <div style={s.tabContent}>
                            <h2 style={s.tabTitle}><FaShieldAlt style={{ marginRight: 8 }} />{t.security}</h2>
                            <SettingRow
                                title={t.changePass}
                                desc="Update your password regularly for better security"
                                control={<button style={s.editBtn}>Change</button>}
                            />
                            <SettingRow
                                title={t.twoFactor}
                                desc="Add an extra layer of security to your account"
                                control={<button style={s.editBtn}>{t.enable}</button>}
                            />
                        </div>
                    )}

                    {/* ── Language tab ── */}
                    {tab === 'language' && (
                        <div style={s.tabContent}>
                            <h2 style={s.tabTitle}><FaGlobe style={{ marginRight: 8 }} />{t.lang}</h2>
                            <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
                                {['en', 'ar'].map(l => (
                                    <button
                                        key={l}
                                        onClick={() => changeLang(l)}
                                        style={{
                                            ...s.langBtn,
                                            ...(lang === l ? s.langBtnActive : {}),
                                        }}
                                    >
                                        {lang === l && <FaCheck style={{ marginRight: 8, color: '#0D47A1' }} />}
                                        {l === 'en' ? '🇬🇧 English' : '🇪🇬 العربية'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Notifications tab ── */}
                    {tab === 'notif' && (
                        <div style={s.tabContent}>
                            <h2 style={s.tabTitle}><FaBell style={{ marginRight: 8 }} />{t.notif}</h2>
                            <SettingRow title={t.apptReminder}  desc="Get notified about upcoming appointments" control={<Toggle />} />
                            <SettingRow title={t.rxUpdates}     desc="Receive updates about your prescriptions" control={<Toggle />} />
                            <SettingRow title={t.emailNotif}    desc="Receive email notifications"              control={<Toggle defaultOn={false} />} />
                        </div>
                    )}

                    {/* ── Privacy tab ── */}
                    {tab === 'privacy' && (
                        <div style={s.tabContent}>
                            <h2 style={s.tabTitle}><FaCog style={{ marginRight: 8 }} />{t.privacy}</h2>
                            <SettingRow
                                title={t.profileVis}
                                desc="Control who can see your profile information"
                                control={
                                    <select style={s.select}>
                                        <option>Private</option>
                                        <option>Public</option>
                                    </select>
                                }
                            />
                        </div>
                    )}
                </div>
            </div>
        </PatientLayout>
    );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = {
    page: {
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #f0f5ff 0%, #e8f0fe 60%, #f5f8ff 100%)',
        fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
        paddingBottom: 60,
    },

    // Hero
    hero: {
        background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #1976D2 100%)',
        padding: '48px 40px 52px',
        position: 'relative',
        overflow: 'hidden',
    },
    heroInner: {
        maxWidth: 900, margin: '0 auto',
        display: 'flex', alignItems: 'center', gap: 28,
    },
    avatar: {
        width: 88, height: 88, borderRadius: '50%', flexShrink: 0,
        background: 'rgba(255,255,255,0.22)',
        border: '3px solid rgba(255,255,255,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '2rem', fontWeight: 800, color: '#fff',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    },
    heroName: { margin: 0, fontSize: '2rem', fontWeight: 800, color: '#fff' },
    heroSub:  { margin: '4px 0 10px', fontSize: '0.95rem', color: 'rgba(255,255,255,0.75)' },
    ageBadge: {
        display: 'inline-block',
        background: 'rgba(255,255,255,0.18)',
        border: '1px solid rgba(255,255,255,0.3)',
        color: '#fff', fontSize: '0.78rem', fontWeight: 700,
        padding: '3px 12px', borderRadius: 999,
    },

    // Flash
    flash: {
        maxWidth: 900, margin: '16px auto 0',
        padding: '12px 20px', borderRadius: 10,
        background: '#e6f4ea', border: '1px solid #a8d5b5',
        color: '#2e7d32', fontWeight: 600, fontSize: '0.9rem',
        display: 'flex', alignItems: 'center',
    },

    // Card
    card: {
        maxWidth: 900, margin: '28px auto 0',
        background: '#fff',
        borderRadius: 20,
        boxShadow: '0 4px 32px rgba(13,71,161,0.10)',
        overflow: 'hidden',
    },

    // Tabs
    tabs: {
        display: 'flex', borderBottom: '1px solid #e8f0fe',
        background: '#f8faff', overflowX: 'auto',
    },
    tabBtn: {
        padding: '16px 24px',
        background: 'none', border: 'none', borderBottom: '3px solid transparent',
        fontFamily: 'inherit', fontSize: '0.88rem', fontWeight: 600,
        color: '#64748b', cursor: 'pointer', whiteSpace: 'nowrap',
        display: 'flex', alignItems: 'center', transition: 'all 0.2s',
    },
    tabBtnActive: {
        color: '#0D47A1', borderBottomColor: '#0D47A1',
        background: '#fff',
    },

    // Tab content
    tabContent: { padding: '36px 40px' },
    tabHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
    tabTitle:   { margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0D47A1', display: 'flex', alignItems: 'center', marginBottom: 24 },

    // Info grid
    infoGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 8,
    },
    infoRow: {
        display: 'flex', alignItems: 'flex-start', gap: 14,
        padding: '18px 20px', borderRadius: 12,
        background: '#f8faff', border: '1px solid #e8f0fe',
    },
    infoIcon: {
        width: 36, height: 36, borderRadius: '50%',
        background: '#e8f0fe', color: '#0D47A1',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, fontSize: '0.9rem',
    },
    infoBody:  { display: 'flex', flexDirection: 'column', gap: 3 },
    infoLabel: { fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' },
    infoValue: { fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' },
    infoExtra: { fontSize: '0.75rem', color: '#64748b' },

    // Edit grid
    editGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20,
    },
    fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
    fieldLabel: { fontSize: '0.8rem', fontWeight: 700, color: '#0D47A1', textTransform: 'uppercase', letterSpacing: '0.4px' },
    fieldInput: {
        padding: '12px 14px', borderRadius: 10,
        border: '1.5px solid #e2e8f0', fontSize: '0.95rem',
        fontFamily: 'inherit', background: '#f8faff',
        transition: 'border-color 0.2s',
        outline: 'none',
    },
    editActions: { display: 'flex', gap: 12, marginTop: 24 },

    // Buttons
    editBtn: {
        display: 'inline-flex', alignItems: 'center',
        padding: '9px 20px', borderRadius: 9,
        background: '#e8f0fe', border: '1.5px solid #c5d8fa',
        color: '#0D47A1', fontWeight: 700, fontSize: '0.85rem',
        cursor: 'pointer', fontFamily: 'inherit',
    },
    saveBtn: {
        display: 'inline-flex', alignItems: 'center',
        padding: '11px 28px', borderRadius: 10,
        background: 'linear-gradient(135deg, #0D47A1, #1976D2)',
        border: 'none', color: '#fff', fontWeight: 700,
        fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit',
        boxShadow: '0 4px 14px rgba(13,71,161,0.3)',
    },
    cancelBtn: {
        display: 'inline-flex', alignItems: 'center',
        padding: '11px 20px', borderRadius: 10,
        background: '#f1f5f9', border: '1.5px solid #e2e8f0',
        color: '#64748b', fontWeight: 600, fontSize: '0.9rem',
        cursor: 'pointer', fontFamily: 'inherit',
    },

    // Setting row
    settingRow: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px', marginBottom: 12,
        background: '#f8faff', borderRadius: 12, border: '1px solid #e8f0fe',
    },
    settingTitle: { margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' },
    settingDesc:  { margin: '4px 0 0', fontSize: '0.82rem', color: '#94a3b8' },

    // Toggle
    toggle: {
        width: 48, height: 26, borderRadius: 999, border: 'none',
        cursor: 'pointer', position: 'relative', transition: 'background 0.25s', flexShrink: 0,
    },
    toggleDot: {
        position: 'absolute', top: 3,
        width: 20, height: 20, borderRadius: '50%',
        background: '#fff', transition: 'transform 0.25s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
    },

    // Language
    langBtn: {
        padding: '16px 28px', borderRadius: 12,
        border: '2px solid #e2e8f0', background: '#f8faff',
        fontWeight: 600, fontSize: '1rem', cursor: 'pointer',
        fontFamily: 'inherit', color: '#475569',
        display: 'flex', alignItems: 'center', transition: 'all 0.2s',
    },
    langBtnActive: {
        borderColor: '#0D47A1', background: '#e8f0fe', color: '#0D47A1',
        boxShadow: '0 0 0 3px rgba(13,71,161,0.08)',
    },

    // Select
    select: {
        padding: '9px 14px', borderRadius: 8,
        border: '1.5px solid #e2e8f0', background: '#fff',
        fontWeight: 600, color: '#334155', cursor: 'pointer', fontFamily: 'inherit',
    },
};