import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Inbox } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { appointmentsAPI } from '../services/apiConfig';
import './AppointmentsTable.css';

const STATUS_MAP_NUM = { 0: 'Upcoming', 1: 'Completed', 2: 'Cancelled', 3: 'In Progress', 4: 'No Show' };

const STATUS_STYLE = {
  Completed:   { bg: '#ECFDF5', color: '#059669', dot: '#10B981' },
  Upcoming:    { bg: '#EFF6FF', color: '#2563EB', dot: '#3B82F6' },
  Cancelled:   { bg: '#FEF2F2', color: '#DC2626', dot: '#EF4444' },
  'In Progress':{ bg: '#FFFBEB', color: '#D97706', dot: '#F59E0B' },
  'No Show':   { bg: '#F8FAFC', color: '#64748B', dot: '#94A3B8' },
};

const AVATAR_COLORS = [
  { bg: '#EFF6FF', color: '#2563EB' },
  { bg: '#ECFDF5', color: '#059669' },
  { bg: '#FFF7ED', color: '#C2410C' },
  { bg: '#F5F3FF', color: '#7C3AED' },
  { bg: '#FFF1F2', color: '#BE123C' },
];

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).filter(Boolean).slice(0,2).join('').toUpperCase();
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const parts = timeStr.toString().split(':');
  if (parts.length < 2) return timeStr;
  const h = parseInt(parts[0]);
  const m = parts[1];
  return `${(h % 12 || 12).toString().padStart(2,'0')}:${m} ${h >= 12 ? 'PM' : 'AM'}`;
}

