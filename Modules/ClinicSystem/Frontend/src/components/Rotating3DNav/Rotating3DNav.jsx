import React, { useState } from 'react';
import './Rotating3DNav.css';

const navItems = [
  {
    label: 'Home',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
        <polyline points="9 21 9 12 15 12 15 21"/>
      </svg>
    ),
  },
  {
    label: 'Appointments',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    label: 'Our Doctors',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    label: 'Eye Tests',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    ),
  },
  {
    label: 'Contact',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6.08 6.08l.98-.98a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
  },
];

const stats = [
  { label: 'Patients Today', value: '48', color: '#1565c0' },
  { label: 'Appointments', value: '32', color: '#0891b2' },
  { label: 'Doctors On Duty', value: '6', color: '#059669' },
  { label: 'Avg. Wait Time', value: '12 min', color: '#7c3aed' },
];

const Rotating3DNav = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="rn-wrapper">
      <nav className="rn-nav">
        <div className="rn-brand">
          <svg className="rn-brand-eye" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3" fill="white" stroke="none"/>
          </svg>
        </div>
        <ul className="rn-list">
          {navItems.map((item, i) => (
            <li
              key={i}
              className={`rn-item ${activeIndex === i ? 'rn-item--active' : ''}`}
              onClick={() => setActiveIndex(i)}
            >
              <div className="rn-icon-wrap">{item.icon}</div>
              <span className="rn-label">{item.label}</span>
            </li>
          ))}
        </ul>
      </nav>

      <main className="rn-content">
        <div className="rn-header-bar">
          <div>
            <h1 className="rn-title">EyeVengers Clinic</h1>
            <p className="rn-subtitle">Advanced Ophthalmology & Vision Care</p>
          </div>
          <div className="rn-header-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Live Dashboard
          </div>
        </div>

        <div className="rn-stats">
          {stats.map((s, i) => (
            <div className="rn-stat-card" key={i} style={{ borderTop: `4px solid ${s.color}` }}>
              <span className="rn-stat-value" style={{ color: s.color }}>{s.value}</span>
              <span className="rn-stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="rn-panels">
          <div className="rn-panel">
            <h3>Today's Appointments</h3>
            {[
              { name: 'Sara Ahmed', time: '10:00 AM', status: 'checked-in' },
              { name: 'Mohamed Khalid', time: '10:30 AM', status: 'waiting' },
              { name: 'Nour Hassan', time: '11:00 AM', status: 'scheduled' },
              { name: 'Ali Ibrahim', time: '11:30 AM', status: 'scheduled' },
            ].map((a, i) => (
              <div className="rn-appt-row" key={i}>
                <div className="rn-appt-info">
                  <span className="rn-appt-name">{a.name}</span>
                  <span className="rn-appt-time">{a.time}</span>
                </div>
                <span className={`rn-appt-status rn-appt-status--${a.status}`}>{a.status}</span>
              </div>
            ))}
          </div>

          <div className="rn-panel">
            <h3>Quick Actions</h3>
            <div className="rn-actions">
              <button className="rn-btn rn-btn--primary">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Book Appointment
              </button>
              <button className="rn-btn rn-btn--outline">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                New Patient
              </button>
              <button className="rn-btn rn-btn--outline">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                Eye Test Report
              </button>
              <button className="rn-btn rn-btn--outline">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12"/></svg>
                Contact Patient
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Rotating3DNav;
