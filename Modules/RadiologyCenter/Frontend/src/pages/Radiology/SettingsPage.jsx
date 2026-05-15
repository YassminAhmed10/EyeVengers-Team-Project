import React from 'react';

export default function SettingsPage({ setPage }) {
  return (
    <div style={{ padding: 40, minHeight: '60vh' }}>
      <h1 style={{ fontSize: 28, marginBottom: 10 }}>Settings</h1>
      <p style={{ color: '#6b7280', marginBottom: 20 }}>Manage your account, preferences and help resources.</p>

      <div style={{ display: 'grid', gap: 12, maxWidth: 760 }}>
        <section style={{ background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 6px 20px rgba(0,0,0,0.04)' }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>Account</h3>
          <p style={{ color: '#6b7280', marginTop: 8 }}>Update your profile, password and connected accounts.</p>
        </section>

        <section style={{ background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 6px 20px rgba(0,0,0,0.04)' }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>Notifications</h3>
          <p style={{ color: '#6b7280', marginTop: 8 }}>Email and push preferences. Enable or disable the notifications you receive.</p>
        </section>

        <section style={{ background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 6px 20px rgba(0,0,0,0.04)' }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>Help & Support</h3>
          <p style={{ color: '#6b7280', marginTop: 8 }}>Visit our help center, view FAQs, or contact support.</p>
          <div style={{ marginTop: 12 }}>
            <button onClick={() => setPage('contact')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}>Contact Support</button>
          </div>
        </section>
      </div>
    </div>
  );
}