const AppointmentsTable = ({ selectedDate }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState('');

  const getTimeStatus = (aptDate, aptTime) => {
    const now = new Date();
    const [h, m] = aptTime.split(':');
    const dt = new Date(aptDate);
    dt.setHours(parseInt(h), parseInt(m), 0, 0);
    const diff = (dt - now) / 60000;
    if (diff >= -15 && diff <= 15) return t('dashboard.now');
    if (diff > 15) return t('dashboard.upcoming');
    return t('dashboard.late');
  };

  const loadAppointments = async () => {
    try {
      const data = await appointmentsAPI.getAll();
      const transformed = data
        .filter(a => a && a.patientName)
        .map((a, i) => ({
          ...a,
          time: formatTime(a.appointmentTime),
          statusLabel: STATUS_MAP_NUM[a.status] || 'Upcoming',
          timeStatus: getTimeStatus(a.appointmentDate, a.appointmentTime),
          _avatarStyle: AVATAR_COLORS[i % AVATAR_COLORS.length],
        }));
      setAppointments(transformed);
    } catch { setAppointments([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    loadAppointments();
    const iv = setInterval(loadAppointments, 30000);
    return () => clearInterval(iv);
  }, []);

  let filtered = appointments;
  if (filter !== 'All') filtered = filtered.filter(a => a.statusLabel.toLowerCase() === filter.toLowerCase());
  if (search) filtered = filtered.filter(a =>
    a.patientName.toLowerCase().includes(search.toLowerCase()) ||
    (a.patientId && a.patientId.toString().toLowerCase().includes(search.toLowerCase()))
  );
  if (selectedDate) {
    const ds = typeof selectedDate === 'string' ? selectedDate : selectedDate.toLocaleDateString('en-CA');
    filtered = filtered.filter(a => {
      const aptDate = typeof a.appointmentDate === 'string'
        ? a.appointmentDate.split('T')[0]
        : a.appointmentDate.toLocaleDateString('en-CA');
      return aptDate === ds;
    });
  }

  const handleViewMedicalRecord = (apt) => {
    const id = apt.patientId?.trim() || `P-${apt.patientName.replace(/\s+/g,'').substring(0,5).toUpperCase()}`;
    navigate(`/doctor/view-medical-record/${encodeURIComponent(id)}`);
  };

  const notify = (msg) => { setNotification(msg); setTimeout(() => setNotification(''), 4000); };

  const dateLabel = selectedDate
    ? (typeof selectedDate === 'string'
        ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }))
    : null;

  return (
    <div className="apt-container">
      {/* Header */}
      <div className="apt-header">
        <div className="apt-header-top">
          <div className="apt-title-block">
            <h3>{t('dashboard.todaysAppointments')}</h3>
            <p>
              {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })}
            </p>
          </div>
          <div className="apt-filters">
            {['All','Completed','Cancelled','Upcoming'].map(f => (
              <button key={f}
                className={`apt-filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}>
                {t(`dashboard.${f.toLowerCase()}`)}
              </button>
            ))}
            <button className="apt-refresh-btn" onClick={() => { setLoading(true); loadAppointments(); }}>
              <span style={{ fontSize: '0.9rem' }}>↺</span>
              {t('dashboard.refresh')}
            </button>
          </div>
        </div>

        {/* Search + date badge */}
        <div className="apt-search-row">
          <div className="apt-search-wrap">
            <span className="apt-search-icon material-symbols-outlined">search</span>
            <input
              className="apt-search-input"
              type="text"
              placeholder={t('dashboard.searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="apt-clear-btn" onClick={() => setSearch('')}>
                <span className="material-symbols-outlined" style={{ fontSize:'1rem' }}>close</span>
              </button>
            )}
          </div>
          {dateLabel && (
            <div className="apt-date-badge">
              <span className="material-symbols-outlined">calendar_today</span>
              {dateLabel}
              <button className="apt-date-clear" onClick={() => window.location.reload()}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="apt-table-wrap">
        <table className="apt-table">
          <thead>
            <tr>
              <th>{t('dashboard.time')}</th>
              <th>{t('dashboard.patient')} {t('common.name')}</th>
              <th>{t('dashboard.patient')} ID</th>
              <th>{t('dashboard.status')}</th>
              <th>{t('common.action')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5">
                  <div className="apt-empty">
                    <div className="apt-empty-icon"><Loader2 size={28} className="apt-spin" /></div>
                    <div className="apt-empty-title">{t('common.loading')}</div>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="5">
                  <div className="apt-empty">
                    <div className="apt-empty-icon"><Inbox size={28} /></div>
                    <div className="apt-empty-title">{t('dashboard.noAppointments')}</div>
                    <div className="apt-empty-sub">No records match your current filters</div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((apt, i) => {
                const ss = STATUS_STYLE[apt.statusLabel] || STATUS_STYLE.Upcoming;
                const dynamicId = apt.patientId || `P-${apt.patientName.replace(/\s+/g,'').substring(0,5).toUpperCase()}`;
                return (
                  <tr key={i}>
                    {/* Time */}
                    <td>
                      <div className="apt-time-cell">
                        <div className="apt-time-dot" style={{ background: ss.dot }} />
                        <span className="apt-time-text">{apt.time}</span>
                      </div>
                    </td>

                    {/* Patient */}
                    <td>
                      <div className="apt-patient-cell">
                        <div className="apt-avatar"
                          style={{ background: apt._avatarStyle.bg, color: apt._avatarStyle.color }}>
                          {getInitials(apt.patientName)}
                        </div>
                        <div>
                          <div className="apt-patient-name">{apt.patientName}</div>
                        </div>
                      </div>
                    </td>

                    {/* ID */}
                    <td><span className="apt-id-chip">{dynamicId}</span></td>

                    {/* Status */}
                    <td>
                      <span className="apt-status-badge"
                        style={{ background: ss.bg, color: ss.color }}>
                        <span className="apt-status-dot" style={{ background: ss.dot }} />
                        {apt.statusLabel}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="apt-actions">
                        <button className="apt-btn apt-btn-details"
                          onClick={() => navigate(`/doctor/appointment-details/${apt.appointmentId}`)}>
                          Details
                        </button>
                        <button className="apt-btn apt-btn-emr"
                          onClick={() => handleViewMedicalRecord(apt)}>
                          EMR
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="apt-footer">
        <span className="apt-footer-count">
          Showing {filtered.length} of {appointments.length} appointments
        </span>
        <button className="apt-view-all-btn"
          onClick={() => navigate('/doctor/appointments')}>
          View All →
        </button>
      </div>

      {notification && <div className="apt-toast">{notification}</div>}
    </div>
  );
};

export default AppointmentsTable;